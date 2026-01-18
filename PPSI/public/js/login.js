const pool = require("./db");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT username FROM admin WHERE username=$1 AND password=$2",
    [username, password]
  );

  if (result.rows.length > 0) {
    res.status(200).json({ success: true, username });
  } else {
    res.status(401).json({ success: false });
  }
}
