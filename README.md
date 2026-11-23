# Arena Estafet Bahasa Indonesia SD

Aplikasi permainan edukasi interaktif berbasis layar sentuh **IFP (Interactive Flat Panel)** untuk mata pelajaran **Bahasa Indonesia Sekolah Dasar (Kelas 1–6)** dengan sistem kompetisi estafet kelompok dua layar (*split-screen multi-touch*).

Dikembangkan untuk pembelajaran kelas oleh **Afri Dani Saputra**, Guru **SD Anugerah Abadi 1 Bengalon**.

## Fitur Utama

- **Arena Layar Terpisah (Dual-Screen Multi-Touch)**: Sisi kiri dan kanan bekerja secara independen menggunakan `Pointer Events` dan `touch-action: none` sehingga dua tim dapat bertanding adu cepat secara bersamaan pada satu layar sentuh TV IFP.
- **Sistem Estafet Barisan**: Siswa terdepan menjawab soal lalu bergiliran mundur ke barisan belakang dengan pembaruan pemain aktif otomatis.
- **5 Jenis Permainan + Mode Campuran**:
  1. Kilat Kosakata
  2. Rakit Suku Kata & Kalimat
  3. Detektif Ejaan & Kalimat Efektif
  4. Padan Kata, Sinonim & Imbuhan
  5. Tantangan Majas & Idiom
  6. Estafet Campuran
- **Kurikulum SD Kelas 1–6 & Babak Berjenjang**: Mendukung pemilihan level kelas tetap maupun progresif (kesulitan meningkat tiap babak hingga Babak Final).
- **Anti-Curang Soal Unik**: Pembagian soal acak dan terpisah untuk setiap tim pada tiap pertandingan.
- **Turnamen Otomatis (Genap & Ganjil)**: Mendukung jumlah kelompok fleksibel, pengundian lawan acak, serta sistem *Bye* (lolos otomatis ke babak berikutnya) apabila jumlah tim ganjil.
- **Tampilan Glassmorphism Minimalis & Mode Layar Penuh**: Dilengkapi efek suara netral, papan skor real-time (tanpa membocorkan status benar/salah selama pertandingan), serta Panel Pengaturan Admin yang dilindungi kata sandi guru.
- **Generator Kelompok & Penamaan Tim**: Masukkan daftar nama siswa untuk dibagi rata secara acak ke kelompok dan sesuaikan nama kelompok sebelum pertandingan.

## Menjalankan Secara Lokal

Pastikan **Node.js** (v18 atau lebih baru) sudah terpasang, lalu jalankan perintah berikut:

```bash
npm install
npm run dev
```

Buka browser pada `http://localhost:3000`.

### Build Produksi

```bash
npm run build
npm run preview
```

## Teknologi

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React Icons
- Web Audio API (efek suara interaktif tanpa file audio eksternal)
