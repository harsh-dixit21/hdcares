const FORMAT = 'hdcares-encrypted-backup';
const encoder = new TextEncoder();
export const MAX_LOCKED_BYTES = 14_000_000;
const MAX_PLAINTEXT_BYTES = 10_000_000;

function encodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }
  return btoa(binary);
}

function decodeBytes(text: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(text), char => char.charCodeAt(0));
}

async function backupKey(password: string, salt: Uint8Array<ArrayBuffer>, operation: 'encrypt' | 'decrypt') {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, [operation]
  );
}

export async function unlockBackup(text: string, password: string): Promise<string> {
  if (encoder.encode(text).length > MAX_LOCKED_BYTES) throw new Error('Encrypted file is too large.');
  const data = JSON.parse(text);
  if (data?.format !== FORMAT || data.version !== 1 || typeof data.salt !== 'string' ||
      typeof data.iv !== 'string' || typeof data.ciphertext !== 'string') throw new Error('Unsupported encrypted backup.');
  const salt = decodeBytes(data.salt);
  const iv = decodeBytes(data.iv);
  const ciphertext = decodeBytes(data.ciphertext);
  if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16 ||
      ciphertext.length > MAX_PLAINTEXT_BYTES + 16) throw new Error('Invalid encrypted backup.');
  const key = await backupKey(password, salt, 'decrypt');
  const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export async function lockBackup(text: string, password: string): Promise<string> {
  const bytes = encoder.encode(text);
  if (bytes.length > MAX_PLAINTEXT_BYTES) throw new Error('Backup is too large.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await backupKey(password, salt, 'encrypt');
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
  return JSON.stringify({ format: FORMAT, version: 1, salt: encodeBytes(salt),
    iv: encodeBytes(iv), ciphertext: encodeBytes(new Uint8Array(ciphertext)) });
}
