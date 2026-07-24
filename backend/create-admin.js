'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('SEED_ADMIN_EMAIL and a 12+ character SEED_ADMIN_PASSWORD are required');
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(name,email,password_hash,role,tenant_id)
     VALUES($1,$2,$3,'admin',$4)
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='admin'
    `,
    ['Verification Admin', email, passwordHash, `admin:${email}`],
  );
  console.log('Admin account is ready.');
  await pool.end();
}

main().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exitCode = 1;
});
