# Code Generation Plan - Client Customer (Unit 2)

## Unit Context
- **Unit**: client-customer (고객용 프론트엔드)
- **기술**: React + TypeScript + Vite
- **위치**: `client-customer/` (workspace root 기준)
- **Stories**: US-C01~C05

---

## 생성 단계

- [x] Step 1: 프로젝트 초기화 (package.json, vite.config.ts, tsconfig.json, index.html)
- [x] Step 2: API 클라이언트 (src/api/client.ts)
- [x] Step 3: Hooks (src/hooks/useAuth.ts, src/hooks/useCart.ts)
- [x] Step 4: 공통 컴포넌트 (CategoryNav, MenuCard, CartItem)
- [x] Step 5: LoginPage
- [x] Step 6: MenuPage
- [x] Step 7: CartPage
- [x] Step 8: OrderPage
- [x] Step 9: OrderHistoryPage
- [x] Step 10: App.tsx + main.tsx + 글로벌 스타일

---

## Story 매핑
| Step | Stories |
|------|---------|
| Step 3 | US-C01, US-C03 |
| Step 5 | US-C01 |
| Step 6 | US-C02 |
| Step 7 | US-C03 |
| Step 8 | US-C04 |
| Step 9 | US-C05 |
