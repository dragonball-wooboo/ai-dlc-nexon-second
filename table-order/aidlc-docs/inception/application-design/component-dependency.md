# 컴포넌트 의존성

## 시스템 의존성 다이어그램

```
+-------------------+         +-------------------+
|  client-customer  |         |   client-admin    |
|  (React, :3001)   |         |  (React, :3002)   |
+--------+----------+         +--------+----------+
         |                              |
         |  HTTP REST API               |  HTTP REST API + SSE
         |                              |
         +-------------+----------------+
                       |
                       v
              +--------+--------+
              |     server      |
              |  (Express, :3000)|
              +--------+--------+
                       |
              +--------+--------+
              |                 |
              v                 v
     +--------+---+    +-------+--------+
     |   SQLite   |    |  uploads/      |
     |  (data.db) |    |  (이미지 파일)  |
     +------------+    +----------------+
```

## 의존성 매트릭스

| From → To | server | client-customer | client-admin | SQLite | uploads/ |
|-----------|--------|-----------------|--------------|--------|----------|
| **server** | - | - | - | ✅ Read/Write | ✅ Read/Write |
| **client-customer** | ✅ REST API | - | - | - | - |
| **client-admin** | ✅ REST API + SSE | - | - | - | - |

## 통신 패턴

| 패턴 | From | To | 방식 |
|------|------|-----|------|
| 메뉴 조회 | client-customer | server | GET REST |
| 주문 생성 | client-customer | server | POST REST |
| 실시간 주문 | server | client-admin | SSE (Server → Client) |
| 이미지 업로드 | client-admin | server | POST multipart |
| 이미지 서빙 | server | client-* | GET static file |

## 데이터 흐름

### 주문 데이터 흐름
1. 고객이 주문 생성 → `POST /api/orders`
2. 서버가 DB에 저장
3. 서버가 SSE로 관리자에게 알림
4. 관리자가 상태 변경 → `PUT /api/orders/:id/status`
5. 서버가 DB 업데이트

### 세션 데이터 흐름
1. 관리자가 테이블 설정 → `POST /api/tables`
2. 고객 태블릿이 자동 로그인 → `POST /api/auth/table/login`
3. 서버가 세션ID 발급
4. 이후 주문은 세션ID로 그룹화
5. 이용 완료 시 세션 종료 → 과거 이력으로 이동
