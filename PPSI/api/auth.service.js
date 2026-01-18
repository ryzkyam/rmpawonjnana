const db = require("./db");

async function login(username, password) {
  try {
    const result = await db.query(
      "SELECT id_admin, username FROM admin WHERE username = $1 AND password = $2",
      [username, password]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error("Auth Logic Error:", err);
    return null;
  }
}

module.exports = { login };
