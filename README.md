# Voltage Divider Lab

Simulasi interaktif Hukum Pembagi Tegangan DC (dua resistor seri) dalam bahasa Indonesia. HTML + CSS + JavaScript murni, tanpa backend dan tanpa library eksternal.

## Tujuan pembelajaran
Memahami Vout = Vin × R2 / (R1 + R2), hukum Ohm, KVL, daya resistor, dan pengaruh R1/R2 terhadap tegangan serta arus.

## Fitur
Rangkaian SVG dengan animasi arus konseptual, slider + input sinkron (R1/R2 skala log), preset, hasil real-time (Vout, VR1, VR2, I, Rtotal, P1, P2, KVL), batang pembagian tegangan, grafik Vout vs R2, materi, 4 eksperimen, kuis 5 soal, mode gelap/terang, tombol salin hasil, dukungan keyboard dan reduced motion.

## Struktur file
`index.html`, `style.css`, `script.js`, `README.md`, `.nojekyll`

## Menjalankan lokal
Buka `index.html` di browser, atau jalankan `python -m http.server 8000` di folder proyek lalu buka `http://localhost:8000`.

## Unggah ke GitHub dan aktifkan Pages
1. Buat repository baru di GitHub (mis. `voltage-divider-lab`).
2. Unggah semua file (Add file → Upload files, termasuk `.nojekyll`), lalu Commit.
3. Buka **Settings → Pages**.
4. Pada *Build and deployment*, pilih **Deploy from a branch**.
5. Pilih branch **main** dan folder **/ (root)**, lalu **Save**.
6. Tunggu 1–3 menit, lalu buka `https://USERNAME.github.io/voltage-divider-lab/`.

## Memperbarui website
Edit/unggah file yang berubah ke branch `main`; Pages otomatis dibangun ulang.

## Masalah umum
- Halaman 404: pastikan `index.html` ada di root dan tunggu deployment selesai.
- Tampilan lama: tekan Ctrl+F5 (hard refresh).
- CSS/JS tidak termuat: periksa nama file (huruf besar/kecil berpengaruh).
