# MitraRoda — Quick Start Guide

## Untuk User (End User)

### Instalasi APK
1. Download file `mitraroda-v1.apk` dari GitHub Releases
2. Buka file, tap "Install"
3. Buka app MitraRoda
4. Daftar akun baru atau login

### Cara Pakai
1. **Beranda**: Lihat saldo hari ini + catat trip baru
2. **Analisis**: Lihat breakdown pengeluaran & metode pembayaran
3. **Riwayat**: Lihat semua transaksi + export laporan

---

## Untuk Developer

### Jalankan Backend Local

```bash
cd backend
npm install
node server.js
```

Server jalan di `http://localhost:3000`

### Jalankan Frontend Local

```bash
cd frontend
npm install
npx expo start --android
```

Tekan `a` untuk buka di Android emulator atau scan QR dengan Expo Go.

### Deploy ke Railway (Backend)

1. Push code ke GitHub
2. Buka https://railway.app
3. Create new project → Connect GitHub
4. Deploy otomatis
5. Salin URL deployment
6. Update `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://YOUR-RAILWAY-URL/api';
   ```

### Build APK untuk Production

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

APK siap download dari EAS dashboard.

---

## API Test

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi_ojol",
    "email": "budi@mail.com",
    "password": "rahasia123"
  }'

# Login & dapatkan token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi_ojol",
    "password": "rahasia123"
  }'

# Catat trip (ganti TOKEN dengan token dari login)
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gross_income": 45000,
    "tip": 5000,
    "payment_type": "cash",
    "date": "2026-10-03"
  }'
```

---

## File Structure

```
mitraroda/
├── backend/          — Node.js + Express API
├── frontend/         — React Native (Expo) app
├── README.md         — Full documentation
└── QUICKSTART.md     — This file
```

---

**Status**: MVP ready for deployment  
**Last Updated**: 2026-10-03
