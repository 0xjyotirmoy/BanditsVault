const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database table if it doesn't exist
const initDb = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ WARNING: DATABASE_URL is not set. Database operations will fail.');
      return;
    }
    const query = `
      CREATE TABLE IF NOT EXISTS vaults (
        vault_id VARCHAR(255) PRIMARY KEY,
        encrypted_content TEXT NOT NULL,
        encrypted_key_blob TEXT NOT NULL,
        blob_iv TEXT NOT NULL,
        content_type VARCHAR(255) NOT NULL,
        pin TEXT,
        expiry_time BIGINT NOT NULL,
        destruct_timer INTEGER NOT NULL DEFAULT 120,
        accessed BOOLEAN DEFAULT FALSE,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL
      );
    `;
    await pool.query(query);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_expiry_time ON vaults (expiry_time);');
    console.log('✅ PostgreSQL database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
};

initDb();

module.exports = { pool };
