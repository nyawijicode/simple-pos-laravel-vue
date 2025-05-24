Simple POS System

Simple POS adalah sistem Point of Sale modern dan responsif yang dikembangkan dengan Laravel 12 dan Vue.js. Sistem ini menyediakan solusi lengkap untuk manajemen toko atau usaha kecil dengan fitur penjualan, inventaris, pelanggan, dan laporan.

🚀 Fitur Utama

Point of Sale (POS) - Antarmuka kasir yang intuitif dan responsif
Manajemen Produk - Kelola produk, kategori, dan stok
Manajemen Pelanggan - Kelola database pelanggan dan histori pembelian
Laporan Penjualan - Laporan detail dengan filter periode dan kategori
Manajemen Pengguna - Sistem role-based access control
Cetak Invoice - Cetak atau simpan invoice dalam format PDF
Responsif - Bekerja di semua perangkat (desktop, tablet, mobile)
Multi-bahasa - Siap untuk internasionalisasi

🛠️ Teknologi
Backend

Laravel 12.x
PHP 8.2+
MySQL/MariaDB
Laravel Sanctum untuk autentikasi
Spatie Permission untuk manajemen role

Frontend

Vue.js 3
Pinia untuk state management
Vue Router
Bootstrap 5
Axios
Chart.js
SweetAlert2

📋 Persyaratan Sistem

PHP 8.2 atau lebih tinggi
Composer
Node.js 16+ dan NPM
MySQL 5.7+ atau MariaDB 10.3+
Web server (Apache, Nginx)

🔧 Instalasi
1. Clone Repositori
bashgit clone https://github.com/username/simple-pos.git
cd simple-pos
2. Setup Backend (Laravel)
bash# Masuk ke direktori backend
cd backend

# Instal dependensi
composer install

# Salin .env.example ke .env
cp .env.example .env

# Generate application key
php artisan key:generate

# Sesuaikan konfigurasi database di file .env
# DB_DATABASE=simple_pos
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Link storage
php artisan storage:link

# Jalankan server development
php artisan serve
3. Setup Frontend (Vue.js)
bash# Masuk ke direktori frontend
cd ../frontend

# Instal dependensi
npm install

# Sesuaikan API URL di .env
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Jalankan server development
npm run dev
4. Akses Aplikasi

Backend API: http://localhost:8000
Frontend: http://localhost:5173

📈 Penggunaan
Point of Sale (POS)

Login sebagai Admin, Manager, atau Kasir
Navigasi ke menu "POS"
Pilih produk dari daftar atau gunakan pencarian
Tentukan jumlah dan tambahkan ke keranjang
Pilih pelanggan (opsional)
Tentukan metode pembayaran dan jumlah yang dibayarkan
Klik "Checkout" untuk menyelesaikan transaksi
Cetak invoice (opsional)

Manajemen Produk

Login sebagai Admin atau Manager
Navigasi ke menu "Products"
Tambah, edit, atau hapus produk
Kelola stok dan kategori

Laporan

Login sebagai Admin atau Manager
Navigasi ke menu "Reports"
Pilih jenis laporan dan tentukan periode
Ekspor laporan ke Excel atau PDF (opsional)

🛠️ Deployment ke Produksi
Backend (Laravel)
bash# Di direktori backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
Frontend (Vue.js)
bash# Di direktori frontend
npm run build
Hasil build di direktori frontend/dist dapat dihosting di server web statis.

🔄 Konfigurasi CORS
Jika backend dan frontend di-deploy di domain berbeda, pastikan untuk mengkonfigurasi CORS di config/cors.php:
php'allowed_origins' => ['https://your-frontend-domain.com'],