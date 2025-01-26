# Chatbot AI Lokal

Sebuah implementasi chatbot AI yang dapat dijalankan secara lokal dengan antarmuka web yang interaktif dan kemampuan untuk menjalankan kode HTML dan JavaScript secara langsung.

## 🌟 Fitur Utama

- Antarmuka pengguna yang responsif dan modern
- Dukungan untuk menjalankan kode HTML dan JavaScript secara real-time
- Integrasi dengan model AI untuk memberikan respons cerdas
- Fitur khusus untuk mencari dan menampilkan resep masakan
- Kemampuan untuk menampilkan informasi nutrisi makanan
- Panel kode terpisah dengan editor Ace
- Mendukung format Markdown untuk output chat
- Tampilan preview kode secara langsung

## 🛠️ Teknologi yang Digunakan

- HTML/CSS/JavaScript
- Ace Editor untuk pengeditan kode
- Marked.js untuk parsing Markdown
- Tailwind CSS untuk styling
- Font Awesome untuk ikon
- Axios untuk HTTP requests

## 📋 Persyaratan Sistem

- Web browser modern yang mendukung JavaScript ES6+
- Server lokal yang menjalankan API AI (port 1234)
- Koneksi internet untuk memuat dependensi eksternal

## 🚀 Cara Menggunakan

1. Clone repositori ini ke komputer lokal Anda
2. Pastikan server API berjalan di `http://localhost:1234`
3. Buka file `index.html` di browser web
4. Pilih model AI yang ingin digunakan dari dropdown
5. Mulai chat dengan bot!

### Perintah Khusus untuk Resep

- `resep [nama makanan]` - Menampilkan instruksi memasak
- `cari resep [tag]` - Mencari resep berdasarkan tag
- `masakan [cuisine]` - Menampilkan resep berdasarkan jenis masakan
- `nutrisi [nama makanan]` - Menampilkan informasi kalori dan nutrisi

## ⚙️ Konfigurasi

Konfigurasi utama dapat diubah di bagian awal file JavaScript:

```javascript
const API_URL = 'http://localhost:1234';
```

## 💡 Fitur Editor Kode

- Dukungan syntax highlighting untuk HTML dan JavaScript
- Preview kode secara real-time
- Kemampuan untuk menjalankan kode secara langsung
- Toggle antara mode HTML dan JavaScript
- Tombol clear untuk membersihkan editor

## 👨‍💻 Developer

- Instagram: [@sedotphp](https://instagram.com/sedotphp)
- GitHub: [dypras666](https://github.com/dypras666)

## 📝 Lisensi

Proyek ini dilisensikan di bawah ketentuan yang ditetapkan oleh pengembang. Silakan hubungi pengembang untuk informasi lebih lanjut.

## 🤝 Kontribusi

Kontribusi, issues, dan feature requests sangat diterima. Jangan ragu untuk memeriksa halaman issues jika Anda ingin berkontribusi.

---

Dibuat dengan ❤️ oleh [@sedotphp](https://instagram.com/sedotphp)