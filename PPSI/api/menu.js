const pool = require("./db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const result = await pool.query("SELECT * FROM menu");
  res.status(200).json(result.rows);
}
