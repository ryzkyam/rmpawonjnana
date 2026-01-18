const pool = require("./db");

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).end();

  const { metode_pembayaran, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const total = items.reduce(
      (s, i) => s + i.qty * i.harga,
      0
    );

    const pay = await client.query(
      `INSERT INTO pembayaran (metode_pembayaran, total_bayar)
       VALUES ($1,$2) RETURNING id_transaksi`,
      [metode_pembayaran, total]
    );

    const id = pay.rows[0].id_transaksi;

    for (const i of items) {
      await client.query(
        `INSERT INTO pesanan
         (id_transaksi, id_menu, qty, total_harga, status)
         VALUES ($1,$2,$3,$4,'selesai')`,
        [id, i.id_menu, i.qty, i.qty * i.harga]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, id_transaksi: id });

  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false });
  } finally {
    client.release();
  }
};
