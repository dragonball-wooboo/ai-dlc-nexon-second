# Story-Unit 매핑

## Unit 1: Server (백엔드)

모든 스토리의 백엔드 로직을 담당합니다.

| Story | 관련 API |
|-------|----------|
| US-C01 (자동 로그인) | POST /api/auth/table/login |
| US-C02 (메뉴 조회) | GET /api/menus |
| US-C03 (장바구니) | 클라이언트 전용 (서버 불필요) |
| US-C04 (주문 생성) | POST /api/orders |
| US-C05 (내역 조회) | GET /api/orders |
| US-A01 (매장 로그인) | POST /api/auth/admin/login |
| US-A02 (주문 모니터링) | GET /api/sse/orders, GET /api/orders/table/:id |
| US-A03 (상태 변경) | PUT /api/orders/:id/status |
| US-A04 (테이블 설정) | POST /api/tables |
| US-A05 (주문 삭제) | DELETE /api/orders/:id |
| US-A06 (이용 완료) | POST /api/tables/:id/complete |
| US-A07 (과거 내역) | GET /api/tables/:id/history |
| US-A08 (메뉴 관리) | POST/PUT/DELETE /api/menus, POST /api/upload/image |

---

## Unit 2: Client-Customer (고객용)

| Story | 관련 페이지/컴포넌트 |
|-------|---------------------|
| US-C01 (자동 로그인) | LoginPage, useAuth |
| US-C02 (메뉴 조회) | MenuPage, MenuCard, CategoryNav |
| US-C03 (장바구니) | CartPage, CartItem, useCart |
| US-C04 (주문 생성) | OrderPage |
| US-C05 (내역 조회) | OrderHistoryPage |

---

## Unit 3: Client-Admin (관리자용)

| Story | 관련 페이지/컴포넌트 |
|-------|---------------------|
| US-A01 (매장 로그인) | LoginPage, useAuth |
| US-A02 (주문 모니터링) | DashboardPage, TableCard, useSSE |
| US-A03 (상태 변경) | DashboardPage, OrderDetail |
| US-A04 (테이블 설정) | DashboardPage (설정 모달) |
| US-A05 (주문 삭제) | TableDetailPage, OrderDetail |
| US-A06 (이용 완료) | TableDetailPage |
| US-A07 (과거 내역) | TableDetailPage |
| US-A08 (메뉴 관리) | MenuManagePage, MenuForm |

---

## 커버리지 검증

| 전체 스토리 | Unit 할당 | 상태 |
|-------------|-----------|------|
| US-C01 ~ US-C05 (5개) | Unit 1 + Unit 2 | ✅ 완료 |
| US-A01 ~ US-A08 (8개) | Unit 1 + Unit 3 | ✅ 완료 |
| **총 13개 스토리** | **모두 할당됨** | ✅ |
