const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

if (process.env.NODE_ENV === 'production' && (!process.env.DB_PASSWORD || !process.env.DB_HOST)) throw new Error('Production database configuration is incomplete');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'bloodbank',
  user: process.env.DB_USER || 'postgres',
  password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD : (process.env.DB_PASSWORD || 'postgres'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

module.exports = pool;
