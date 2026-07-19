# Trade Checklist

App trading dengan:
- **Chart live** (embed TradingView) per pair, termasuk pair custom.
- **Analisa otomatis oleh AI (Claude)**: ambil data harga live, lalu AI mengevaluasi 5 rule Smart Money Concepts (Directional Bias, Time & Price, Liquidation, Reversal Confirmation, Entry Model) dan kasih skor + ringkasan + ide entry.
- **Checklist manual** (opsional) buat yang mau isi sendiri.
- **Jurnal riwayat** — simpan hasil AI atau manual, tersimpan di browser (localStorage).

## Setup API Key (wajib untuk fitur Analisa Otomatis)

Fitur "Analisa Otomatis (AI)" butuh 2 API key, **keduanya gratis**:

1. **GEMINI_API_KEY** — buka https://aistudio.google.com/apikey (pakai akun Google) → **Create API Key** → copy. Free tier saat ini sekitar 10 request/menit dan ratusan request/hari, cukup buat pemakaian pribadi. Tidak perlu kartu kredit.
2. **TWELVEDATA_API_KEY** — daftar gratis di https://twelvedata.com/ → dashboard → copy API key (tier gratis: 800 request/hari, cukup untuk pemakaian pribadi).

### Menjalankan di lokal

Buat file `.env.local` di root folder ini:
```
GEMINI_API_KEY=isi-key-kamu
TWELVEDATA_API_KEY=isi-key-kamu
```

```bash
npm install
npm run dev
```

Buka http://localhost:3000

### Set di Vercel

Di dashboard project Vercel → **Settings** → **Environment Variables** → tambahkan `GEMINI_API_KEY` dan `TWELVEDATA_API_KEY` dengan value key kamu → **Save** → lalu **Redeploy** (tab Deployments → klik deployment terakhir → menu "..." → Redeploy).

Tanpa 2 key ini, chart tetap tampil normal, tapi tombol "Jalankan Analisa" akan menampilkan pesan error. Kalau limit harian Gemini gratis kehabisan, tombol analisa juga akan gagal sampai kuota reset (biasanya reset harian).

## Deploy ke Vercel

**Cara paling gampang (tanpa terminal):**
1. Upload folder ini ke sebuah repo GitHub (buat repo baru, push semua file).
2. Buka https://vercel.com/new, login, pilih "Import Project", lalu pilih repo tersebut.
3. Vercel otomatis mendeteksi Next.js — langsung klik **Deploy**.
4. Tunggu ~1 menit, dapat URL live seperti `https://trade-checklist.vercel.app`.

**Via CLI:**
```bash
npm install -g vercel
vercel
```
Ikuti prompt-nya, lalu `vercel --prod` untuk deploy production.

## Cara pakai

- **Sidebar kiri**: daftar pair. Ketik pair custom (contoh `USDCHF`, `SOLUSDT`) di kolom bawah lalu klik **Add**. Pair custom otomatis dipetakan ke simbol chart & data harga — kalau simbolnya tidak dikenal exchange/provider, chart/analisa bisa gagal menampilkan data.
- **Chart**: otomatis menampilkan chart TF 15 menit untuk pair yang dipilih.
- **Jalankan Analisa**: klik tombol di panel "Analisa Otomatis (AI)" — AI akan mengambil data harga live dan mengevaluasi 5 rule SMC, lalu menampilkan bias, skor, breakdown per rule, ringkasan, dan ide entry.
- **Checklist manual (opsional)**: centang rule sendiri kalau mau override/isi manual. Klik **Kelola rule** untuk menambah/menghapus rule.
- **Setup Score**: persentase rule yang terpenuhi (hijau = siap, kuning = hati-hati, merah = belum siap).
- **Simpan ke jurnal**: hasil AI atau checklist manual bisa disimpan sebagai riwayat di tab Jurnal.

## Kustomisasi rule

Rule default sudah diisi contoh generik. Kirim rule trading kamu (misalnya syarat entry, filter tren, aturan risk management), lalu ganti isi `DEFAULT_RULES` di `lib/storage.ts`, atau tambahkan langsung lewat tombol **Kelola rule** di aplikasi — keduanya tersimpan otomatis.
