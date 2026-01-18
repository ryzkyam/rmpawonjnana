const express = require("express");
const { Pool } = require("pg");
const app = express();

app.use(express.json());

// Koneksi ke Postgres Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=require",
});

// 1. Endpoint Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(
    "SELECT * FROM admin WHERE username=$1 AND password=$2",
    [username, password],
  );
  if (result.rows.length > 0)
    res.json({ success: true, username: result.rows[0].username });
  else res.json({ success: false });
});

// 2. Endpoint Menu
app.get("/api/menu", async (req, res) => {
  const result = await pool.query("SELECT * FROM menu");
  res.json(result.rows);
});

// 3. Endpoint Checkout (Header & Detail)`
app.post("/api/checkout", async (req, res) => {
  const { metode_pembayaran, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const total = items.reduce(
      (sum, i) => sum + Number(i.qty) * Number(i.harga),
      0,
    );
    const payRes = await client.query(
      "INSERT INTO pembayaran (metode_pembayaran, total_bayar) VALUES ($1, $2) RETURNING id_transaksi",
      [metode_pembayaran, total],
    );
    const id_trans = payRes.rows[0].id_transaksi;

    for (const item of items) {
      await client.query(
        "INSERT INTO pesanan (id_transaksi, id_menu, qty, total_harga, status) VALUES ($1, $2, $3, $4, 'selesai')",
        [id_trans, item.id_menu, item.qty, item.qty * item.harga],
      );
    }
    await client.query("COMMIT");
    res.json({ success: true, id_transaksi: id_trans });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false });
  } finally {
    client.release();
  }
});

// 4. Endpoint Laporan (JOIN sesuai ERD lo)
app.get("/api/reports", async (req, res) => {
  const { from, to } = req.query;
  let query = `
    SELECT py.tanggal, py.id_transaksi, m.nama_menu as produk, ps.qty, m.harga, ps.total_harga as total
    FROM pembayaran py
    JOIN pesanan ps ON py.id_transaksi = ps.id_transaksi
    JOIN menu m ON ps.id_menu = m.id_menu
    WHERE 1=1`;

  const params = [];
  if (from) {
    params.push(from);
    query += ` AND py.tanggal >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    query += ` AND py.tanggal <= $${params.length}`;
  }

  const result = await pool.query(query + " ORDER BY py.tanggal DESC", params);
  res.json(result.rows);
});

module.exports = app;
