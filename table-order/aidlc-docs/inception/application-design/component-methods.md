# 컴포넌트 메서드 정의

## Server API Endpoints

### Auth Routes (`routes/auth.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/auth/admin/login` | 관리자 로그인 | `{storeId, username, password}` | `{token, expiresIn}` |
| POST | `/api/auth/table/login` | 테이블 로그인 | `{storeId, tableNumber, password}` | `{token, sessionId, tableId}` |

### Menu Routes (`routes/menu.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/menus` | 메뉴 전체 조회 | query: `storeId` | `{categories: [{name, menus: [...]}]}` |
| GET | `/api/menus/:id` | 메뉴 상세 조회 | param: `id` | `{menu}` |
| POST | `/api/menus` | 메뉴 등록 | `{name, price, description, category, imageUrl}` | `{menu}` |
| PUT | `/api/menus/:id` | 메뉴 수정 | `{name, price, description, category, imageUrl}` | `{menu}` |
| DELETE | `/api/menus/:id` | 메뉴 삭제 | param: `id` | `{success}` |
| PUT | `/api/menus/:id/order` | 메뉴 순서 변경 | `{sortOrder}` | `{success}` |

### Order Routes (`routes/order.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/orders` | 주문 생성 | `{storeId, tableId, sessionId, items: [{menuId, name, quantity, price}], totalAmount}` | `{order}` |
| GET | `/api/orders` | 주문 조회 (세션별) | query: `sessionId` | `{orders: [...]}` |
| GET | `/api/orders/table/:tableId` | 테이블 현재 주문 조회 | param: `tableId` | `{orders: [...], totalAmount}` |
| PUT | `/api/orders/:id/status` | 주문 상태 변경 | `{status}` | `{order}` |
| DELETE | `/api/orders/:id` | 주문 삭제 | param: `id` | `{success}` |

### Table Routes (`routes/table.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/tables` | 테이블 등록/설정 | `{storeId, tableNumber, password}` | `{table}` |
| GET | `/api/tables` | 테이블 목록 조회 | query: `storeId` | `{tables: [...]}` |
| POST | `/api/tables/:id/complete` | 테이블 이용 완료 | param: `id` | `{success}` |
| GET | `/api/tables/:id/history` | 과거 주문 내역 | query: `date` | `{history: [...]}` |

### SSE Routes (`routes/sse.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/sse/orders` | 실시간 주문 스트림 | query: `storeId` | SSE stream |

### Upload Routes (`routes/upload.ts`)
| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/upload/image` | 이미지 업로드 | multipart: `file` | `{imageUrl}` |

---

## Client Hooks

### useCart (고객용)
| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `addItem(menu)` | 장바구니에 메뉴 추가 | Menu 객체 | void |
| `removeItem(menuId)` | 장바구니에서 삭제 | menuId | void |
| `updateQuantity(menuId, qty)` | 수량 변경 | menuId, 수량 | void |
| `clearCart()` | 장바구니 비우기 | - | void |
| `getTotal()` | 총 금액 계산 | - | number |

### useSSE (관리자용)
| Method | Purpose | Input | Output |
|--------|---------|-------|--------|
| `connect(storeId)` | SSE 연결 시작 | storeId | void |
| `disconnect()` | SSE 연결 종료 | - | void |
| `onNewOrder(callback)` | 신규 주문 이벤트 핸들러 | callback | void |
| `onOrderUpdate(callback)` | 주문 상태 변경 이벤트 | callback | void |
