# Business Rules - Server

## 인증 규칙

### BR-AUTH-01: 관리자 로그인
- 매장ID + 사용자명 + 비밀번호 필수
- bcrypt로 비밀번호 검증
- 성공 시 JWT 토큰 발급 (만료: 16시간)
- JWT payload: `{ storeId, role: 'admin' }`

### BR-AUTH-02: 테이블 로그인
- 매장ID + 테이블번호 + 비밀번호 필수
- bcrypt로 비밀번호 검증
- 성공 시 JWT 토큰 발급 (만료: 16시간)
- JWT payload: `{ storeId, tableId, tableNumber, sessionId, role: 'table' }`
- sessionId: 현재 테이블의 currentSessionId 사용 (없으면 null, 첫 주문 시 생성)

---

## 메뉴 규칙

### BR-MENU-01: 메뉴 등록 검증
- name: 필수, 1~50자
- price: 필수, 0 이상 1,000,000 이하 (정수, 0원=무료 메뉴 허용)
- description: 선택, 최대 200자
- categoryId: 필수, 존재하는 카테고리
- imageUrl: 선택

### BR-MENU-02: 메뉴 조회
- storeId 기준으로 필터링
- 카테고리별 그룹화
- sortOrder 오름차순 정렬

### BR-MENU-03: 메뉴 삭제
- 해당 메뉴가 포함된 미완료 주문이 있어도 삭제 가능 (주문에는 스냅샷 저장됨)

---

## 주문 규칙

### BR-ORDER-01: 주문 생성
- items 배열 필수 (최소 1개)
- 각 item: menuId, menuName, quantity(1 이상), price 필수
- totalAmount = sum(item.quantity * item.price)
- 서버에서 totalAmount 재계산하여 검증
- 세션ID가 null이면 새 세션 생성 (UUID) → 테이블의 currentSessionId 업데이트
- 주문 생성 후 SSE로 `new-order` 이벤트 브로드캐스트

### BR-ORDER-02: 주문 상태 변경
- 허용 전이: pending → preparing → completed
- 역방향 전이 불가 (completed → preparing 불가)
- 상태 변경 후 SSE로 `order-updated` 이벤트 브로드캐스트

### BR-ORDER-03: 주문 삭제
- 관리자만 가능
- 삭제 후 SSE로 `order-deleted` 이벤트 브로드캐스트
- 물리적 삭제 (DB에서 제거)

### BR-ORDER-04: 주문 조회 (고객)
- sessionId 기준 필터링
- 현재 세션 주문만 반환
- createdAt 오름차순 정렬

---

## 테이블 규칙

### BR-TABLE-01: 테이블 등록
- storeId + tableNumber 조합 유니크
- password: 필수, 4자 이상
- bcrypt로 해싱 후 저장

### BR-TABLE-02: 테이블 이용 완료
- 현재 세션의 모든 주문을 OrderHistory로 이동
- orderData: 주문 + 주문항목을 JSON으로 직렬화
- completedAt: 현재 시각
- 테이블의 currentSessionId를 null로 리셋
- 해당 세션의 orders, order_items 삭제
- SSE로 `table-completed` 이벤트 브로드캐스트

### BR-TABLE-03: 과거 내역 조회
- tableId 기준 필터링
- date 파라미터로 날짜 필터링 (선택)
- completedAt 내림차순 정렬

---

## 세션 규칙

### BR-SESSION-01: 세션 생성
- 첫 주문 시 자동 생성 (UUID v4)
- 테이블의 currentSessionId에 저장

### BR-SESSION-02: 세션 종료
- 테이블 이용 완료 시 종료
- currentSessionId → null
- 다음 고객의 첫 주문 시 새 세션 자동 생성

---

## 이미지 업로드 규칙

### BR-UPLOAD-01: 이미지 업로드
- 허용 형식: jpg, jpeg, png, gif, webp
- 최대 크기: 5MB
- 파일명: UUID + 원본 확장자
- 저장 경로: `uploads/` 디렉토리
- 반환값: `/uploads/{filename}` (상대 경로)
