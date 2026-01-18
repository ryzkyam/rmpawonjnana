const pool = require("./db");

module.exports = async (req, res) => {
  const { from, to } = req.query;

  let q = `
    SELECT py.tanggal, py.id_transaksi,
           m.nama_menu, ps.qty, ps.total_harga
    FROM pembayaran py
    JOIN pesanan ps ON py.id_transaksi=ps.id_transaksi
    JOIN menu m ON ps.id_menu=m.id_menu
    WHERE 1=1
  `;

  const p = [];
  if (from) { p.push(from); q += ` AND py.tanggal >= $${p.length}`; }
  if (to)   { p.push(to);   q += ` AND py.tanggal <= $${p.length}`; }

  const r = await pool.query(q + " ORDER BY py.tanggal DESC", p);
  res.json(r.rows);
};
