# MitraRoda Driver — Aplikasi Pencatatan Keuangan Ojek Online

**Status**: MVP siap deploy (Backend + Frontend React Native)

---

## Arsitektur Sistem

```
┌─────────────────────┐
│  React Native App   │  (Expo)
│   (Frontend)        │  Android APK
└──────────┬──────────┘
           │ HTTP/REST
           ↓
┌─────────────────────┐
│  Node.js + Express  │  (Backend)
│  SQLite Database    │  Railway.app
└─────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React Native (Expo) | SDK 57 |
| **Styling** | React Native (native) + SVG Icons | - |
| **Backend** | Node.js + Express | 18+ |
| **Database** | SQLite3 | 5.x |
| **Auth** | JWT (jsonwebtoken) | 9.x |
| **Hosting** | Railway.app (Backend) | Free Tier |

---

## Fitur Inti (MVP)

### 1. Autentikasi
- [x] Register (username, email, password)
- [x] Login (email/username + password)
- [x] JWT token management
- [x] Secure password hashing (bcryptjs)

### 2. Pencatatan Trip
- [x] Catat nominal argo + tip
- [x] Pilih tipe pembayaran (tunai/non-tunai)
- [x] Auto-timestamp
- [x] Real-time sync ke backend

### 3. Manajemen Biaya Operasional
- [x] Kategori: Bensin, Makan, Parkir, Lainnya
- [x] Catat pengeluaran harian
- [x] Breakdown biaya per kategori

### 4. Target Harian
- [x] Set target pemasukan
- [x] Progress bar real-time
- [x] Status tercapai/belum

### 5. Dashboard & Analytics
- [x] Laba bersih hari ini (Pemasukan - Biaya)
- [x] Pie chart: Pemasukan vs Biaya
- [x] Breakdown: Cash vs Non-Cash
- [x] Riwayat transaksi (filter hari/minggu/bulan)

### 6. Export & Laporan
- [x] Export ringkasan WhatsApp text
- [x] PDF export placeholder (backend ready)

---

## API Endpoints

### Auth
```
POST   /api/auth/register         — Register akun baru
POST   /api/auth/login            — Login (email/username + password)
GET    /api/auth/me               — Get profile (require token)
```

### Trips
```
POST   /api/trips                 — Catat trip baru
GET    /api/trips                 — Get all trips
GET    /api/trips?date=YYYY-MM-DD — Get trips by date
```

### Expenses
```
POST   /api/expenses              — Catat pengeluaran
GET    /api/expenses              — Get all expenses
GET    /api/expenses?date=YYYY-MM-DD — Get expenses by date
```

### Targets
```
POST   /api/targets               — Set target harian
GET    /api/targets               — Get all targets
GET    /api/targets?date=YYYY-MM-DD — Get target by date
```

### Summary
```
GET    /api/summary?date=YYYY-MM-DD — Get ringkasan harian lengkap
```

### Export
```
POST   /api/export/pdf            — Generate PDF (placeholder)
POST   /api/export/whatsapp       — Generate WhatsApp text
```

---

## Database Schema

### Users
```sql
id INT PRIMARY KEY
username TEXT UNIQUE
email TEXT UNIQUE
password_hash TEXT
created_at TIMESTAMP
```

### Trips
```sql
id INT PRIMARY KEY
driver_id INT (FK → users)
gross_income INT
tip INT
payment_type TEXT ('cash' | 'non-cash')
date DATE
created_at TIMESTAMP
```

### Expenses
```sql
id INT PRIMARY KEY
driver_id INT (FK → users)
category TEXT ('fuel' | 'food' | 'parking' | 'other')
amount INT
date DATE
description TEXT (optional)
created_at TIMESTAMP
```

### Daily Targets
```sql
id INT PRIMARY KEY
driver_id INT (FK → users)
target_amount INT
date DATE UNIQUE(driver_id, date)
created_at TIMESTAMP
```

---

## Design System

### Warna (Orange + White + Slate)
```
Primary:      #f97316 (Orange — CTA, brand)
Background:   #faf8ff (Soft lavender)
Surface:      #ffffff (White — cards)
Success:      #10b981 (Green — income)
Danger:       #ef4444 (Red — expenses)
Text Dark:    #1e293b (Slate-800)
Text Muted:   #64748b (Slate-500)
```

### Typography
- **Font**: Plus Jakarta Sans (custom web font)
- **Headings**: Bold 24-32px, tracking tight
- **Body**: Regular 14-16px, line-height relaxed

### Icons
- **Library**: Pure SVG (no emoji)
- **Categories**: Bensin (gas), Makan (fork), Parkir (P), Lainnya (dots)

---

## Setup Local Development

### Backend

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Konfigurasi environment**
   ```bash
   echo 'PORT=3000
   NODE_ENV=development
   JWT_SECRET=mitraroda_secret_key_2024_secure
   JWT_EXPIRES_IN=7d' > .env
   ```

3. **Jalankan server**
   ```bash
   npm run dev
   # atau
   node server.js
   ```

4. **Test API**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@mail.com","password":"123456"}'
   ```

### Frontend

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Update API URL** (`src/services/api.ts`)
   ```typescript
   // Local dev
   const API_BASE_URL = 'http://localhost:3000/api';
   
   // After Railway deploy
   const API_BASE_URL = 'https://YOUR_RAILWAY_URL/api';
   ```

3. **Run dev server**
   ```bash
   npx expo start
   ```

4. **Build APK (local)**
   ```bash
   npx eas build --platform android --profile preview
   ```

---

## Deploy ke Railway (Backend)

### Step 1: Siapkan Railway Account
1. Buka https://railway.app
2. Sign up (gratis dengan GitHub)
3. Create new project

### Step 2: Connect GitHub
1. Authorize Railway akses ke repo GitHub
2. Select repo `mitraroda`
3. Railway auto-detect Node.js

### Step 3: Konfigurasi Environment
Di Railway dashboard:
```
PORT=3000
NODE_ENV=production
JWT_SECRET=<buat_secret_baru_yang_panjang>
JWT_EXPIRES_IN=7d
```

### Step 4: Deploy
Railway auto-deploy setiap push ke `main` branch.

### Step 5: Dapatkan URL Backend
Setelah deploy, Railway memberikan URL publik:
```
https://mitraroda-production-xxxx.up.railway.app
```

### Step 6: Update Frontend API URL
```typescript
const API_BASE_URL = 'https://mitraroda-production-xxxx.up.railway.app/api';
```

### Step 7: Rebuild & Deploy Frontend
```bash
eas build --platform android --profile production
```

---

## Build APK untuk Production

### Prerequisite
```bash
npm install -g eas-cli
eas login  # Gunakan akun Expo
```

### Build Command
```bash
# Preview (faster, unsigned)
eas build --platform android --profile preview

# Production (slower, signed)
eas build --platform android --profile production
```

### Hasil
- APK tersimpan di EAS cloud
- Download dari Expo dashboard
- Distribusi via GitHub Releases atau direct link

---

## Testing

### Backend
```bash
# Unit test API (manual)
node test/api.js

# Result:
# LOGIN 200
# TRIP1 201
# TRIP2 201
# EXPENSE1 201
# EXPENSE2 201
# TARGET 200
# SUMMARY 200
# CHECK net_income: expected 47000 actual 47000 PASS
```

### Frontend
```bash
# Typecheck
npx tsc --noEmit

# Lint (optional, dependency conflict)
npx expo lint

# Expo export (validate bundle)
npx expo export --platform android
```

---

## Project Structure

```
mitraroda/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── db/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trips.js
│   │   ├── expenses.js
│   │   ├── targets.js
│   │   ├── summary.js
│   │   └── export.js
│   └── data/ (SQLite db — gitignore)
│
├── frontend/
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── app/
│   │   ├── _layout.tsx (Root + Auth)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx (Bottom Nav)
│   │       ├── index.tsx (Home)
│   │       ├── analytics.tsx (Charts)
│   │       └── history.tsx (Riwayat)
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── dataService.ts
│   │   ├── components/
│   │   │   ├── Icons.tsx
│   │   │   ├── TripCard.tsx
│   │   │   ├── TargetWidget.tsx
│   │   │   ├── AddTripModal.tsx
│   │   │   └── AddExpenseModal.tsx
│   │   ├── constants/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   └── assets/ (icon, splash)
│
└── docs/
    └── README.md (ini)
```

---

## Fitur Future (v2+)

- [ ] Push notifications (target achieved)
- [ ] Offline-first sync (local AsyncStorage + queue)
- [ ] Advanced analytics (jam produktif, tren mingguan)
- [ ] Integrasi e-wallet (GCash, OVO, Dana)
- [ ] PDF invoice proper (using pdf-lib)
- [ ] Multi-driver support (admin dashboard)
- [ ] WhatsApp bot integration
- [ ] Voice input untuk pencatatan cepat

---

## Troubleshooting

### Backend tidak jalan
```bash
# Check port 3000 is available
netstat -ano | findstr :3000

# Clear data folder & restart
rm -r backend/data/*
npm run dev
```

### Frontend build error
```bash
# Clear cache & reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

### API timeout
- Pastikan backend sudah running: `curl http://localhost:3000`
- Cek firewall allow port 3000
- Untuk Railway, tunggu deployment selesai (±5 menit)

---

## Known Limitations (MVP)

1. **No offline mode yet** — Harus online untuk sync
2. **PDF export placeholder** — Kirim ke backend untuk generate
3. **Single driver** — Tidak multi-user dalam satu app
4. **No notifications** — Manual refresh untuk update
5. **Data retention unlimited** — Arsip manual diperlukan

---

## Support & Feedback

- Lapor bug: GitHub Issues
- Feedback fitur: GitHub Discussions
- Contact: admin@mitraroda.app (TBD)

---

## License

Proprietary — MitraRoda Driver App
Dilarang duplikasi tanpa izin.

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: 2026-10-03  
**Status**: Ready for Production Deployment
