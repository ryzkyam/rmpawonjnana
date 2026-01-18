const pool = require("./db");

module.exports = async (req, res) => {
  const r = await pool.query("SELECT * FROM menu ORDER BY id_menu");
  res.json(r.rows);
};
