// Creates an admin account or resets its password.
//
//   npm run admin:user                 -> user "admin", random password written to storage/admin-password.txt
//   npm run admin:user -- <username>   -> same for another username
//   npm run admin:user -- <username> --ask   -> type the password yourself (hidden prompt)
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { ROOT, connect } from './lib.mjs';

const args = process.argv.slice(2);
const username = (args.find((a) => !a.startsWith('--')) ?? 'admin').trim().toLowerCase();
const ask = args.includes('--ask');

if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
  console.error('Username: 3-60 characters, letters, digits, dot, dash or underscore.');
  process.exit(1);
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

let password;
if (ask) {
  password = await promptHidden('New password (min 8 characters): ');
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
} else {
  password = crypto.randomBytes(12).toString('base64url');
}

const db = await connect();
const hash = await bcrypt.hash(password, 10);
const [[existing]] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
if (existing) {
  await db.query('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ?', [hash, existing.id]);
} else {
  await db.query("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, 'admin')", [username, hash, 'Administrator']);
}
await db.end();

if (ask) {
  console.log(`${existing ? 'Password updated for' : 'Created admin'} "${username}".`);
} else {
  const file = path.join(ROOT, 'storage', 'admin-password.txt');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `username: ${username}\npassword: ${password}\n\nChange it after the first login (Đổi mật khẩu), then delete this file.\n`, { mode: 0o600 });
  console.log(`${existing ? 'Password reset for' : 'Created admin'} "${username}". The password is in storage/admin-password.txt — change it after the first login.`);
}
