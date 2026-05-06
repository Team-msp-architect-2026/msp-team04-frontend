# Git 브랜치 전략 / 커밋 컨벤션

## 1. 목적

MoMent 프로젝트의 Git 작업 흐름을 통일하여  
브랜치 충돌, 무분별한 직접 push, 커밋 메시지 혼선을 방지한다.

본 문서는 팀 전체가 공통으로 따르는 브랜치 전략, PR 규칙, 코드 리뷰 기준, 커밋 컨벤션을 정의한다.

---

## 2. 브랜치 전략

| 브랜치 | 용도 | 설명 |
|---|---|---|
| `main` | 프로덕션 배포용 | 실제 배포 기준 브랜치 |
| `develop` | 통합 개발 브랜치 | 기능 개발 완료 후 통합되는 브랜치 |
| `feature/{이슈번호}-{설명}` | 기능 개발 | 신규 기능 개발 작업 |
| `fix/{이슈번호}-{설명}` | 버그 수정 | 기능 오류 및 버그 수정 |
| `hotfix/{설명}` | 긴급 수정 | main 기준 긴급 장애 대응 |

---

## 3. 브랜치 네이밍 규칙

## 3.1 기능 개발 브랜치

```bash
feature/{이슈번호}-{설명}
```

예시:

```bash
feature/83-git-convention
feature/84-backend-init
feature/95-flyway-init
feature/101-payment-flow-wiki
```

---

## 3.2 버그 수정 브랜치

```bash
fix/{이슈번호}-{설명}
```

예시:

```bash
fix/120-login-token-error
fix/121-payment-status-error
```

---

## 3.3 긴급 수정 브랜치

```bash
hotfix/{설명}
```

예시:

```bash
hotfix/prod-health-check
hotfix/payment-callback-error
```

---

## 4. 기본 작업 흐름

## 4.1 develop 브랜치 최신화

```bash
git checkout develop
git pull origin develop
```

## 4.2 작업 브랜치 생성

```bash
git checkout -b feature/{이슈번호}-{설명}
```

예시:

```bash
git checkout -b feature/83-git-convention
```

## 4.3 작업 후 커밋

```bash
git add .
git commit -m "docs: Git 브랜치 전략 및 커밋 컨벤션 문서화 (#83)"
```

## 4.4 원격 브랜치 push

```bash
git push -u origin feature/83-git-convention
```

## 4.5 Pull Request 생성

- base branch: `develop`
- compare branch: `feature/{이슈번호}-{설명}`
- PR 템플릿 작성
- 관련 이슈 연결
- 리뷰어 1명 이상 지정
- CI 통과 확인 후 머지

---

## 5. Pull Request 규칙

## 5.1 PR 생성 기준

다음 작업은 반드시 PR로 병합한다.

- 기능 개발
- 버그 수정
- 문서 수정
- 설정 변경
- 인프라 코드 변경
- DB 마이그레이션 변경

`main`, `develop` 브랜치에는 직접 push하지 않는다.

---

## 5.2 PR 제목 규칙

```bash
[#이슈번호] 작업 요약
```

예시:

```bash
[#83] Git 브랜치 전략 및 PR 템플릿 추가
[#95] Flyway 초기 마이그레이션 설정
[#12] 추천 엔진 API 구현
```

---

## 5.3 PR 머지 조건

PR은 아래 조건을 모두 만족해야 머지할 수 있다.

- CI 통과
- 리뷰어 1명 이상 승인
- 충돌 없음
- 관련 이슈 연결
- 민감 정보 포함 없음

---

## 5.4 리뷰어 지정 규칙

- 본인이 작업한 PR은 본인이 직접 머지하지 않는다.
- 최소 1명 이상 리뷰어를 지정한다.
- 리뷰어는 코드 변경 범위, 테스트 여부, 컨벤션 준수 여부를 확인한다.
- 수정 요청이 있으면 반영 후 다시 리뷰 요청한다.

---

## 6. 커밋 컨벤션

## 6.1 커밋 메시지 형식

```bash
type: 작업 내용 (#이슈번호)
```

예시:

```bash
feat: 카카오 OAuth 로그인 API 추가 (#12)
fix: 결제 승인 상태 업데이트 오류 수정 (#17)
docs: Git 브랜치 전략 문서 추가 (#83)
chore: 프로젝트 기본 설정 추가 (#84)
```

---

## 6.2 커밋 타입

| 타입 | 의미 | 예시 |
|---|---|---|
| `feat` | 신규 기능 추가 | `feat: 자녀 프로필 등록 API 추가 (#9)` |
| `fix` | 버그 수정 | `fix: JWT 만료 검증 오류 수정 (#15)` |
| `docs` | 문서 수정 | `docs: README 실행 가이드 추가 (#22)` |
| `chore` | 설정, 빌드, 기타 작업 | `chore: Gradle 의존성 추가 (#84)` |
| `refactor` | 리팩토링 | `refactor: 추천 점수 계산 로직 분리 (#10)` |
| `test` | 테스트 코드 | `test: 신청 API 동시성 테스트 추가 (#16)` |
| `style` | 코드 스타일 수정 | `style: import 정렬 및 포맷팅 수정 (#31)` |

---

## 7. 이슈 연결 규칙

PR 본문에는 관련 이슈를 반드시 연결한다.

```md
close #83
```

또는

```md
resolve #83
```

해당 PR이 머지되면 연결된 이슈가 자동으로 종료된다.

---

## 8. 금지 사항

- `main` 직접 push 금지
- `develop` 직접 push 금지
- `.env` 파일 커밋 금지
- DB 비밀번호, JWT Secret, API Key 커밋 금지
- 리뷰 없이 머지 금지
- 하나의 PR에 너무 많은 작업 포함 금지
- `node_modules`, `.expo`, `build`, `.gradle` 등 빌드 산출물 커밋 금지

---

## 9. 권장 PR 단위

좋은 PR 단위:

- 로그인 API 1개
- 자녀 프로필 CRUD 1개
- Flyway 마이그레이션 1개
- 문서 수정 1개

나쁜 PR 단위:

- 로그인 + 추천 + 결제 + 문서 수정 한 번에 포함
- 백엔드 + 프론트 + 인프라를 한 PR에 모두 포함

---

## 10. Branch Protection Rule 권장 설정

`main`, `develop` 브랜치에는 다음 규칙을 적용한다.

- Require a pull request before merging
- Require approvals: 1명 이상
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push to matching branches
- Allow force pushes 비활성화
- Allow deletions 비활성화

---

## 11. 최종 작업 흐름 요약

```bash
git checkout develop
git pull origin develop

git checkout -b feature/{이슈번호}-{설명}

# 작업 진행

git add .
git commit -m "type: 작업 내용 (#이슈번호)"

git push -u origin feature/{이슈번호}-{설명}

# GitHub에서 PR 생성
# 리뷰 승인 + CI 통과 후 develop 머지
```