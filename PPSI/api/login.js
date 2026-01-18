const pool = require("./db");

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).end();

  const { username, password } = req.body;

  const q = `
    SELECT username
    FROM admin
    WHERE username=$1 AND password=$2
  `;

  const r = await pool.query(q, [username, password]);

  if (r.rows.length === 0)
    return res.json({ success: false });

  res.json({
    success: true,
    username: r.rows[0].username
  });
};
