/** Exact-byte educational digest, not perceptual hashing or image protection. */
export async function demoFingerprint(source: string): Promise<string> {
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export const demoArt = [
  { name: 'Sage sunrise', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#263c35"/><circle cx="270" cy="90" r="48" fill="#d5ddb5"/><path d="M0 240L135 90L280 300H0Z" fill="#7c9777"/><path d="M150 300L310 145L400 240V300Z" fill="#b0bd93"/></svg>' },
  { name: 'Dusk horizon', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#393346"/><circle cx="110" cy="95" r="48" fill="#d3bfa8"/><path d="M0 230Q100 120 220 230T400 230V300H0Z" fill="#858477"/><path d="M0 270Q150 200 400 270V300H0Z" fill="#b7aa93"/></svg>' },
] as const;
