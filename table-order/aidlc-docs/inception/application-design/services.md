# 서비스 레이어 정의

## 서비스 구조

백엔드는 기능별 라우터 구조이므로, 각 라우터 내에서 직접 DB 접근합니다.
별도 서비스 레이어 없이 **라우터 → DB** 직접 패턴을 사용합니다 (소규모 프로젝트에 적합).

---

## 핵심 유틸리티 서비스

### SSE Manager (`utils/sse-manager.ts`)
| 책임 | 설명 |
|------|------|
| 연결 관리 | 클라이언트 SSE 연결 등록/해제 |
| 이벤트 브로드캐스트 | 매장별 연결된 클라이언트에 이벤트 전송 |
| 이벤트 타입 | `new-order`, `order-updated`, `order-deleted`, `table-completed` |

### Auth Middleware (`middleware/auth.ts`)
| 책임 | 설명 |
|------|------|
| 토큰 검증 | JWT 토큰 유효성 확인 |
| 권한 분리 | 관리자 토큰 vs 테이블 토큰 구분 |
| 세션 만료 | 16시간 후 자동 만료 |

---

## 오케스트레이션 패턴

### 주문 생성 플로우
```
고객 앱 → POST /api/orders → DB 저장 → SSE Manager → 관리자 앱
```

### 주문 상태 변경 플로우
```
관리자 앱 → PUT /api/orders/:id/status → DB 업데이트 → SSE Manager → 고객 앱 (선택)
```

### 테이블 이용 완료 플로우
```
관리자 앱 → POST /api/tables/:id/complete → 주문 이력 이동 → 세션 리셋 → SSE Manager → 대시보드 업데이트
```
