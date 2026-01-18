/* ================= AUTH GUARD ================= */
if (!localStorage.getItem("username")) {
  window.location.href = "login.html";
}

/* ================= GLOBAL STATE ================= */
let cart = [];
let menuData = [];
let selectedCategory = "all";
let selectedPayment = "";
let isCheckout = false;

/* ================= UTIL ================= */
function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, m =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[m])
  );
}

/* ================= LOAD MENU ================= */
async function loadMenu() {
  try {
    const res = await fetch("/menu");
    if (!res.ok) throw new Error("Gagal load menu");
    menuData = await res.json();
    renderMenu();
  } catch (err) {
    console.error(err);
    alert("Menu gagal dimuat");
  }
}

function setCategory(cat) {
  selectedCategory = cat;
  renderMenu();
}

function renderMenu() {
  const container = document.getElementById("menuList");

  const filtered = menuData.filter(m =>
    selectedCategory === "all" || m.kategori === selectedCategory
  );

  container.innerHTML = filtered.map(item => `
    <div class="menu-item">
      <h4>${escapeHTML(item.nama_menu)}</h4>
      <p>Rp ${Number(item.harga).toLocaleString("id-ID")}</p>
      <button onclick="addCart(${item.id_menu}, '${escapeHTML(item.nama_menu)}', ${item.harga})">
        Tambah
      </button>
    </div>
  `).join("");
}

/* ================= CART ================= */
function addCart(id_menu, name, price) {
  const exist = cart.find(i => i.id_menu === id_menu);

  if (exist) {
    exist.qty++;
  } else {
    cart.push({ id_menu, name, harga: price, qty: 1 });
  }

  renderCart();
}

function minus(index) {
  if (cart[index].qty > 1) cart[index].qty--;
  else cart.splice(index, 1);

  renderCart();
}

function renderCart() {
  const body = document.getElementById("cartBody");

  body.innerHTML = cart.map((item, i) => `
    <tr>
      <td>${escapeHTML(item.name)}</td>
      <td>
        <button onclick="minus(${i})">-</button>
        ${item.qty}
        <button onclick="addCart(${item.id_menu}, '${escapeHTML(item.name)}', ${item.harga})">+</button>
      </td>
      <td>Rp ${(item.qty * item.harga).toLocaleString("id-ID")}</td>
    </tr>
  `).join("");

  calc();
}

function calc() {
  const subtotal = cart.reduce((s, i) => s + i.qty * i.harga, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  document.getElementById("subtotal").innerText = subtotal.toLocaleString("id-ID");
  document.getElementById("tax").innerText = tax.toLocaleString("id-ID");
  document.getElementById("total").innerText = total.toLocaleString("id-ID");
}

/* ================= PAYMENT ================= */
function openPayment(type) {
  if (cart.length === 0) {
    alert("Keranjang kosong");
    return;
  }

  selectedPayment = type;
  document.getElementById("paymentModal").classList.remove("hidden");
  document.getElementById("qrisBox").style.display =
    type === "QRIS" ? "block" : "none";
}

function closePayment() {
  document.getElementById("paymentModal").classList.add("hidden");
}

/* ================= CHECKOUT ================= */
async function checkout() {
  if (isCheckout) return;
  isCheckout = true;

  const payload = {
    metode_pembayaran: selectedPayment,
    items: cart.map(item => ({
      id_menu: item.id_menu,
      qty: item.qty,
      harga: item.harga
    }))
  };

  try {
    const res = await fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Checkout gagal");

    const data = await res.json();

    if (data.success) {
      showPopup("Transaksi berhasil! ID: " + data.id_transaksi, "success");
      printStruk(data.id_transaksi, cart);
      cart = [];
      renderCart();
      closePayment();
    } else {
      showPopup("Transaksi gagal", "error");
    }

  } catch (err) {
    console.error(err);
    showPopup("Server error", "error");
  } finally {
    isCheckout = false;
  }
}

/* ================= POPUP ================= */
function showPopup(message, type = "info") {
  const popup = document.getElementById("popup");
  const msg = document.getElementById("popup-message");
  msg.textContent = message;
  msg.className = type;
  popup.style.display = "flex";

  setTimeout(closePopup, 3000);
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

/* ================= STRUK ================= */
function printStruk(idTransaksi, cartItems) {
  document.getElementById("struk-id").textContent = idTransaksi;
  document.getElementById("struk-date").textContent =
    new Date().toLocaleString("id-ID");

  const body = document.getElementById("struk-body");
  body.innerHTML = "";

  let subtotal = 0;

  cartItems.forEach(item => {
    const total = item.qty * item.harga;
    subtotal += total;

    body.innerHTML += `
      <tr>
        <td>${escapeHTML(item.name)}</td>
        <td>${item.qty}</td>
        <td>${item.harga.toLocaleString("id-ID")}</td>
        <td>${total.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });

  const ppn = subtotal * 0.1;
  const total = subtotal + ppn;

  document.getElementById("struk-subtotal").textContent =
    subtotal.toLocaleString("id-ID");
  document.getElementById("struk-ppn").textContent =
    ppn.toLocaleString("id-ID");
  document.getElementById("struk-total").textContent =
    total.toLocaleString("id-ID");

  const struk = document.getElementById("struk");
  struk.style.display = "block";
  window.print();
  struk.style.display = "none";
}

/* ================= LOGOUT ================= */
function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

/* ================= INIT ================= */
loadMenu();
