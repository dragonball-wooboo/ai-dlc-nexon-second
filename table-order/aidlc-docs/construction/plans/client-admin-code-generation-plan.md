# Code Generation Plan - Client Admin (Unit 3)

## Unit Context
- **Unit**: client-admin (관리자용 프론트엔드)
- **기술**: React + TypeScript + Vite
- **위치**: `client-admin/` (workspace root 기준)
- **Stories**: US-A01~A08

---

## 생성 단계

- [x] Step 1: 프로젝트 초기화 (package.json, vite.config.ts, tsconfig.json, index.html)
- [x] Step 2: API 클라이언트 (src/api/client.ts)
- [x] Step 3: Hooks (src/hooks/useAuth.ts, src/hooks/useSSE.ts)
- [x] Step 4: 공통 컴포넌트 (TableCard, OrderDetail, MenuForm)
- [x] Step 5: LoginPage
- [x] Step 6: DashboardPage
- [x] Step 7: TableDetailPage
- [x] Step 8: MenuManagePage
- [x] Step 9: App.tsx + main.tsx + 글로벌 스타일

---

## Story 매핑
| Step | Stories |
|------|---------|
| Step 3 | US-A01, US-A02 |
| Step 5 | US-A01 |
| Step 6 | US-A02, US-A03 |
| Step 7 | US-A04, US-A05, US-A06, US-A07 |
| Step 8 | US-A08 |
