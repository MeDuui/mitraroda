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
