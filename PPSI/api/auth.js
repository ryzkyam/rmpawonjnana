const db = require("./api/server/db");

async function login(username, password) {
  try {
    // Gunakan parameterized query ($1, $2) untuk keamanan 
    // Nama tabel disesuaikan dengan skema Supabase lo (huruf kecil: admin)
    const result = await db.query(
      "SELECT id_admin, username FROM admin WHERE username = $1 AND password = $2",
      [username, password]
    );

    // Di Postgres (library 'pg'), data ada di property 'rows'
    // Bukan 'recordset' seperti di MSSQL
    return result.rows[0]; 
  } catch (err) {
    console.error("Auth Logic Error:", err);
    return null;
  }
}

module.exports = { login };