/**
 * PC Bridge Client — runs LOCALLY on your Mac
 *
 * Polls Railway Amber every second for pending tool calls, executes them
 * locally, and posts results back. Run with:
 *
 *   npx ts-node src/integrations/pc-bridge.ts
 *
 * Or compile and run via the LaunchAgent (see com.amber.pcbridge.plist).
 */

import { exec } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { promisify } from 'util';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const BRIDGE_URL = process.env.BRIDGE_URL || 'https://amber-jacobs-production.up.railway.app';
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || 'amber-bridge-secret-change-me';
const POLL_INTERVAL_MS = 1000;

// ─── TOOL IMPLEMENTATIONS ────────────────────────────────────────────────────

async function shell(args: { command: string; timeout_ms?: number }): Promise<string> {
  const { stdout, stderr } = await execAsync(args.command, {
    timeout: args.timeout_ms || 30_000,
    cwd: process.env.HOME
  });
  const output = (stdout + (stderr ? `\nSTDERR: ${stderr}` : '')).trim();
  return output.slice(0, 8000); // cap output
}

async function readFile(args: { path: string }): Promise<string> {
  const fullPath = args.path.startsWith('~')
    ? args.path.replace('~', process.env.HOME || '/Users/georgeguise')
    : args.path;
  return readFileSync(fullPath, 'utf-8').slice(0, 8000);
}

async function writeFile(args: { path: string; content: string }): Promise<string> {
  const fullPath = args.path.startsWith('~')
    ? args.path.replace('~', process.env.HOME || '/Users/georgeguise')
    : args.path;
  writeFileSync(fullPath, args.content, 'utf-8');
  return `Written ${args.content.length} chars to ${fullPath}`;
}

async function listDir(args: { path: string }): Promise<string> {
  const fullPath = args.path.startsWith('~')
    ? args.path.replace('~', process.env.HOME || '/Users/georgeguise')
    : args.path;
  const entries = readdirSync(fullPath, { withFileTypes: true });
  return entries
    .map(e => {
      const stats = statSync(path.join(fullPath, e.name));
      const size = e.isFile() ? ` (${Math.round(stats.size / 1024)}KB)` : '';
      return `${e.isDirectory() ? '[DIR] ' : '[FILE]'} ${e.name}${size}`;
    })
    .join('\n');
}

async function findFiles(args: { name?: string; content?: string; path?: string }): Promise<string> {
  const searchPath = (args.path || '~').replace('~', process.env.HOME || '/Users/georgeguise');
  let cmd: string;

  if (args.content) {
    cmd = `grep -rl "${args.content.replace(/"/g, '\\"')}" "${searchPath}" 2>/dev/null | head -20`;
  } else {
    cmd = `find "${searchPath}" -name "*${args.name || ''}*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -20`;
  }

  const { stdout } = await execAsync(cmd);
  return stdout.trim() || 'No results found';
}

async function openApp(args: { name: string }): Promise<string> {
  await execAsync(`open -a "${args.name}"`);
  return `Opened ${args.name}`;
}

async function closeApp(args: { name: string }): Promise<string> {
  await execAsync(`osascript -e 'quit app "${args.name}"'`);
  return `Closed ${args.name}`;
}

async function getClipboard(): Promise<string> {
  const { stdout } = await execAsync('pbpaste');
  return stdout.slice(0, 2000);
}

async function setClipboard(args: { text: string }): Promise<string> {
  await execAsync(`printf '%s' "${args.text.replace(/'/g, "'\\''")}" | pbcopy`);
  return 'Clipboard updated';
}

async function getSystemInfo(): Promise<string> {
  const [cpu, mem, disk, uptime] = await Promise.all([
    execAsync("top -l 1 | grep 'CPU usage'").then(r => r.stdout.trim()),
    execAsync("vm_stat | head -5").then(r => r.stdout.trim()),
    execAsync("df -h / | tail -1").then(r => r.stdout.trim()),
    execAsync("uptime").then(r => r.stdout.trim())
  ]);
  return `CPU: ${cpu}\nMemory:\n${mem}\nDisk: ${disk}\nUptime: ${uptime}`;
}

async function getRunningApps(): Promise<string> {
  const { stdout } = await execAsync(
    `osascript -e 'tell application "System Events" to get name of every process whose background only is false'`
  );
  return stdout.trim();
}

async function getActiveWindow(): Promise<string> {
  const { stdout } = await execAsync(
    `osascript -e 'tell application "System Events" to get name of first process whose frontmost is true'`
  );
  return stdout.trim();
}

async function typeText(args: { text: string }): Promise<string> {
  const escaped = args.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  await execAsync(`osascript -e 'tell application "System Events" to keystroke "${escaped}"'`);
  return `Typed: ${args.text.substring(0, 50)}`;
}

async function runAppleScript(args: { script: string }): Promise<string> {
  const { stdout, stderr } = await execAsync(`osascript -e '${args.script.replace(/'/g, "'\\''")}'`);
  return (stdout + stderr).trim();
}

async function screenshot(args: { filename?: string }): Promise<string> {
  const outPath = args.filename || `/tmp/amber-screen-${Date.now()}.png`;
  await execAsync(`screencapture -x "${outPath}"`);
  const stats = statSync(outPath);
  return `Screenshot saved to ${outPath} (${Math.round(stats.size / 1024)}KB). Use read_file or shell to process it.`;
}

async function getNotifications(): Promise<string> {
  const { stdout } = await execAsync(
    `osascript -e 'tell application "System Events" to get every process whose background only is false'`
  );
  return stdout.trim();
}

// ─── TOOL REGISTRY ───────────────────────────────────────────────────────────

const TOOLS: Record<string, (args: any) => Promise<string>> = {
  shell,
  read_file: readFile,
  write_file: writeFile,
  list_dir: listDir,
  find_files: findFiles,
  open_app: openApp,
  close_app: closeApp,
  get_clipboard: getClipboard,
  set_clipboard: setClipboard,
  get_system_info: getSystemInfo,
  get_running_apps: getRunningApps,
  get_active_window: getActiveWindow,
  type_text: typeText,
  applescript: runAppleScript,
  screenshot
};

// ─── POLLING LOOP ────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  try {
    const res = await axios.post(`${BRIDGE_URL}/bridge/poll`, {}, {
      headers: { 'x-bridge-secret': BRIDGE_SECRET },
      timeout: 5000
    });

    const call = res.data;
    if (!call || !call.id) return;

    console.log(`[Bridge] ▶ ${call.tool}`, JSON.stringify(call.args || {}).slice(0, 100));

    let result = '';
    let error: string | null = null;

    try {
      const fn = TOOLS[call.tool];
      if (!fn) throw new Error(`Unknown tool: "${call.tool}". Available: ${Object.keys(TOOLS).join(', ')}`);
      result = await fn(call.args || {});
      console.log(`[Bridge] ✓ ${call.tool} → ${result.slice(0, 80)}`);
    } catch (e: any) {
      error = e.message;
      console.error(`[Bridge] ✗ ${call.tool} failed:`, error);
    }

    await axios.post(`${BRIDGE_URL}/bridge/result`, { id: call.id, result, error }, {
      headers: { 'x-bridge-secret': BRIDGE_SECRET },
      timeout: 10_000
    });

  } catch (e: any) {
    // Suppress connection errors — Railway may briefly restart
    if (!['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'].includes(e.code) && e.response?.status !== 502) {
      console.error('[Bridge] Poll error:', e.message);
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

console.log('');
console.log('╔══════════════════════════════════════╗');
console.log('║      Amber PC Bridge — Local         ║');
console.log('╚══════════════════════════════════════╝');
console.log(`Connected to: ${BRIDGE_URL}`);
console.log(`Tools available: ${Object.keys(TOOLS).join(', ')}`);
console.log('');
console.log('Polling... (Ctrl+C to stop)');
console.log('');

setInterval(poll, POLL_INTERVAL_MS);
