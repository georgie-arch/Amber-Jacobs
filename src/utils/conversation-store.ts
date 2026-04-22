import fs from 'fs';
import path from 'path';

// Root folder for all persistent conversation memory
const MEMORY_DIR = path.resolve(process.cwd(), 'src/data/memory');

interface StoredTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  platform?: string;
}

// Derive a stable, filesystem-safe identifier for a contact.
// Used as the folder name under src/data/memory/.
export function buildContactStoreId(contact: {
  whatsapp_number?: string | null;
  phone?: string | null;
  email?: string | null;
  id?: number;
}): string {
  const raw =
    contact.whatsapp_number
      ? `wa_${contact.whatsapp_number}`
      : contact.phone
      ? `phone_${contact.phone}`
      : contact.email
      ? `email_${contact.email}`
      : `contact_${contact.id ?? 'unknown'}`;
  // Strip filesystem-unsafe characters
  return raw.replace(/[^a-zA-Z0-9+@._-]/g, '_');
}

function contactDir(storeId: string): string {
  const dir = path.join(MEMORY_DIR, storeId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function historyPath(storeId: string): string {
  return path.join(contactDir(storeId), 'history.jsonl');
}

// Append a single turn (user or assistant) to the contact's history file.
// Each line is a self-contained JSON object so the file is append-only and
// never needs to be rewritten.
export function appendTurn(
  storeId: string,
  role: 'user' | 'assistant',
  content: string,
  platform?: string
): void {
  const turn: StoredTurn = {
    role,
    content,
    timestamp: new Date().toISOString(),
    ...(platform ? { platform } : {})
  };
  try {
    fs.appendFileSync(historyPath(storeId), JSON.stringify(turn) + '\n', 'utf8');
  } catch (err: any) {
    console.error(`[conversation-store] Failed to write turn for ${storeId}:`, err?.message);
  }
}

// Load the last `limit` complete turns from the history file.
// Returns an array ready to pass directly to the Claude messages array.
// Ensures alternation (user/assistant/user/...) and that the first turn is
// always from the user, as required by the Claude API.
export function loadHistory(
  storeId: string,
  limit = 200
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const file = historyPath(storeId);
  if (!fs.existsSync(file)) return [];

  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
  const recent = lines.slice(-limit);

  const turns: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const line of recent) {
    try {
      const t = JSON.parse(line) as StoredTurn;
      // Skip consecutive same-role entries (guards against partial writes)
      if (turns.length > 0 && turns[turns.length - 1].role === t.role) continue;
      turns.push({ role: t.role, content: t.content });
    } catch {
      // Skip malformed lines
    }
  }

  // Claude API requires the first message to be from the user
  while (turns.length > 0 && turns[0].role === 'assistant') turns.shift();

  return turns;
}
