# Frontend Components - Client Admin

## 페이지 구조

```
App
├── LoginPage (관리자 로그인)
├── DashboardPage (실시간 주문 모니터링)
│   └── TableCard[] (테이블별 카드)
│       └── OrderDetail (모달)
├── TableDetailPage (테이블 상세)
│   └── OrderDetail
├── MenuManagePage (메뉴 관리)
│   └── MenuForm (등록/수정 폼)
```

---

## 페이지별 상세

### LoginPage
| 항목 | 내용 |
|------|------|
| **경로** | `/login` |
| **상태** | storeId, username, password |
| **API** | POST /api/auth/admin/login |
| **동작** | 로그인 성공 → JWT localStorage 저장 → /dashboard 이동 |

### DashboardPage
| 항목 | 내용 |
|------|------|
| **경로** | `/dashboard` (기본 화면) |
| **상태** | tables[], orders (테이블별 그룹), useSSE |
| **API** | GET /api/tables, GET /api/orders/table/:id, SSE /api/sse/orders |
| **동작** | 그리드 레이아웃으로 테이블 카드 표시, SSE로 실시간 업데이트, 카드 클릭 → 상세 |
| **레이아웃** | CSS Grid (반응형, 카드 최소 너비 280px) |

### TableDetailPage
| 항목 | 내용 |
|------|------|
| **경로** | `/tables/:id` |
| **상태** | table, orders[], history[] |
| **API** | GET /api/orders/table/:id, DELETE /api/orders/:id, POST /api/tables/:id/complete, GET /api/tables/:id/history |
| **동작** | 주문 목록 표시, 상태 변경, 주문 삭제, 이용 완료, 과거 내역 조회 |

### MenuManagePage
| 항목 | 내용 |
|------|------|
| **경로** | `/menus` |
| **상태** | categories[], menus[], editingMenu |
| **API** | GET/POST/PUT/DELETE /api/menus, POST /api/upload/image |
| **동작** | 메뉴 목록 표시, 추가/수정/삭제, 이미지 업로드, 순서 변경 |

---

## 공통 컴포넌트

### TableCard
- Props: `table, orders[], totalAmount, hasNewOrder`
- 테이블 번호, 총 주문액, 최신 주문 2~3개 미리보기
- 신규 주문 시 하이라이트 (배경색 변경 + 애니메이션)
- 클릭 → TableDetailPage로 이동

### OrderDetail
- Props: `order, onStatusChange, onDelete`
- 주문 전체 메뉴 목록 표시
- 상태 변경 버튼 (pending → preparing → completed)
- 삭제 버튼 (확인 팝업)

### MenuForm
- Props: `menu? (수정 시), onSubmit, onCancel`
- 필드: 메뉴명, 가격, 설명, 카테고리 선택, 이미지 업로드
- 검증: 필수 필드, 가격 범위 (100~1,000,000)

---

## Hooks

### useSSE
```typescript
// 반환값
{
  isConnected: boolean;
  connect(storeId: string): void;
  disconnect(): void;
  lastEvent: SSEEvent | null;
}

interface SSEEvent {
  type: 'new-order' | 'order-updated' | 'order-deleted' | 'table-completed';
  data: any;
}
```
- 연결 끊김 시 자동 재연결 (3초 후)
- 컴포넌트 언마운트 시 자동 disconnect

### useAuth
```typescript
// 반환값
{
  token: string | null;
  storeId: string | null;
  isLoggedIn: boolean;
  login(storeId, username, password): Promise<boolean>;
  logout(): void;
}
```
- localStorage 키: `admin-auth`
- 토큰 만료 시 자동 로그아웃
