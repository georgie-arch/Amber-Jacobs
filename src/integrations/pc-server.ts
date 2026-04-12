/**
 * PC Bridge Server — Railway side
 *
 * Maintains a queue of pending PC tool calls. The local Mac bridge polls
 * this endpoint, executes tools locally, and posts results back.
 *
 * Endpoints (registered in index.ts):
 *   POST /bridge/poll    — bridge polls for next pending tool call
 *   POST /bridge/result  — bridge posts the result of a tool call
 *   GET  /bridge/status  — health check: is a bridge currently connected?
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'amber-bridge-secret-change-me';
const TOOL_TIMEOUT_MS = 30_000;

interface PendingCall {
  id: string;
  tool: string;
  args: Record<string, any>;
  resolve: (result: string) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

// Queue of calls waiting to be picked up by the bridge
const callQueue: PendingCall[] = [];

// Track when the bridge last polled (for status endpoint)
let lastBridgePollAt: Date | null = null;

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────────────────────

function authBridge(req: Request, res: Response): boolean {
  if (req.headers['x-bridge-secret'] !== BRIDGE_SECRET) {
    res.status(403).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ─── PUBLIC API: execute a PC tool (called by the Amber agent) ───────────────

export async function executePcTool(tool: string, args: Record<string, any> = {}): Promise<string> {
  if (!isBridgeConnected()) {
    throw new Error('PC Bridge is offline — make sure the bridge is running on your Mac');
  }

  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();

    const timer = setTimeout(() => {
      const idx = callQueue.findIndex(c => c.id === id);
      if (idx !== -1) callQueue.splice(idx, 1);
      reject(new Error(`PC tool "${tool}" timed out after ${TOOL_TIMEOUT_MS / 1000}s`));
    }, TOOL_TIMEOUT_MS);

    callQueue.push({ id, tool, args, resolve, reject, timer });
    logger.info(`[PC] Queued tool call: ${tool} (id=${id})`);
  });
}

export function isBridgeConnected(): boolean {
  if (!lastBridgePollAt) return false;
  // Consider connected if polled within the last 10 seconds
  return Date.now() - lastBridgePollAt.getTime() < 10_000;
}

// ─── EXPRESS ROUTE HANDLERS ──────────────────────────────────────────────────

export function handleBridgePoll(req: Request, res: Response): void {
  if (!authBridge(req, res)) return;

  lastBridgePollAt = new Date();

  const call = callQueue.shift();
  if (!call) {
    res.json(null);
    return;
  }

  logger.info(`[PC] Dispatching to bridge: ${call.tool} (id=${call.id})`);
  res.json({ id: call.id, tool: call.tool, args: call.args });
}

export function handleBridgeResult(req: Request, res: Response): void {
  if (!authBridge(req, res)) return;

  const { id, result, error } = req.body as {
    id: string;
    result?: string;
    error?: string;
  };

  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  // The call was already shifted off the queue when dispatched.
  // We match it via a separate resolver map.
  resolverMap.get(id)?.(result ?? '', error ?? null);
  resolverMap.delete(id);
  res.json({ ok: true });
}

export function handleBridgeStatus(_req: Request, res: Response): void {
  res.json({
    connected: isBridgeConnected(),
    lastSeen: lastBridgePollAt?.toISOString() ?? null,
    pendingCalls: callQueue.length
  });
}

// ─── RESOLVER MAP ────────────────────────────────────────────────────────────
// We can't hold the resolve/reject on the queue item after it's shifted off,
// so we keep a parallel map keyed by id.

const resolverMap = new Map<string, (result: string, error: string | null) => void>();

// Patch executePcTool to register in the resolver map
const _originalExecute = executePcTool;
export async function executePcToolSafe(tool: string, args: Record<string, any> = {}): Promise<string> {
  if (!isBridgeConnected()) {
    throw new Error('PC Bridge is offline — make sure the bridge is running on your Mac');
  }

  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();

    const timer = setTimeout(() => {
      resolverMap.delete(id);
      reject(new Error(`PC tool "${tool}" timed out after ${TOOL_TIMEOUT_MS / 1000}s`));
    }, TOOL_TIMEOUT_MS);

    resolverMap.set(id, (result, error) => {
      clearTimeout(timer);
      if (error) reject(new Error(error));
      else resolve(result);
    });

    callQueue.push({
      id, tool, args,
      resolve: (r) => resolverMap.get(id)?.(r, null),
      reject: (e) => resolverMap.get(id)?.('' , e.message),
      timer
    });

    logger.info(`[PC] Queued tool call: ${tool} (id=${id})`);
  });
}
