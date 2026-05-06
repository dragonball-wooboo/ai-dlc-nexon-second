# Business Logic Model - Server

## 주문 생성 플로우

```
1. 클라이언트 → POST /api/orders (items, tableId, storeId)
2. 서버: JWT 토큰에서 tableId, storeId 추출
3. 서버: items 검증 (비어있지 않은지, 수량 > 0)
4. 서버: totalAmount 재계산 (sum of qty * price)
5. 서버: 테이블의 currentSessionId 확인
   - null이면 → UUID 생성 → 테이블 업데이트
   - 있으면 → 기존 sessionId 사용
6. 서버: orders 테이블에 INSERT
7. 서버: order_items 테이블에 각 항목 INSERT
8. 서버: SSE Manager로 'new-order' 이벤트 전송
9. 서버: 생성된 주문 정보 반환
```

## 테이블 이용 완료 플로우

```
1. 관리자 → POST /api/tables/:id/complete
2. 서버: JWT 토큰에서 storeId 추출, 권한 확인 (admin)
3. 서버: 테이블 조회, currentSessionId 확인
   - null이면 → 에러 (이미 완료된 테이블)
4. 서버: 해당 sessionId의 모든 주문 조회
5. 서버: 각 주문 + 주문항목을 JSON으로 직렬화
6. 서버: order_history에 INSERT (주문별 또는 세션 단위)
7. 서버: 해당 세션의 order_items 삭제
8. 서버: 해당 세션의 orders 삭제
9. 서버: 테이블의 currentSessionId → null
10. 서버: SSE Manager로 'table-completed' 이벤트 전송
11. 서버: 성공 응답 반환
```

## SSE 연결 관리 플로우

```
1. 관리자 앱 → GET /api/sse/orders?storeId=xxx
2. 서버: JWT 토큰 검증 (admin)
3. 서버: SSE 연결 설정 (Content-Type: text/event-stream)
4. 서버: SSE Manager에 연결 등록 (storeId 기준)
5. 서버: 연결 유지 (keep-alive)
6. [이벤트 발생 시] SSE Manager → 해당 storeId의 모든 연결에 이벤트 전송
7. [연결 종료 시] SSE Manager에서 연결 제거
```

## 인증 플로우

### 관리자 로그인
```
1. POST /api/auth/admin/login { storeId, username, password }
2. stores 테이블에서 storeId + username으로 조회
3. bcrypt.compare(password, passwordHash)
4. 성공 → JWT 생성 { storeId, role: 'admin', exp: 16h }
5. 반환: { token, expiresIn: '16h' }
```

### 테이블 로그인
```
1. POST /api/auth/table/login { storeId, tableNumber, password }
2. tables 테이블에서 storeId + tableNumber로 조회
3. bcrypt.compare(password, passwordHash)
4. 성공 → JWT 생성 { storeId, tableId, tableNumber, sessionId, role: 'table', exp: 16h }
5. 반환: { token, sessionId, tableId }
```
