# Unit of Work 정의

## 개발 순서
**순차적 개발**: Unit 1 (백엔드) → Unit 2 (고객용 프론트) → Unit 3 (관리자용 프론트)

---

## Unit 1: Server (백엔드 API)

| 항목 | 내용 |
|------|------|
| **이름** | server |
| **디렉토리** | `server/` |
| **기술** | Express + TypeScript + SQLite + JWT |
| **책임** | REST API, 인증, 데이터 관리, SSE, 이미지 서빙 |
| **포트** | 3000 |
| **개발 순서** | 1번째 |

### 포함 기능
- 매장/테이블/메뉴/주문 CRUD API
- JWT 기반 인증 (관리자 + 테이블)
- SSE 실시간 주문 스트림
- 이미지 파일 업로드/서빙
- SQLite 데이터베이스 스키마 및 초기화

### 코드 구조
```
server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── order.ts
│   │   ├── table.ts
│   │   ├── sse.ts
│   │   └── upload.ts
│   ├── db/
│   │   ├── database.ts
│   │   └── schema.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error.ts
│   └── utils/
│       └── sse-manager.ts
└── uploads/
```

---

## Unit 2: Client-Customer (고객용 프론트엔드)

| 항목 | 내용 |
|------|------|
| **이름** | client-customer |
| **디렉토리** | `client-customer/` |
| **기술** | React + TypeScript + Vite |
| **책임** | 고객 주문 인터페이스 |
| **포트** | 3001 |
| **개발 순서** | 2번째 |

### 포함 기능
- 테이블 자동 로그인
- 메뉴 조회 (카테고리별)
- 장바구니 관리 (localStorage)
- 주문 생성 및 확인
- 주문 내역 조회

### 코드 구조
```
client-customer/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── MenuPage.tsx
    │   ├── CartPage.tsx
    │   ├── OrderPage.tsx
    │   └── OrderHistoryPage.tsx
    ├── components/
    │   ├── MenuCard.tsx
    │   ├── CartItem.tsx
    │   └── CategoryNav.tsx
    ├── hooks/
    │   ├── useCart.ts
    │   └── useAuth.ts
    └── api/
        └── client.ts
```

---

## Unit 3: Client-Admin (관리자용 프론트엔드)

| 항목 | 내용 |
|------|------|
| **이름** | client-admin |
| **디렉토리** | `client-admin/` |
| **기술** | React + TypeScript + Vite |
| **책임** | 관리자 대시보드 |
| **포트** | 3002 |
| **개발 순서** | 3번째 |

### 포함 기능
- 관리자 로그인 (JWT)
- 실시간 주문 모니터링 (SSE)
- 주문 상태 변경
- 테이블 관리 (설정, 이용 완료, 과거 내역)
- 메뉴 관리 (CRUD + 이미지 업로드)

### 코드 구조
```
client-admin/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── MenuManagePage.tsx
    │   └── TableDetailPage.tsx
    ├── components/
    │   ├── TableCard.tsx
    │   ├── OrderDetail.tsx
    │   └── MenuForm.tsx
    ├── hooks/
    │   ├── useSSE.ts
    │   └── useAuth.ts
    └── api/
        └── client.ts
```
