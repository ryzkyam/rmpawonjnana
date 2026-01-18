const { login } = require("./auth.service");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const user = await login(username, password);

  if (!user) {
    return res.status(401).json({ success: false });
  }

  res.status(200).json({
    success: true,
    username: user.username,
  });
}
