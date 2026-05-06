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
| `feature/{기능명}` | 기능 개발 | 신규 기능 개발 작업 |
| `fix/{버그명}` | 버그 수정 | 기능 오류 및 버그 수정 |
| `docs/{문서명}` | 문서 작업 | README, Wiki, 설계 문서 등 문서 작업 |
| `hotfix/{긴급수정명}` | 긴급 수정 | main 기준 긴급 장애 대응 |

---

## 3. 브랜치 네이밍 규칙

브랜치명은 기능 또는 작업 목적이 바로 드러나도록 작성한다.  
이슈번호는 브랜치명에 넣지 않고, PR 제목 / PR 본문 / 커밋 메시지에서 연결한다.

---

## 3.1 기능 개발 브랜치

```bash
feature/{기능명}
```

예시:

```bash
feature/auth
feature/child-profile
feature/recommendation
feature/program
feature/application
feature/payment
feature/community
feature/review
feature/bookmark
feature/search
feature/notification
feature/upload
feature/flyway
```

---

## 3.2 버그 수정 브랜치

```bash
fix/{버그명}
```

예시:

```bash
fix/auth-token
fix/payment-status
fix/redis-lock
fix/flyway-migration
fix/swagger-config
```

---

## 3.3 문서 작업 브랜치

```bash
docs/{문서명}
```

예시:

```bash
docs/git-workflow
docs/api-spec
docs/erd
docs/readme
docs/wiki
```

---

## 3.4 긴급 수정 브랜치

```bash
hotfix/{긴급수정명}
```

예시:

```bash
hotfix/prod-health-check
hotfix/payment-callback-error
hotfix/security-config
```

---

## 4. 기본 작업 흐름

## 4.1 develop 브랜치 최신화

모든 기능 개발은 `develop` 브랜치를 기준으로 시작한다.

```bash
git checkout develop
git pull origin develop
```

---

## 4.2 작업 브랜치 생성

```bash
git checkout -b feature/{기능명}
```

예시:

```bash
git checkout -b feature/auth
git checkout -b feature/payment
git checkout -b feature/community
```

문서 작업인 경우:

```bash
git checkout -b docs/git-workflow
```

버그 수정인 경우:

```bash
git checkout -b fix/payment-status
```

---

## 4.3 작업 후 커밋

커밋 메시지에는 반드시 관련 이슈번호를 포함한다.

```bash
git add .
git commit -m "type: 작업 내용 (#이슈번호)"
```

예시:

```bash
feat: 카카오 OAuth 로그인 API 추가 (#5)
feat: 자녀 프로필 CRUD API 구현 (#9)
feat: 선착순 신청 API 구현 (#16)
fix: 결제 상태 업데이트 오류 수정 (#17)
docs: Git 브랜치 전략 문서 수정 (#83)
chore: 로컬 설정 민감 기본값 제거 (#84)
```

---

## 4.4 원격 브랜치 push

```bash
git push -u origin feature/{기능명}
```

예시:

```bash
git push -u origin feature/auth
git push -u origin feature/payment
git push -u origin docs/git-workflow
```

---

## 4.5 Pull Request 생성

- base branch: `develop`
- compare branch: 작업 브랜치
    - 예: `feature/auth`
    - 예: `feature/payment`
    - 예: `docs/git-workflow`
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

PR 제목에는 관련 이슈번호를 포함한다.

```bash
[#이슈번호] 작업 요약
```

예시:

```bash
[#83] 브랜치 전략 / PR 규칙 / 커밋 컨벤션 문서화
[#84] 로컬 설정 민감 기본값 제거
[#95] Flyway 초기 마이그레이션 설정
[#16] 선착순 신청 API 구현
```

---

## 5.3 PR 본문 이슈 연결 규칙

PR 본문에는 관련 이슈를 반드시 연결한다.

진행 중인 이슈를 참조만 할 경우:

```md
refs #83
```

해당 PR 머지로 이슈를 완료 처리할 경우:

```md
close #83
```

또는:

```md
resolve #83
```

---

## 5.4 PR 머지 조건

PR은 아래 조건을 모두 만족해야 머지할 수 있다.

- CI 통과
- 리뷰어 1명 이상 승인
- 충돌 없음
- 관련 이슈 연결
- 민감 정보 포함 없음

---

## 5.5 리뷰어 지정 규칙

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
feat: 카카오 OAuth 로그인 API 추가 (#5)
feat: 자녀 프로필 CRUD API 구현 (#9)
feat: 추천 엔진 API 구현 (#10)
fix: 결제 승인 상태 업데이트 오류 수정 (#17)
docs: Git 브랜치 전략 문서 수정 (#83)
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

## 7. 브랜치명과 이슈번호 관리 방식

브랜치명에는 이슈번호를 넣지 않는다.

대신 아래 위치에서 이슈번호를 관리한다.

| 위치 | 예시 |
|---|---|
| PR 제목 | `[#16] 선착순 신청 API 구현` |
| PR 본문 | `refs #16` 또는 `close #16` |
| 커밋 메시지 | `feat: 선착순 신청 API 구현 (#16)` |

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
- 설정 변경 1개

나쁜 PR 단위:

- 로그인 + 추천 + 결제 + 문서 수정 한 번에 포함
- 백엔드 + 프론트 + 인프라를 한 PR에 모두 포함
- 여러 이슈를 한 PR에 모두 포함

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

git checkout -b feature/{기능명}

# 작업 진행

git add .
git commit -m "type: 작업 내용 (#이슈번호)"

git push -u origin feature/{기능명}

# GitHub에서 PR 생성
# base: develop
# compare: feature/{기능명}
# PR 제목과 본문에 이슈번호 연결
# 리뷰 승인 + CI 통과 후 develop 머지
```