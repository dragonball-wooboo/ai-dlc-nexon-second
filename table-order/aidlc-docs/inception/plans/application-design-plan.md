# Application Design Plan

## 설계 계획

요구사항과 스토리가 명확하므로, 아래 체크리스트에 따라 설계를 진행합니다.

---

## 질문

### Question 1
백엔드 API 구조를 어떻게 설계하시겠습니까? A

A) 기능별 라우터 분리 (routes/menu.ts, routes/order.ts, routes/table.ts 등)
B) 도메인별 모듈 분리 (modules/menu/, modules/order/ 각각 controller+service+model)
C) 단일 파일에 모든 라우트 (소규모이므로 간단하게)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

### Question 2
프로젝트 전체 구조를 어떻게 구성하시겠습니까? A

A) 모노레포 (하나의 루트에 server/, client-customer/, client-admin/ 디렉토리)
B) 완전 분리 (각각 독립된 package.json, 별도 실행)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## 생성 단계 체크리스트

- [x] Step 1: 컴포넌트 정의 (components.md)
- [x] Step 2: 컴포넌트 메서드 정의 (component-methods.md)
- [x] Step 3: 서비스 레이어 정의 (services.md)
- [x] Step 4: 컴포넌트 의존성 정의 (component-dependency.md)
- [x] Step 5: 통합 설계 문서 (application-design.md)
