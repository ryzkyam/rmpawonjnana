const pool = require("./db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { from, to } = req.query;
  let query = `
    SELECT py.tanggal, py.id_transaksi, m.nama_menu as produk,
           ps.qty, m.harga, ps.total_harga as total
    FROM pembayaran py
    JOIN pesanan ps ON py.id_transaksi = ps.id_transaksi
    JOIN menu m ON ps.id_menu = m.id_menu
    WHERE 1=1
  `;

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
}
