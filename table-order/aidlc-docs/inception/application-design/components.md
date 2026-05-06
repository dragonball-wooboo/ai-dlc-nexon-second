# 컴포넌트 정의

## 프로젝트 구조 (모노레포)

```
table-order/
├── server/                  # 백엔드 (Express + TypeScript)
├── client-customer/         # 고객용 프론트엔드 (React + TypeScript)
└── client-admin/            # 관리자용 프론트엔드 (React + TypeScript)
```

---

## 1. Server (백엔드)

### 1.1 Routes Layer (라우터)
| 컴포넌트 | 책임 |
|----------|------|
| `routes/auth.ts` | 관리자 로그인, 테이블 로그인 |
| `routes/menu.ts` | 메뉴 CRUD, 카테고리 조회 |
| `routes/order.ts` | 주문 생성, 조회, 상태 변경, 삭제 |
| `routes/table.ts` | 테이블 설정, 세션 관리, 이용 완료 |
| `routes/sse.ts` | SSE 실시간 주문 스트림 |
| `routes/upload.ts` | 이미지 파일 업로드 |

### 1.2 Database Layer (데이터)
| 컴포넌트 | 책임 |
|----------|------|
| `db/database.ts` | SQLite 연결 및 초기화 |
| `db/schema.ts` | 테이블 스키마 정의 및 마이그레이션 |

### 1.3 Middleware Layer
| 컴포넌트 | 책임 |
|----------|------|
| `middleware/auth.ts` | JWT 토큰 검증 |
| `middleware/error.ts` | 에러 핸들링 |

### 1.4 Utils
| 컴포넌트 | 책임 |
|----------|------|
| `utils/sse-manager.ts` | SSE 연결 관리 및 이벤트 브로드캐스트 |

---

## 2. Client-Customer (고객용 프론트엔드)

| 컴포넌트 | 책임 |
|----------|------|
| `pages/LoginPage` | 테이블 초기 설정 (1회) |
| `pages/MenuPage` | 메뉴 조회 (기본 화면) |
| `pages/CartPage` | 장바구니 관리 |
| `pages/OrderPage` | 주문 확정 |
| `pages/OrderHistoryPage` | 주문 내역 조회 |
| `components/MenuCard` | 메뉴 카드 UI |
| `components/CartItem` | 장바구니 항목 UI |
| `components/CategoryNav` | 카테고리 네비게이션 |
| `hooks/useCart` | 장바구니 상태 관리 (localStorage) |
| `hooks/useAuth` | 인증 상태 관리 |
| `api/client.ts` | API 호출 함수 |

---

## 3. Client-Admin (관리자용 프론트엔드)

| 컴포넌트 | 책임 |
|----------|------|
| `pages/LoginPage` | 관리자 로그인 |
| `pages/DashboardPage` | 실시간 주문 모니터링 (그리드) |
| `pages/MenuManagePage` | 메뉴 관리 (CRUD) |
| `pages/TableDetailPage` | 테이블 상세 (주문 목록, 과거 내역) |
| `components/TableCard` | 테이블별 주문 카드 |
| `components/OrderDetail` | 주문 상세 모달 |
| `components/MenuForm` | 메뉴 등록/수정 폼 |
| `hooks/useSSE` | SSE 실시간 연결 관리 |
| `hooks/useAuth` | JWT 인증 상태 관리 |
| `api/client.ts` | API 호출 함수 |
