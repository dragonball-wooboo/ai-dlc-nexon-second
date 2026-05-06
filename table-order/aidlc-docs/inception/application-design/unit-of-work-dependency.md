# Unit of Work 의존성

## 의존성 매트릭스

| Unit | 의존 대상 | 의존 유형 | 설명 |
|------|-----------|-----------|------|
| Unit 1 (server) | 없음 | - | 독립 실행 가능 |
| Unit 2 (client-customer) | Unit 1 (server) | REST API | 메뉴 조회, 주문 생성, 인증 |
| Unit 3 (client-admin) | Unit 1 (server) | REST API + SSE | 주문 관리, 메뉴 관리, 실시간 스트림 |

## 의존성 다이어그램

```
Unit 1 (server)
    ^           ^
    |           |
    | REST      | REST + SSE
    |           |
Unit 2          Unit 3
(customer)      (admin)
```

## 개발 순서 근거

1. **Unit 1 먼저**: 프론트엔드가 연동할 API가 필요
2. **Unit 2 다음**: 고객 주문이 있어야 관리자 모니터링 테스트 가능
3. **Unit 3 마지막**: 모든 API + 주문 데이터가 있는 상태에서 개발

## 통합 포인트

| 통합 지점 | Unit From | Unit To | 프로토콜 |
|-----------|-----------|---------|----------|
| 메뉴 조회 | client-customer | server | GET /api/menus |
| 주문 생성 | client-customer | server | POST /api/orders |
| 주문 스트림 | server | client-admin | SSE /api/sse/orders |
| 이미지 업로드 | client-admin | server | POST /api/upload/image |
| 이미지 서빙 | server | client-* | GET /uploads/* |
