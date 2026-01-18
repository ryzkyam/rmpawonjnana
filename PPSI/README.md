# Pawon Jnana POS System

Sistem Point of Sale (POS) sederhana untuk rumah makan **Pawon Jnana** berbasis **HTML, CSS, JavaScript (Frontend)** dan **Node.js + Express + SQL Server (Backend)**.
Sistem ini mendukung login pengguna, transaksi penjualan, serta laporan transaksi untuk owner.

---

## 🧱 Arsitektur Sistem

### Frontend

* HTML
* CSS
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js
* MSSQL (`mssql` package)

### Database (SQL Server)

* `Admin` → Data login
* `Menu` → Daftar produk
* `Pembayaran` → Data transaksi utama
* `Pesanan` → Detail item per transaksi

---

## 🔐 Sistem Login & Hak Akses

Sistem menggunakan **username** sebagai penentu akses:

| Username | Akses       |
| -------- | ----------- |
| `admin`  | POS (Kasir) |
| `owner`  | Laporan     |

### Endpoint Login

```
POST /login
```

**Fungsi:**
Memvalidasi username dan password dari tabel `Admin`.

**Alur:**

1. Frontend mengirim `username` dan `password`
2. Backend mengecek ke database
3. Jika valid → `success: true`
4. Frontend mengarahkan:

   * `admin` → `pos.html`
   * `owner` → `reports.html`

---

## 🧾 POS (Point of Sale)

### Menampilkan Menu

```
GET /menu
```

**Fungsi:**
Mengambil daftar menu dari tabel `Menu` dan menampilkannya di halaman POS.

---

### Keranjang (Cart)

#### `addCart(id_menu, name, price)`

Menambahkan produk ke keranjang atau menambah jumlah jika produk sudah ada.

#### `renderCart()`

Menampilkan isi keranjang ke tabel.

#### `calc()`

Menghitung:

* Subtotal
* Pajak (jika ada)
* Total bayar

---

## 💳 Checkout / Simpan Transaksi

### Endpoint

```
POST /checkout
```

**Fungsi:**
Menyimpan transaksi ke database.

### Alur Proses:

1. Frontend mengirim:

   * `metode_pembayaran`
   * `items` (id_menu, qty, harga)
2. Backend:

   * Menyimpan data ke tabel **Pembayaran**
   * Mengambil `id_transaksi`
   * Menyimpan detail item ke tabel **Pesanan**
3. Jika berhasil → respon `success: true`

**Kenapa penting?**
Ini adalah proses inti transaksi penjualan yang nantinya akan digunakan untuk laporan.

---

## 📊 Laporan Transaksi

### Endpoint

```
GET /reports
```

### Filter yang Didukung:

* 📅 Tanggal (`from`, `to`)
* 🧾 ID Transaksi
* 🍽️ Nama Produk

### Query Utama:

```sql
SELECT
  py.tanggal,
  py.id_transaksi,
  py.total_bayar,
  m.nama_menu,
  ps.qty,
  ps.total_harga
FROM Pembayaran py
JOIN Pesanan ps ON py.id_transaksi = ps.id_transaksi
JOIN Menu m ON ps.id_menu = m.id_menu
ORDER BY py.tanggal DESC
```

**Fungsi:**
Menampilkan laporan transaksi yang bisa digunakan oleh owner untuk evaluasi penjualan.

---

## 🚪 Logout

```js
localStorage.removeItem("username");
window.location.href = "login.html";
```

**Fungsi:**
Mengakhiri sesi user dan mengembalikan ke halaman login.

---

## 🔒 Proteksi Halaman

### POS (`pos.html`)

```js
if (localStorage.getItem("username") !== "admin") {
  window.location.href = "login.html";
}
```

### Reports (`reports.html`)

```js
if (localStorage.getItem("username") !== "owner") {
  window.location.href = "login.html";
}
```

**Fungsi:**
Mencegah user mengakses halaman yang tidak sesuai dengan hak aksesnya.

---

## 🗄️ Struktur Tabel Database

### Admin

| Kolom    | Keterangan     |
| -------- | -------------- |
| id_admin | Primary Key    |
| username | Username login |
| password | Password login |

### Menu

| Kolom      | Keterangan   |
| ---------- | ------------ |
| id_menu    | Primary Key  |
| nama_menu  | Nama produk  |
| harga      | Harga        |
| kategori   | Kategori     |
| created_at | Waktu dibuat |
| updated_at | Waktu diubah |

### Pembayaran

| Kolom             | Keterangan        |
| ----------------- | ----------------- |
| id_transaksi      | Primary Key       |
| metode_pembayaran | Tunai / Non Tunai |
| total_bayar       | Total pembayaran  |
| tanggal           | Tanggal transaksi |
| created_at        | Waktu dicatat     |

### Pesanan

| Kolom        | Keterangan           |
| ------------ | -------------------- |
| id_pesanan   | Primary Key          |
| id_transaksi | Relasi ke pembayaran |
| id_menu      | Relasi ke menu       |
| qty          | Jumlah item          |
| total_harga  | Total harga item     |
| status       | Status pesanan       |
| created_at   | Waktu dibuat         |
| updated_at   | Waktu diubah         |

---

## ⚠️ Catatan

* Sistem ini dibuat untuk **keperluan tugas / pembelajaran**
* Autentikasi masih berbasis **username**, belum menggunakan role secara formal
* Belum menggunakan session atau token (masih `localStorage`)


