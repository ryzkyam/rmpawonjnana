const pool = require("./db");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { metode_pembayaran, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const total = items.reduce(
      (sum, i) => sum + Number(i.qty) * Number(i.harga),
      0
    );

    const payRes = await client.query(
      "INSERT INTO pembayaran (metode_pembayaran, total_bayar) VALUES ($1,$2) RETURNING id_transaksi",
      [metode_pembayaran, total]
    );

    const id_trans = payRes.rows[0].id_transaksi;

    for (const item of items) {
      await client.query(
        "INSERT INTO pesanan (id_transaksi,id_menu,qty,total_harga,status) VALUES ($1,$2,$3,$4,'selesai')",
        [id_trans, item.id_menu, item.qty, item.qty * item.harga]
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
}
