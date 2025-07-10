require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => {
    console.log('✅ Connected to PostgreSQL successfully');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('🕒 Server time:', res.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Connection error:', err.stack);
  })
  .finally(() => {
    client.end();
  });
