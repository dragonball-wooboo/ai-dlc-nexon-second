# User Story Generation Plan

## 스토리 생성 계획

### 접근 방식
요구사항 문서가 이미 상세하므로, **Persona-Based + User Journey** 하이브리드 접근을 사용합니다.
- 페르소나별로 스토리를 그룹화
- 각 페르소나 내에서 사용자 여정 순서로 정렬

---

## 질문

### Question 1
스토리의 우선순위 체계를 어떻게 설정하시겠습니까?

A) Must/Should/Could (MoSCoW 방식) - 필수/권장/선택으로 분류
B) High/Medium/Low 단순 3단계
C) 우선순위 없이 모두 MVP 필수 기능으로 처리
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
수용 기준(Acceptance Criteria)의 상세 수준은 어떻게 하시겠습니까?

A) 간결하게 - 핵심 조건 2~3개만 (빠른 개발에 적합)
B) 상세하게 - Given/When/Then 형식으로 모든 시나리오 포함
C) 중간 수준 - 핵심 조건 + 주요 예외 케이스
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
관리자가 매장에서 수행하는 주요 업무 흐름은 어떤 순서인가요?

A) 출근 → 로그인 → 주문 모니터링 위주 (주문 처리가 핵심)
B) 출근 → 로그인 → 메뉴 관리 → 주문 모니터링 (메뉴 변경이 빈번)
C) 출근 → 로그인 → 테이블 설정 → 주문 모니터링 → 퇴근 시 이용 완료 처리
X) Other (please describe after [Answer]: tag below)

[Answer]:C 

---

## 생성 단계 체크리스트

- [x] Step 1: 페르소나 정의 (고객, 관리자)
- [x] Step 2: 고객 페르소나 스토리 생성 (자동 로그인, 메뉴 조회, 장바구니, 주문, 내역 조회)
- [x] Step 3: 관리자 페르소나 스토리 생성 (인증, 주문 모니터링, 테이블 관리, 메뉴 관리)
- [x] Step 4: 수용 기준 작성
- [x] Step 5: 스토리 간 의존성 매핑
- [x] Step 6: 최종 검증 (INVEST 기준 확인)
