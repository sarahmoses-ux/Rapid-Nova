import { createInterface } from 'node:readline/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { hashPassword } from './auth.js';
import { configuredDataDir } from './paths.js';

const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  const email = (await input.question('Admin email: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.');
  // Suppress terminal echo while collecting passwords.
  const askSecret = async prompt => {
    process.stdout.write(prompt);
    const original = input._writeToOutput;
    input._writeToOutput = () => {};
    try { return await input.question(''); }
    finally { input._writeToOutput = original; process.stdout.write('\n'); }
  };
  const password = await askSecret('Password (at least 12 characters): ');
  if (password.length < 12 || password.length > 256) throw new Error('Use 12–256 characters.');
  if (password !== await askSecret('Confirm password: ')) throw new Error('Passwords do not match.');
  const directory = configuredDataDir();
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  writeFileSync(resolve(directory, 'admin.json'), JSON.stringify({ email, passwordHash: await hashPassword(password) }), { mode: 0o600 });
  console.log('Admin configured. Restart the API, then sign in at /admin. Existing sessions will be invalidated.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { input.close(); }
