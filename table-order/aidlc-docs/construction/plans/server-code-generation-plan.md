# Code Generation Plan - Server (Unit 1)

## Unit Context
- **Unit**: server (백엔드 API)
- **기술**: Express + TypeScript + SQLite (better-sqlite3) + JWT
- **위치**: `server/` (workspace root 기준)
- **Stories**: US-C01~C05, US-A01~A08 (백엔드 로직)

---

## 생성 단계

- [ ] Step 1: 프로젝트 초기화 (package.json, tsconfig.json)
- [ ] Step 2: 데이터베이스 레이어 (db/database.ts, db/schema.ts)
- [ ] Step 3: 유틸리티 (utils/sse-manager.ts)
- [ ] Step 4: 미들웨어 (middleware/auth.ts, middleware/error.ts)
- [ ] Step 5: Auth 라우터 (routes/auth.ts)
- [ ] Step 6: Menu 라우터 (routes/menu.ts)
- [ ] Step 7: Order 라우터 (routes/order.ts)
- [ ] Step 8: Table 라우터 (routes/table.ts)
- [ ] Step 9: SSE 라우터 (routes/sse.ts)
- [ ] Step 10: Upload 라우터 (routes/upload.ts)
- [ ] Step 11: 앱 진입점 (src/index.ts)
- [ ] Step 12: 시드 데이터 스크립트 (src/seed.ts)

---

## Story 매핑
| Step | Stories |
|------|---------|
| Step 5 | US-C01, US-A01 |
| Step 6 | US-C02, US-A08 |
| Step 7 | US-C04, US-C05, US-A02, US-A03, US-A05 |
| Step 8 | US-A04, US-A06, US-A07 |
| Step 9 | US-A02 |
| Step 10 | US-A08 |
