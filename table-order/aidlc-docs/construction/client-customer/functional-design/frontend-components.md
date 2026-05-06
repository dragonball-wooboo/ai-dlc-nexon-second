# Frontend Components - Client Customer

## 페이지 구조

```
App
├── LoginPage (초기 설정, 자동 로그인 실패 시)
├── MenuPage (기본 화면)
│   ├── CategoryNav
│   └── MenuCard[]
├── CartPage
│   └── CartItem[]
├── OrderPage (주문 확정)
└── OrderHistoryPage
```

---

## 페이지별 상세

### LoginPage
| 항목 | 내용 |
|------|------|
| **경로** | `/login` |
| **상태** | storeId, tableNumber, password (form inputs) |
| **API** | POST /api/auth/table/login |
| **동작** | 로그인 성공 → token + tableId를 localStorage 저장 → /menu로 이동 |
| **자동 로그인** | 앱 시작 시 localStorage에 token 있으면 유효성 확인 후 /menu로 이동 |

### MenuPage
| 항목 | 내용 |
|------|------|
| **경로** | `/menu` (기본 화면) |
| **상태** | categories[], selectedCategory, menus[] |
| **API** | GET /api/menus?storeId=xxx |
| **동작** | 카테고리 선택 → 해당 메뉴 필터링, 메뉴 카드 클릭 → 장바구니에 추가 |

### CartPage
| 항목 | 내용 |
|------|------|
| **경로** | `/cart` |
| **상태** | useCart hook (localStorage 기반) |
| **API** | 없음 (클라이언트 전용) |
| **동작** | 수량 변경, 삭제, 총액 표시, "주문하기" 버튼 → /order로 이동 |

### OrderPage
| 항목 | 내용 |
|------|------|
| **경로** | `/order` |
| **상태** | cart items (useCart에서 가져옴), orderResult |
| **API** | POST /api/orders |
| **동작** | 최종 확인 → 주문 확정 → 성공 시 주문번호 5초 표시 → /menu 이동 + 장바구니 비우기 |

### OrderHistoryPage
| 항목 | 내용 |
|------|------|
| **경로** | `/orders` |
| **상태** | orders[] |
| **API** | GET /api/orders?sessionId=xxx |
| **동작** | 현재 세션 주문 목록 표시, 상태 뱃지 표시 |

---

## 공통 컴포넌트

### CategoryNav
- Props: `categories[], selectedId, onSelect(id)`
- 가로 스크롤 탭 형태

### MenuCard
- Props: `menu: {id, name, price, imageUrl, description}`
- 클릭 시 장바구니에 추가 (수량 1)
- 이미 장바구니에 있으면 수량 +1

### CartItem
- Props: `item: {menuId, name, price, quantity}, onQuantityChange, onRemove`
- +/- 버튼으로 수량 조절
- 삭제 버튼

---

## Hooks

### useCart
```typescript
interface CartItem { menuId: number; name: string; price: number; quantity: number; }

// 반환값
{
  items: CartItem[];
  addItem(menu: Menu): void;
  removeItem(menuId: number): void;
  updateQuantity(menuId: number, quantity: number): void;
  clearCart(): void;
  totalAmount: number;
  itemCount: number;
}
```
- localStorage 키: `table-order-cart`
- 상태 변경 시 자동 localStorage 동기화

### useAuth
```typescript
// 반환값
{
  token: string | null;
  tableId: number | null;
  sessionId: string | null;
  storeId: string | null;
  isLoggedIn: boolean;
  login(storeId, tableNumber, password): Promise<boolean>;
  logout(): void;
}
```
- localStorage 키: `table-order-auth`
