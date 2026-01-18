document.getElementById("btnLogin").onclick = async () => {
  const username = username.value.trim();
  const password = password.value.trim();

  const r = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });

  const d = await r.json();

  if (!d.success) return alert("Login gagal");

  localStorage.setItem("user", d.username);
  location.href = d.username === "admin"
    ? "pos.html"
    : "reports.html";
};
