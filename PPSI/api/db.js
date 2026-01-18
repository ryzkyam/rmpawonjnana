const { Pool } = require('pg');

// Ambil Connection String dari Supabase (Settings > Database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Tetep export pool buat transaksi checkout
};