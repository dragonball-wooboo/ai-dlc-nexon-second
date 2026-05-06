# Application Design (통합 문서)

## 아키텍처 개요

소규모 매장용 테이블오더 서비스. 모노레포 구조로 3개 모듈 구성.

```
table-order/
├── server/              # Express + TypeScript + SQLite
│   ├── src/
│   │   ├── routes/      # 기능별 라우터 (auth, menu, order, table, sse, upload)
│   │   ├── db/          # SQLite 연결 및 스키마
│   │   ├── middleware/  # JWT 인증, 에러 핸들링
│   │   ├── utils/       # SSE Manager
│   │   └── index.ts     # 앱 진입점
│   └── uploads/         # 이미지 파일 저장
├── client-customer/     # React + TypeScript (고객용)
│   └── src/
│       ├── pages/       # 페이지 컴포넌트
│       ├── components/  # 재사용 UI 컴포넌트
│       ├── hooks/       # 커스텀 훅 (useCart, useAuth)
│       └── api/         # API 호출 함수
└── client-admin/        # React + TypeScript (관리자용)
    └── src/
        ├── pages/       # 페이지 컴포넌트
        ├── components/  # 재사용 UI 컴포넌트
        ├── hooks/       # 커스텀 훅 (useSSE, useAuth)
        └── api/         # API 호출 함수
```

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 백엔드 런타임 | Node.js | 18+ |
| 백엔드 프레임워크 | Express | 4.x |
| 언어 | TypeScript | 5.x |
| 데이터베이스 | SQLite (better-sqlite3) | latest |
| 인증 | jsonwebtoken (JWT) | latest |
| 비밀번호 | bcrypt | latest |
| 파일 업로드 | multer | latest |
| 프론트엔드 | React | 18.x |
| 빌드 도구 | Vite | latest |
| HTTP 클라이언트 | fetch (내장) | - |
| 라우팅 | react-router-dom | 6.x |

---

## 데이터 모델 (SQLite)

### stores (매장)
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | 매장 식별자 |
| name | TEXT | 매장명 |
| username | TEXT | 관리자 사용자명 |
| password_hash | TEXT | bcrypt 해시 |
| created_at | TEXT | 생성 시각 |

### tables (테이블)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| store_id | TEXT (FK) | 매장 ID |
| table_number | INTEGER | 테이블 번호 |
| password_hash | TEXT | 테이블 비밀번호 해시 |
| current_session_id | TEXT | 현재 세션 ID (nullable) |
| created_at | TEXT | 생성 시각 |

### categories (카테고리)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| store_id | TEXT (FK) | 매장 ID |
| name | TEXT | 카테고리명 |
| sort_order | INTEGER | 정렬 순서 |

### menus (메뉴)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| store_id | TEXT (FK) | 매장 ID |
| category_id | INTEGER (FK) | 카테고리 ID |
| name | TEXT | 메뉴명 |
| price | INTEGER | 가격 (원) |
| description | TEXT | 설명 |
| image_url | TEXT | 이미지 경로 |
| sort_order | INTEGER | 정렬 순서 |
| created_at | TEXT | 생성 시각 |

### orders (주문)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| store_id | TEXT (FK) | 매장 ID |
| table_id | INTEGER (FK) | 테이블 ID |
| session_id | TEXT | 세션 ID |
| status | TEXT | 상태 (pending/preparing/completed) |
| total_amount | INTEGER | 총 금액 |
| created_at | TEXT | 주문 시각 |

### order_items (주문 항목)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| order_id | INTEGER (FK) | 주문 ID |
| menu_id | INTEGER | 메뉴 ID |
| menu_name | TEXT | 메뉴명 (스냅샷) |
| quantity | INTEGER | 수량 |
| price | INTEGER | 단가 (스냅샷) |

### order_history (과거 주문 이력)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | 자동 증가 |
| store_id | TEXT | 매장 ID |
| table_id | INTEGER | 테이블 ID |
| table_number | INTEGER | 테이블 번호 |
| session_id | TEXT | 세션 ID |
| order_data | TEXT (JSON) | 주문 데이터 (JSON 직렬화) |
| total_amount | INTEGER | 총 금액 |
| completed_at | TEXT | 이용 완료 시각 |

---

## API 엔드포인트 요약

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Auth | 2 (admin login, table login) | No |
| Menu | 6 (CRUD + order) | Admin (CUD), Public (R) |
| Order | 5 (create, list, table, status, delete) | Table (create, list), Admin (status, delete) |
| Table | 4 (create, list, complete, history) | Admin |
| SSE | 1 (order stream) | Admin |
| Upload | 1 (image) | Admin |
| **Total** | **19 endpoints** | |

---

## 실시간 통신 (SSE)

### 이벤트 타입
| Event | Payload | Trigger |
|-------|---------|---------|
| `new-order` | `{order}` | 고객이 주문 생성 시 |
| `order-updated` | `{orderId, status}` | 관리자가 상태 변경 시 |
| `order-deleted` | `{orderId, tableId}` | 관리자가 주문 삭제 시 |
| `table-completed` | `{tableId}` | 관리자가 이용 완료 시 |

---

## 포트 구성
| 서비스 | 포트 | 용도 |
|--------|------|------|
| server | 3000 | API + SSE + 이미지 서빙 |
| client-customer | 3001 | 고객용 React 앱 |
| client-admin | 3002 | 관리자용 React 앱 |
