# 요구사항 확인 질문

아래 질문에 답변해 주세요. 각 질문의 [Answer]: 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Node.js + NestJS (TypeScript)
C) Python + FastAPI
D) Java + Spring Boot
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Next.js (React 기반 풀스택 프레임워크)
C) Vue.js
D) Vanilla HTML/CSS/JavaScript (프레임워크 없음)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL (관계형 DB)
B) MySQL (관계형 DB)
C) SQLite (경량 파일 기반 DB, 개발/소규모 적합)
D) MongoDB (NoSQL 문서형 DB)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
프로젝트의 배포 환경은 어떻게 되나요?

A) 로컬 개발 환경에서만 실행 (배포 없음)
B) AWS 클라우드 배포 (EC2, ECS, Lambda 등)
C) Docker 컨테이너 기반 배포
D) Vercel/Netlify 등 PaaS 배포
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리 (모노리스 프론트엔드)
B) 고객용과 관리자용을 별도 프론트엔드 앱으로 분리
C) 백엔드 하나 + 프론트엔드 하나로 통합 (풀스택 모노리스)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
메뉴 이미지는 어떻게 관리하시겠습니까? (요구사항에 이미지 URL로 명시되어 있습니다)

A) 외부 이미지 URL만 사용 (직접 업로드 없음, URL 입력만)
B) 로컬 파일 시스템에 이미지 저장 + 서빙
C) AWS S3 등 클라우드 스토리지에 업로드
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
동시 접속 규모는 어느 정도를 예상하시나요?

A) 소규모 (1개 매장, 테이블 10개 이하)
B) 중규모 (1개 매장, 테이블 10~50개)
C) 대규모 (다수 매장, 테이블 50개 이상)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 blocking constraint로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9: Property-Based Testing Extension
이 프로젝트에 Property-Based Testing(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 blocking constraint로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 round-trip에만 PBT 규칙 적용 (알고리즘 복잡도가 제한적인 프로젝트에 적합)
C) No — PBT 규칙 건너뛰기 (단순 CRUD 애플리케이션, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 
