# Ask Plant — 프로젝트 현재 상태 (STATUS)

> 마지막 갱신: 2026-07-05 · 로그인 API 실연동 + auth store fetchMe + router guard 강화 + Plant 화면 mock 완전 제거 반영
>
> 이 문서는 실제 코드를 기준으로 "지금 무엇이 동작하는가"만 기록하는 단일 진실 소스(Single Source of Truth)다.
> 설계 근거/전체 로드맵은 [DB 명세서](./db-specification.md), [API 명세서](./api-specification.md), [ROADMAP](./ROADMAP.md)를 참고한다.

## 1. 현재 개발 완료 상태 요약

| 영역 | 상태 | 비고 |
|---|---|---|
| 프로젝트 골격 (모노레포: client/server) | ✅ | npm workspaces + concurrently |
| DB 스키마 (Prisma, 12개 모델) | ✅ | `db push`로만 동기화, migration 파일 없음 |
| **Plant CRUD API** | ✅ | 인증 필수 + RBAC(ownerId 기반) 적용, QR 자동발급, Soft Delete |
| **인증 API (JWT)** | ✅ | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| **Public 조회 API** | ✅ | `GET /public/plants/:qrCode`, 인증 불필요, 관리자 필드 제외 |
| CommonCode / Species 조회 API | ✅ | 조회 전용, **인증 미적용**(Plant와 보호 수준 다름) |
| Location/Image/History/Cart/QR/User관리 API | ❌ | 스키마·문서만 존재, 서버 코드 없음 |
| Seed 스크립트 | ✅ | SYSTEM ADMIN/테스트 CUSTOMER + 테스트 데이터, upsert 기반 재실행 안전 |
| **Vue 관리자 화면 — Plant(목록/상세/등록)** | ✅ API 연동, mock 0% | 목록 필터(상태/카테고리) 드롭다운까지 실 API 전환 완료, `mockCategories`/`commonCodes.mock` 참조 제거 |
| **Vue 관리자 화면 — CommonCode** | ✅ API 연동 | 그룹 Grid + 코드 Grid + 검색으로 리팩토링 완료 |
| Vue 관리자 화면 — 나머지 7종(Species/Location/Photo/QR/User/Settings/Dashboard) | ❌ Mock | `client/src/mock/*.mock.ts` 데이터로만 렌더링 |
| **Vue 로그인 화면 / 토큰 저장·첨부** | ✅ | `/login` 페이지, localStorage 토큰 저장, axios 인터셉터, 401 리다이렉트, `/admin/*` 라우터 가드 모두 구현 |
| Vue 모바일 Public 화면(`/p/:qrCode` 등) | ❌ Mock | 서버에 대응 API(`/public/plants/:qrCode`)는 있으나 미연동 |

## 2. 아키텍처 상태

**단계 판단**: 초기 개발 → API 개발(백엔드 SaaS 인증/RBAC 완료) → **프론트 연결(로그인 계층 포함 2/9 화면 API 연동)** → SaaS 완성 미도달.
백엔드-프론트 인증 단절 문제는 해소됐지만, 여전히 7/9 관리자 화면이 mock 상태라 "완성"까지는 아니다.

**강점**

- `Route → Controller → Service → Repository` 레이어가 전 도메인(Plant/Auth/CommonCode/Species/Public)에 일관 적용됨
- RBAC이 서비스 레이어에서 강제됨 — CUSTOMER의 `ownerId` 필터는 쿼리 파라미터로 우회 불가, 생성 시 `ownerId`도 클라이언트 입력을 무시하고 서버가 강제 설정
- Public API가 컨트롤러·서비스·리포지토리 전 계층에서 물리적으로 분리되어 있고, 관리자 전용 필드는 Prisma `select` 단계에서부터 조회하지 않음(응답 유출 구조적으로 불가)
- Seed 스크립트가 전부 `upsert` 기반이라 재실행해도 안전, 신규 환경 온보딩 비용이 낮음
- 프론트 토큰 저장 로직(`api/http.ts`의 `getStoredAccessToken` 등)을 Pinia 스토어와 분리해 `router → stores/auth → api/auth.api → api/http` 순환 참조 없이 구성함
- `router.beforeEach`가 최초 보호 라우트 진입 시 `GET /auth/me`로 토큰을 서버에서 재검증(`meChecked` 플래그로 1회만 수행) — localStorage 토큰이 위조/만료됐어도 화면이 잠깐이라도 렌더링되지 않고 즉시 `/login`으로 이동

**위험 요소**

- **API 보호 수준 불일치**: `/plants`는 인증 필수인데 `/common-codes`, `/species`는 여전히 무인증이라 도메인별 보안 정책이 다르다.
- **401 리다이렉트가 풀 리로드 방식**: `api/http.ts`의 401 처리는 `window.location.href` 이동을 사용해 순환 참조를 피했다 — 라우터 상태(SPA 네비게이션)를 보존하지 않고 페이지를 새로고침한다. 추후 라우터 인스턴스를 지연 참조(dynamic import)하는 방식으로 개선 여지가 있다.
- Refresh Token이 없어 `JWT_EXPIRES_IN=1d` 만료 시 자동 재로그인 없이 즉시 로그아웃(401) 처리된다.
- Migration 이력 없음(`db push`만 사용) — 스키마 변경 추적/롤백 불가
- 전 모델 PK가 `cuid()`인데 `docs/RULES.md`는 "모든 PK는 UUID"를 명시 — 규칙과 실제 코드가 불일치한 채 방치됨
- 테스트 코드 전무(unit/integration) — 회귀 검증 수단이 curl 수동 테스트뿐
- Mock 스토어(species/location/dashboard/cart)와 API 스토어(plant/commonCode)가 공존해 화면마다 데이터 신뢰도가 다름(동일 species ID가 화면에 따라 mock 값/API 값으로 다르게 보일 수 있음)

## 3. 백엔드 상태

**인증 (JWT)**

- `POST /auth/register` — 이메일 중복 시 `409`, bcrypt 해싱(`saltRounds=10`), `role`은 요청과 무관하게 항상 `CUSTOMER`로 생성
- `POST /auth/login` — bcrypt 비교 후 JWT 발급(`JWT_EXPIRES_IN=1d`), 계정 존재 여부를 노출하지 않도록 실패 사유 무관 동일한 `401` 메시지
- `GET /auth/me` — 인증 필요, 본인 프로필 반환
- Refresh Token, 비밀번호 변경/재설정, Admin의 사용자 승격 API는 없음

**RBAC (ADMIN / STAFF / CUSTOMER)**

- `authenticate` 미들웨어가 `/plants` 라우트 전체에 `router.use()`로 적용됨
- `plant.service.ts`: `CUSTOMER`는 `list()`에서 강제로 `ownerId = 본인`, `getById/update/remove`는 소유자가 아니면 `403 FORBIDDEN`
- `create()`는 요청 바디의 `ownerId`(스키마에 없어 애초에 zod가 제거)와 무관하게 항상 `requestUser.id`로 저장
- `ADMIN`/`STAFF`는 전체 접근 가능(코드상 동일 취급). 단, `STAFF` 역할의 seed 계정은 없어 실제로 테스트된 적은 없음
- `requireRole(...)` 헬퍼는 구현만 되어 있고 어떤 라우트에서도 아직 사용되지 않음

**Plant API**

- `GET/POST/PUT/DELETE /plants`, `/plants/:id` — 전부 인증 필수 + 위 RBAC 적용
- QR 자동발급(`Species.category.code` + `QrSequence` 원자적 증가), Soft Delete(`deletedAt`)
- 목록/상세 응답에 자식 개체 목록·개수, 이력 담당자/위치/사진은 아직 내려주지 않음(DTO 미구현, 프론트에서 0/[]으로 대체 표시)

**CommonCode / Species / Public API**

- `GET /common-codes?groupCode=`, `GET /species` — 조회 전용, 인증 미적용. `CommonCode` 응답에 `description`/`isActive` 포함(최근 추가). 생성/수정/삭제 API 없음
- `GET /public/plants/:qrCode` — 인증 불필요. `purchasePrice`/`memo`/`owner`/`parentPlant`/이력/정확한 위치는 Prisma `select` 단계부터 조회하지 않음. QR 미존재 또는 `status=DISCARDED`는 동일하게 `404`(내부 상태 비노출)

## 4. 프론트 상태

- **로그인 페이지: 있음.** `views/LoginView.vue` + `router/index.ts`의 `/login` 라우트. 이메일/비밀번호 입력 후 `useAuthStore().login()` 호출, 성공 시 `redirect` 쿼리(또는 `/admin/dashboard`)로 이동. seed 계정 안내 문구 포함.
- **토큰 저장** — `api/http.ts`가 `localStorage`(`ask-plant.accessToken`) 읽기/쓰기/삭제 함수를 소유하고, `stores/auth.ts`는 사용자 정보(`ask-plant.user`)와 로그인/로그아웃 액션만 관리한다(순환 참조 방지를 위해 토큰 저장소를 store 밖으로 분리).
- **axios interceptor** — `api/http.ts` 요청 인터셉터가 저장된 토큰이 있으면 모든 요청에 `Authorization: Bearer <token>`을 자동 첨부. 응답 인터셉터는 `401`(단, `/auth/login` 자체 실패는 제외)을 감지하면 토큰을 지우고 `window.location.href`로 `/login?redirect=...`로 이동.
- **router guard** — `router/index.ts`의 `beforeEach`가 `meta.requiresAuth`(부모 라우트 `/admin`에 설정, 하위 전체 상속)를 검사해 미인증(토큰 없음) 시 즉시 `/login`(`redirect` 쿼리로 원래 경로 보존), 토큰은 있지만 아직 검증 전(`meChecked=false`, 새로고침 직후 포함)이면 `GET /auth/me`로 유효성을 확인한 뒤 통과/실패를 결정한다. `meta.roles: UserRole[]`를 지정하면 해당 role만 통과시키는 확장 지점도 마련(현재 실제로 role을 제한하는 라우트는 없음).
- **auth store 확장** — `stores/auth.ts`에 `fetchMe()`(GET /auth/me로 토큰 검증 + user 갱신, 실패 시 세션 정리) 및 `hasRole(...roles)` 헬퍼 추가. `meChecked`/`meLoading` 상태로 중복 호출을 방지.
- **AdminHeader** — mock 사용자 대신 `useAuthStore().user`(실제 로그인 사용자)를 표시하고 로그아웃 버튼 추가.
- **실질적 영향**: 서버의 `/plants` 인증 요구와 프론트 로그인 계층이 이제 맞물려 동작한다 — 로그인 없이 `/admin/*` 진입 시도 → `/login`으로 이동, 로그인 성공 시 정상적으로 Plant API 연동 화면 사용 가능.
- **Plant 목록/상세/등록** — `stores/plant.ts` → `api/plant.api.ts` → `GET/POST /plants` 실 연동 완료. 검색/상태 필터는 이제 `GET /common-codes?groupCode=PLANT_STATUS`로, 카테고리 필터는 `GET /species`로 옵션을 채운다(`speciesId → categoryCode` 매핑으로 실제 필터링도 동작). 페이지네이션은 클라이언트에서 처리(넉넉한 limit으로 전체를 가져온 뒤 재사용).
- **CommonCode** — 이번 세션에서 Mock 카드 나열 구조를 걷어내고 `GET /common-codes` 실 API로 전환. 좌측 그룹 Grid + 우측 코드 Grid + 검색(디바운스 300ms) 구조로 리팩토링 완료.
- **나머지 화면(Species/Location/Photo/QR/User/Settings/Dashboard, 모바일 Public 3종)** — 전부 `client/src/mock/*.mock.ts` 더미 데이터로 렌더링, 서버 API 연동 없음.
- `SpeciesDetailView`는 예외적으로 보유 개체 목록만 `plantStore`(API)를 참조하고, 품종 상세 정보 자체는 여전히 mock(`speciesStore`)에서 가져온다.

## 5. DB 상태

- 12개 모델, PostgreSQL, `prisma db push`로만 스키마 동기화(migration 파일 0개)
- **핵심 관계**: `User(1)` — `Plant(N, ownerId)` / `Species(1)` — `Plant(N)` / `CommonCode(1)` — `Plant(N, status·originType 2개 FK)` / `PlantLocation(1)` — `Plant(N)`
- `Plant.ownerId`는 스키마상 optional FK이지만, `plant.service.ts`의 `create()`가 항상 값을 채워 넣으므로 사실상 필수처럼 동작한다.
- Soft Delete는 `Plant.deletedAt`(타임스탬프)만 사용하고, 다른 모델(`User`, `Species`, `PlantCategory` 등)은 `isActive` boolean 패턴을 쓴다 — 모델마다 삭제 정책이 다르다.
- **Seed 데이터**(`server/prisma/seed.ts` + `seed-data.ts`, `npx prisma db seed`로 실행, upsert 기반 재실행 안전):
  - `PlantCategory` 5종(CON/LTH/CAT/AFR/OTH), `CommonCode` 27종(PLANT_STATUS/HISTORY_TYPE/LOCATION_TYPE/ORIGIN_TYPE)
  - `User` 2명 — SYSTEM ADMIN(`admin@ask-plant.local`), 테스트 CUSTOMER(`customer@ask-plant.local`), 비밀번호는 bcrypt 해시로 저장
  - `Species` 5종(카테고리별 1개), `PlantLocation` 2종(온실/전시)
  - `Plant` 3건(SYSTEM ADMIN 소유로 생성) + 기존에 `ownerId`가 없던 Plant를 SYSTEM ADMIN으로 자동 백필

## 6. 다음 개발 우선순위 3개

1. **PlantLocation 조회 API 추가** — Species/CommonCode는 이미 조회 API가 있어 mock 제거가 가능한 반면, 위치(Location)만 API가 없어 `PlantCreateView`에 위치 선택 UI를 넣지 못하고 `LocationListView`도 mock에 묶여 있다. 남은 mock 제거 작업들의 공통 선행 조건이다.
2. **CommonCode/Species API 인증 정책 통일** — `/plants`만 인증이 걸려 있고 `/common-codes`, `/species`는 무인증으로 남아 도메인별 보호 수준이 다르다. 로그인 연동이 끝난 지금, 이 두 API에도 `authenticate`를 적용할지 의도적으로 Public 성격을 유지할지 결정하고 일관성을 맞춰야 한다.
3. **회원가입/사용자 관리 화면 연동** — 백엔드에 `POST /auth/register`가 있고 `UserListView`도 존재하지만 서로 연결되어 있지 않다(UserListView는 여전히 mock). 로그인 계층이 갖춰졌으니 다음 단계로 실제 사용자 CRUD 화면을 붙일 수 있다.

---

**결론(한 줄)**: 서버는 JWT 인증·RBAC·Public API까지 갖춘 SaaS 구조이고, 프론트도 로그인 실연동·`/auth/me` 토큰 재검증·role 확장 가능한 라우터 가드를 갖춰 인증 계층이 완성됐지만 — 7/9 관리자 화면이 여전히 mock이라 "SaaS 완성" 이전, "인증 연동 완료" 단계에 있는 프로젝트다.
