# Domain Entities - Server

## Entity Relationship Diagram

```
+----------+       +----------+       +------------+
|  Store   |1----*|  Table   |1----*|   Order    |
+----------+       +----------+       +------------+
     |1                                     |1
     |                                      |
     *                                      *
+----------+                         +------------+
| Category |1----*+------+           | OrderItem  |
+----------+      | Menu |           +------------+
                  +------+

+----------+       +--------------+
|  Store   |1----*| OrderHistory |
+----------+       +--------------+
```

---

## Entities

### Store (매장)
```typescript
interface Store {
  id: string;           // 매장 식별자 (사용자 입력, PK)
  name: string;         // 매장명
  username: string;     // 관리자 사용자명
  passwordHash: string; // bcrypt 해시
  createdAt: string;    // ISO 8601
}
```

### Table (테이블)
```typescript
interface Table {
  id: number;              // 자동 증가 PK
  storeId: string;         // FK → Store
  tableNumber: number;     // 테이블 번호
  passwordHash: string;    // 테이블 비밀번호 해시
  currentSessionId: string | null; // 현재 세션 ID (null = 비활성)
  createdAt: string;
}
```

### Category (카테고리)
```typescript
interface Category {
  id: number;        // 자동 증가 PK
  storeId: string;   // FK → Store
  name: string;      // 카테고리명
  sortOrder: number; // 정렬 순서
}
```

### Menu (메뉴)
```typescript
interface Menu {
  id: number;          // 자동 증가 PK
  storeId: string;     // FK → Store
  categoryId: number;  // FK → Category
  name: string;        // 메뉴명
  price: number;       // 가격 (원)
  description: string; // 설명
  imageUrl: string;    // 이미지 경로 (/uploads/xxx.jpg)
  sortOrder: number;   // 정렬 순서
  createdAt: string;
}
```

### Order (주문)
```typescript
interface Order {
  id: number;          // 자동 증가 PK
  storeId: string;     // FK → Store
  tableId: number;     // FK → Table
  sessionId: string;   // 세션 ID
  status: OrderStatus; // 주문 상태
  totalAmount: number; // 총 금액
  createdAt: string;   // 주문 시각
}

type OrderStatus = 'pending' | 'preparing' | 'completed';
```

### OrderItem (주문 항목)
```typescript
interface OrderItem {
  id: number;       // 자동 증가 PK
  orderId: number;  // FK → Order
  menuId: number;   // 메뉴 ID (참조용)
  menuName: string; // 메뉴명 스냅샷
  quantity: number; // 수량
  price: number;    // 단가 스냅샷
}
```

### OrderHistory (과거 주문 이력)
```typescript
interface OrderHistory {
  id: number;          // 자동 증가 PK
  storeId: string;     // 매장 ID
  tableId: number;     // 테이블 ID
  tableNumber: number; // 테이블 번호
  sessionId: string;   // 세션 ID
  orderData: string;   // JSON 직렬화된 주문 데이터
  totalAmount: number; // 총 금액
  completedAt: string; // 이용 완료 시각
}
```
