# CHANGELOG

> 작업을 완료할 때마다 이 파일에 기록합니다. (docs/참고용.md 지침)
>
> 작업 전 `AGENTS.md`, `docs/RULES.md`, `docs/UI.md`, `docs/ROADMAP.md`, `docs/NAMING.md`를 반드시 확인하고,
> 규칙과 충돌하는 부분은 구현 전에 설명 후 승인을 받습니다.

## 2026-07-05 — 로그인 API 실연동 강화 + auth store fetchMe + router guard 강화 + Plant 화면 mock 완전 제거

### 변경 이유

직전 커밋에서 로그인 화면/토큰 저장/axios 인터셉터/기본 라우터 가드까지는 갖췄지만, (1) 새로고침 시 localStorage에 남아있는 토큰이 실제로 아직 유효한지 서버에 재확인하는 절차가 없었고, (2) 라우터 가드가 role 기반 확장을 고려하지 않은 단순 boolean 체크였으며, (3) Plant 목록 화면의 상태/카테고리 필터 드롭다운이 여전히 mock 데이터(`mockCategories`, `commonCodes.mock`)를 참조하고 있었다(심지어 카테고리 필터는 실제로 선택하면 결과가 전부 사라지는 숨은 버그였음). 이 세 가지를 보완했다.

### 변경 파일

- **수정**: `client/src/stores/auth.ts` — `fetchMe()` 액션 추가(`GET /auth/me` 호출로 토큰 유효성 재검증 + 최신 사용자 정보 갱신, 실패 시 세션 정리). `meChecked`/`meLoading` 상태로 중복 호출 방지. `hasRole(...roles)` 헬퍼 추가(ADMIN/STAFF/CUSTOMER 역할 분기용).
- **수정**: `client/src/router/index.ts` — `beforeEach` 가드를 async로 변경. 토큰이 있지만 아직 검증되지 않은 경우(`meChecked === false`, 새로고침 직후 등) `auth.fetchMe()`를 호출해 유효성을 확인한 뒤에만 통과시킴. `meta.roles: UserRole[]` 확장 지점 추가(현재 실제로 이 필드를 쓰는 라우트는 없지만 구조는 준비됨).
- **수정**: `client/src/stores/plant.ts` — `fetchSpeciesOptions()`/`fetchCommonCodes('PLANT_STATUS')`로 상태·카테고리 필터 옵션을 채우는 `ensureFilterOptionsLoaded()` 액션과 `statusOptions`/`categoryOptions` computed 추가. 카테고리 필터 매칭 로직을 `plant.species.category`(항상 null) 대신 `speciesId → categoryCode` 맵으로 교체해 실제로 동작하도록 수정.
- **수정**: `client/src/views/admin/plants/PlantListView.vue` — `mockCategories`(`@/mock`), `codesByGroup`(`@/mock/commonCodes.mock`) import 제거, `store.statusOptions`/`store.categoryOptions` 사용으로 전환.

### 구현 내용

- **토큰 재검증 흐름**: 보호된 라우트 진입 시 ① 토큰 자체가 없으면 즉시 `/login` ② 토큰은 있지만 `meChecked`가 false면 `GET /auth/me`로 검증 후 실패 시 `/login`, 성공 시 최신 user 정보로 갱신 ③ 이후 네비게이션은 재검증 없이 통과(매 라우트 전환마다 API를 부르지 않도록 캐싱). 실제 만료/위조 토큰으로 API를 호출했을 때의 401은 기존 axios 응답 인터셉터가 별도로 처리한다.
- **역할 확장 구조**: 라우트 `meta.roles`에 `UserRole[]`를 넣으면 `auth.hasRole(...)`로 검사해 불일치 시 대시보드로 되돌리는 구조를 만들어뒀다. 다만 세 가지 role(ADMIN/STAFF/CUSTOMER) 중 아직 화면별로 접근을 차등할 필요가 없어 실제로 `roles`를 지정한 라우트는 없다.
- **Plant 필터 mock 제거**: `GET /plants` 응답이 `species.category`를 내려주지 않아 카테고리 필터가 원천적으로 동작할 수 없었던 문제를, 이미 존재하는 `GET /species`(species.category 포함)로 `speciesId → categoryCode` 매핑을 만들어 해결했다. 신규 서버 API 추가 없이 기존 조회 API 재사용으로 해결(다른 도메인 수정 없음).

### 영향 범위

- `client/src/stores/auth.ts`, `router/index.ts`, `stores/plant.ts`, `views/admin/plants/PlantListView.vue`에만 영향. Plant 등록/상세 화면, CommonCode 화면, 서버 코드는 변경 없음.
- Plant 영역의 mock 참조가 완전히 제거됨(`grep mock client/src/views/admin/plants client/src/stores/plant.ts` 기준 실제 import 0건).

### 확인 사항 (테스트)

- `npx vue-tsc -b --noEmit`, `npm run build`(client) 모두 통과
- `POST /auth/login` → `GET /auth/me` → `GET /plants` 순으로 curl 호출해 admin 계정 정상 흐름 확인(각각 200)
- 유효하지 않은 토큰으로 `GET /plants` 호출 시 `401 UNAUTHORIZED` 확인
- customer 계정으로 `GET /plants` 호출 시 본인 소유 개체(0건, seed plant는 전부 admin 소유)만 반환되어 RBAC `ownerId` 필터가 로그인 연동 이후에도 유지됨을 확인

## 2026-07-05 — Vue 프론트 JWT 로그인 계층 추가

### 변경 이유

백엔드는 `/plants` 등 관리자 API에 JWT 인증을 강제하고 있었지만, 프론트에는 로그인 화면·토큰 저장·요청 헤더 첨부·401 처리·라우터 가드가 전혀 없어 관리자 화면이 사실상 401로 동작 불능이었다(`docs/STATUS.md` 이전 버전의 최우선 과제). 기존 Plant/CommonCode API 연동 구조와 mock 데이터는 그대로 두고, "프론트 인증 계층"만 추가했다.

### 변경 파일

- **수정**: `client/src/api/http.ts` — `localStorage` 기반 토큰 저장/조회/삭제 함수(`getStoredAccessToken`/`setStoredAccessToken`/`clearStoredAccessToken`) 추가. 요청 인터셉터로 모든 요청에 `Authorization: Bearer <token>` 자동 첨부. 응답 인터셉터로 `401`(단 `/auth/login` 자체 실패는 제외) 수신 시 토큰 삭제 후 `/login?redirect=...`로 이동.
- **신규**: `client/src/api/auth.api.ts` — `POST /auth/login`, `GET /auth/me` 호출 래퍼(`authApi.login`, `authApi.me`).
- **신규**: `client/src/stores/auth.ts` — Pinia 스토어. `token`/`user`/`isAuthenticated` 상태와 `login`/`logout` 액션. 사용자 정보는 `localStorage`(`ask-plant.user`)에 별도 보관, 토큰은 `api/http.ts`의 저장 함수에 위임(순환 참조 방지).
- **신규**: `client/src/views/LoginView.vue` — 이메일/비밀번호 로그인 폼, 로딩/에러 상태 표시, seed 테스트 계정 안내, 로그인 성공 시 `redirect` 쿼리(또는 `/admin/dashboard`)로 이동.
- **수정**: `client/src/router/index.ts` — `/login` 라우트 추가, `/admin` 부모 라우트에 `meta.requiresAuth: true` 설정(하위 전체 상속), `router.beforeEach` 가드로 미인증 시 `/login`(원래 경로를 `redirect` 쿼리로 보존)으로, 로그인된 상태로 `/login` 접근 시 대시보드로 리다이렉트.
- **수정**: `client/src/components/layout/AdminHeader.vue` — mock 사용자(`mockUsers`) 대신 `useAuthStore().user`(실제 로그인 사용자)를 표시, 로그아웃 버튼 추가.

### 구현 내용

- **순환 참조 회피**: `router → stores/auth → api/auth.api → api/http`로 이어지는 구조에서, `api/http.ts`가 Pinia 스토어를 직접 import하면 `http → stores/auth → auth.api → http`로 순환 참조가 발생한다. 이를 피하기 위해 토큰 저장 자체를 `api/http.ts`의 순수 함수(localStorage 직접 접근)로 분리하고, Pinia 스토어는 이 함수들을 호출만 하는 구조로 설계했다.
- **401 처리**: 라우터 인스턴스를 `http.ts`에서 import하면 같은 이유로 순환 참조가 생기므로, `window.location.href`를 사용한 전체 페이지 이동으로 리다이렉트를 구현(SPA 네비게이션 상태는 보존되지 않지만 순환 참조 없이 동작).
- **router guard**: 개별 라우트마다 `meta.requiresAuth`를 반복 설정하지 않고, `/admin` 부모 라우트 하나에만 설정 — Vue Router의 `to.matched` 배열에 부모 레코드가 포함되므로 모든 하위 라우트(`dashboard`, `plants`, `species` 등)에 자동 상속된다.
- `useAuthStore()`는 `router/index.ts` 모듈 최상단이 아니라 `beforeEach` 콜백 내부에서 호출 — 모듈 로드 시점에는 아직 Pinia가 활성화되지 않아 `getActivePinia() was called with no active Pinia` 오류가 나기 때문(실제 호출 시점에는 `main.ts`에서 `app.use(pinia)`가 `app.use(router)`보다 먼저 실행되어 있어 안전).
- 기존 Plant/CommonCode API 연동, mock 데이터, UI 구조는 전혀 변경하지 않음(요청사항 "mock 제거 금지" 준수).

### 영향 범위

- 로그인하지 않은 사용자가 `/admin/*`에 접근하면 `/login`으로 이동하고, 로그인 후에는 기존처럼 Plant/CommonCode 화면이 정상 동작한다(과거의 401 에러 배너 문제 해소).
- `/p/:qrCode`, `/cart` 등 Public 라우트는 `meta.requiresAuth`가 없어 이번 변경의 영향을 받지 않음(계속 비로그인 접근 가능).
- `client/src/mock/users.mock.ts` 등 기존 mock 파일은 그대로 유지되며 다른 화면(UserListView 등)에서 계속 사용된다.

### 확인 사항 (테스트)

- `npx vue-tsc -b --noEmit`, `npm run build`(client) 모두 통과
- `POST /api/v1/auth/login`을 seed 계정(`admin@ask-plant.local` / `customer@ask-plant.local`)으로 직접 호출해 `200`과 함께 `accessToken`이 정상 발급되는지 확인
- Vite dev 서버가 새 `LoginView.vue`/`router/index.ts`/`AdminHeader.vue`를 에러 없이 HMR 반영하는 것을 로그로 확인

## 2026-07-05 — 공통코드 화면 UI/UX 리팩토링 (그룹 트리 + 검색 + 그리드)

### 변경 이유

기존 공통코드 화면은 groupCode별로 카드를 나열하고 각 카드 안에 전체 코드를 테이블로 보여주는 구조라, 그룹 수가 늘어날수록 화면이 길게 늘어지고 특정 그룹만 빠르게 찾기 어려웠다. "좌측 그룹 선택 → 우측 코드 그리드 + 검색"의 관리자 대시보드형 마스터-디테일 구조로 리팩토링했다.

### 변경 파일

- **수정**: `server/src/services/common-code.service.ts` — `CommonCodeDto`에 `description`, `isActive` 필드 추가(기존에는 응답에서 누락되어 있었음). 스키마/레포지토리는 이미 해당 컬럼을 조회하고 있어 서비스 매핑만 보강.
- **수정**: `client/src/types/common.ts` — `CommonCode` 타입에 `description?`, `isActive?` 추가.
- **수정**: `client/src/api/common-code.api.ts` — `fetchCommonCodes(groupCode?)`로 변경해 `groupCode`를 생략하면 전체 그룹의 코드를 한 번에 조회 가능하도록 확장(기존 `PlantCreateView`의 특정 그룹 조회 호출은 영향 없음).
- **신규**: `client/src/stores/common-code.ts` — Pinia 스토어. `selectedGroupCode`, `searchKeyword` 상태와 `groupSummaries`(좌측 그룹 목록), `filteredGroupSummaries`(검색 적용), `codesInSelectedGroup`, `filteredCodes`(우측 그리드에 실제 표시) computed, `fetchCodes`/`selectGroup`/`setSearchKeyword` 액션 제공.
- **재작성**: `client/src/views/admin/common-codes/CommonCodeListView.vue` — 카드 나열 구조를 좌(그룹 Grid)/우(코드 Grid) 2단 레이아웃으로 전면 교체, 검색 입력(디바운스 300ms) 추가, Mock 데이터 대신 `GET /api/v1/common-codes` 실 API 연동으로 전환.

### 구현 내용

- **좌측 그룹 Grid**: `groupCode` 기준으로 묶은 그룹을 카드가 아닌 타일 형태의 반응형 그리드(`repeat(auto-fill, minmax(120px, 1fr))`)로 표시. 각 타일에 그룹 라벨, groupCode, `사용중/전체` 건수를 표시하고 클릭 시 선택 상태(`active` 클래스)로 강조.
- **우측 코드 Grid**: 선택된 그룹에 속한 코드를 테이블로 표시(`순서/코드/명칭/설명/사용여부` 컬럼). `사용여부`는 `isActive` 값에 따라 배지 색상(`사용`=초록, `미사용`=회색)으로 구분.
- **검색**: 상단 입력창에 300ms 디바운스를 적용해 `store.setSearchKeyword`를 호출. 키워드는 `groupCode`, 그룹 라벨, `code`, `name`을 모두 대상으로 하며, 좌측 그룹 목록과 우측 코드 그리드에 동시에 반영된다. 검색어 때문에 현재 선택된 그룹이 좌측 목록에서 사라지면 보이는 첫 번째 그룹으로 자동 전환한다.
- **UX**: 최초 로딩 스피너(`EmptyState` + ⏳), API 실패 시 에러 메시지 + "다시 시도" 버튼, 그룹이 하나도 없을 때/코드가 없을 때(`No Data`)/그룹 미선택 시 각각 별도의 EmptyState 문구로 구분.
- 데이터는 `GET /api/v1/common-codes`(groupCode 미지정, 전체 조회) 호출 후 프론트에서 `groupCode` 기준으로 `groupBy` 처리하는 방식을 사용했다(서버에 신규 API 추가 없이 기존 조회 API만 활용).

### 영향 범위

- `client/src/views/admin/common-codes/CommonCodeListView.vue`와 관련 스토어/타입/`api` 모듈에만 영향. 다른 화면(`PlantListView`, `PlantCreateView` 등)이 사용하는 `client/src/mock/commonCodes.mock.ts` 및 기존 `fetchCommonCodes(groupCode)` 호출부는 변경 없이 그대로 동작.
- `server/src/services/common-code.service.ts`의 응답 필드가 늘어났을 뿐 기존 필드(`id/groupCode/code/name/sortOrder`)는 그대로라 하위 호환 유지.
- "코드 추가" 버튼은 여전히 비활성화 상태 — 공통코드 생성/수정/삭제 API가 아직 없어 조회 전용으로만 동작(`docs/STATUS.md` 6절 미완료 항목 참고).

### 확인 사항 (테스트)

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 모두 통과
- `GET /api/v1/common-codes` 직접 호출로 `description`/`isActive` 필드가 응답에 정상 포함되는지 확인
- Vite dev 서버가 변경된 `CommonCodeListView.vue`를 에러 없이 HMR 반영하는 것을 로그로 확인, 브라우저 모듈 요청(`/src/views/admin/common-codes/CommonCodeListView.vue`)도 200으로 정상 컴파일됨을 확인

## 2026-07-05 — 멀티유저 SaaS 인증/권한 확장 (JWT + RBAC + Public API)

### 변경 이유

기존 `User.role`(ADMIN/STAFF/CUSTOMER)과 `Plant.ownerId`는 스키마에만 존재하고 실제로 쓰이지 않던 상태였다. 여러 사용자가 각자의 개체를 등록/조회할 수 있는 SaaS 구조로 확장하기 위해 JWT 기반 인증, 역할별 접근 제어(RBAC), 그리고 QR 스캔용 비로그인 공개 조회 API를 추가했다. 이번 작업은 서버(DB/API/인증) 범위로 한정하고 Vue 로그인 화면 연동은 다음 단계로 미뤘다(사용자 확인 완료).

### 변경 파일

- **의존성 추가**: `bcrypt`, `jsonwebtoken` (+ `@types/bcrypt`, `@types/jsonwebtoken`). Windows에서 네이티브 빌드 확인 완료(대체 패키지 불필요).
- **환경변수**: `server/.env`에 `JWT_SECRET`, `JWT_EXPIRES_IN=1d` 추가.
- **신규 — 인증 모듈**: `server/src/lib/jwt.ts`(sign/verify), `server/src/types/express.d.ts`(`Express.Request.user` 타입 확장), `server/src/schemas/auth.schema.ts`(register/login), `server/src/repositories/user.repository.ts`, `server/src/services/auth.service.ts`, `server/src/controllers/auth.controller.ts`, `server/src/routes/auth.ts`
- **신규 — 인증 미들웨어**: `server/src/middleware/auth.middleware.ts` (`authenticate`, `requireRole`)
- **신규 — Public API**: `server/src/repositories/public.repository.ts`, `server/src/services/public.service.ts`, `server/src/controllers/public.controller.ts`, `server/src/routes/public.ts`
- **수정**: `server/src/middleware/errorHandler.ts` — `UnauthorizedError`(401), `ForbiddenError`(403) 클래스 추가
- **수정**: `server/src/routes/plants.ts` — 모든 라우트에 `authenticate` 적용
- **수정**: `server/src/repositories/plant.repository.ts` — `PlantFilters.ownerId` 필터 추가, `create()`에 `ownerId` 필수 파라미터 추가
- **수정**: `server/src/services/plant.service.ts` — `list/getById/create/update/remove` 모두 `requestUser` 파라미터를 받아 RBAC 적용 (`assertCanAccess` 헬퍼)
- **수정**: `server/src/controllers/plant.controller.ts` — 각 핸들러가 `req.user`를 서비스에 전달 (`requireUser` 헬퍼)
- **수정**: `server/src/app.ts` — `/api/v1/auth`, `/api/v1/public` 라우트 마운트
- **수정**: `server/prisma/seed-data.ts` — `USER_SEEDS`(SYSTEM ADMIN, 테스트 CUSTOMER) 추가
- **수정**: `server/prisma/seed.ts` — `seedUsers()` 단계 추가(bcrypt 해싱), `seedPlants()`가 SYSTEM ADMIN을 `ownerId`로 설정, `backfillPlantOwners()` 신규 — `ownerId`가 없는 기존 Plant를 SYSTEM ADMIN으로 일괄 백필

### 구현 내용

- **역할 체계**: 기존 3단계(ADMIN/STAFF/CUSTOMER) 유지. STAFF는 ADMIN과 동일하게 Plant 전체 접근 권한을 가짐.
- **API 구조**: `/api/v1/plants`는 물리적으로 분리하지 않고 기존 경로·요청/응답 포맷을 그대로 유지하면서 내부에서 인증 + 역할 기반 필터링만 추가. `POST/PUT/DELETE`도 동일 원칙 적용. **Public만 완전히 별도 API**로 분리(`/api/v1/public/plants/:qrCode`).
- `POST /auth/register` — 항상 `role=CUSTOMER`로 생성(요청으로 role 지정 불가), 이메일 중복 시 `409 CONFLICT`
- `POST /auth/login` — bcrypt 비밀번호 검증 후 JWT 발급, 실패 시 이메일 유무와 무관하게 동일한 `401` 메시지(계정 존재 여부 노출 방지)
- `GET /auth/me` — 인증 필요, 본인 프로필 조회
- `GET/POST/PUT/DELETE /plants*` — `authenticate` 필수. `CUSTOMER`는 쿼리 파라미터로 우회 불가능하게 서버에서 강제로 `ownerId = 본인` 필터 적용, 타인 소유 조회/수정/삭제 시 `403 FORBIDDEN`. `create()`는 클라이언트가 보낸 `ownerId`(스키마에 없어 애초에 무시됨)와 무관하게 항상 요청자 본인으로 설정. `ADMIN`/`STAFF`는 제한 없음.
- `GET /public/plants/:qrCode` — 인증 불필요. `purchasePrice`/`memo`/`owner`/`parentPlant`/이력/정확한 위치 등 관리자 전용 필드는 Prisma `select` 단계에서부터 조회하지 않아 응답에 포함될 수 없음. QR 미존재 또는 `Plant.status = DISCARDED`는 동일하게 `404 NOT_FOUND`(내부 상태 노출 방지).
- 스키마 변경 없음 — `User.passwordHash`/`role`, `Plant.ownerId` 모두 기존 컬럼을 그대로 사용.

### 영향 범위

- `server/`에만 영향. `client/`(Vue)는 변경 없음.
- **Breaking**: `/api/v1/plants`가 인증 필수로 바뀌면서, 토큰을 보내지 않는 기존 관리자 Vue 화면(PlantList/Detail/Create)은 로그인 연동 전까지 모두 `401`을 받는다. 의도된 결과이며 다음 단계에서 프론트 로그인 연동 예정(`docs/STATUS.md` 7절 참고).
- 로컬 PostgreSQL(`ask_plant`) 데이터 변경: SYSTEM ADMIN/테스트 CUSTOMER 유저 2건 추가, 기존 소유자 없던 Plant 5건이 SYSTEM ADMIN 소유로 백필됨.

### 확인 사항 (테스트)

- `npx tsc --noEmit` 통과
- `npx prisma db seed` 재실행 — User 2건 생성/갱신, Plant ownerId 백필 정상 동작 확인(로그 출력 확인)
- curl E2E (모두 정상 확인 후 테스트 데이터 정리 완료):
  - 토큰 없이 `GET /plants` → `401 UNAUTHORIZED`
  - `POST /auth/login`(admin/customer 각각) → JWT 발급 확인
  - ADMIN 토큰으로 `GET /plants` → 전체 3건 조회
  - CUSTOMER 토큰으로 `GET /plants` → 0건(본인 소유 없음)
  - CUSTOMER 토큰으로 ADMIN 소유 `GET /plants/:id` → `403 FORBIDDEN`
  - CUSTOMER 토큰으로 `POST /plants`(body에 `ownerId: seed-user-admin` 스푸핑 시도) → 생성된 개체의 `owner.id`는 여전히 `seed-user-customer`로 강제 설정됨 확인
  - CUSTOMER 토큰으로 `GET /plants` → 방금 생성한 1건만 조회됨
  - `GET /public/plants/:qrCode` → 인증 없이 200, 관리자 전용 필드 미포함 확인
  - 해당 개체를 `DISCARDED`로 변경 후 동일 QR 재조회 → `404 NOT_FOUND`
  - 존재하지 않는 QR 조회 → `404 NOT_FOUND`
  - `POST /auth/register` → `201`, 생성된 유저 `role`이 `CUSTOMER`로 고정됨 확인
  - `GET /auth/me`(ADMIN 토큰) → 본인 프로필 정상 반환
  - 테스트 중 생성한 Plant는 `DELETE /plants/:id`로 Soft Delete 처리하여 정리

### 알려진 이슈 / 후속 논의 필요

- Refresh Token, 비밀번호 변경, Admin 사용자 관리 API는 이번 범위에서 제외(후속 작업).
- `common-codes`, `species` 조회 API는 이번 작업에서 인증을 적용하지 않았다(기존 상태 유지) — 필요 시 후속 작업에서 검토.
- Vue 로그인 화면/토큰 저장·첨부 로직, `/admin`·`/user` 물리적 라우트 분리는 범위 밖.

## 2026-07-05 — Plant CRUD API 구현

### 변경 이유

`docs/api-specification.md`에 정의된 Plant API(MVP)를 실제로 구현. 기존 `server/src`는 최초 단순 스키마(WateringRecord 등) 기준이라 현재 `schema.prisma`(Species/Plant 분리 구조)와 맞지 않아 전면 재작성.

### 변경 파일

- **DB**: `server/prisma/schema.prisma` — `Plant.deletedAt`(Soft Delete) 컬럼 추가, `@@index([deletedAt])` 추가. `db push`로 로컬 `ask_plant` DB에 반영 완료.
- **신규**: `server/src/repositories/plant.repository.ts` (Repository 계층 신설)
- **재작성**: `server/src/schemas/plant.schema.ts`, `server/src/services/plant.service.ts`, `server/src/controllers/plant.controller.ts`, `server/src/routes/plants.ts`, `server/src/middleware/errorHandler.ts`(공통 에러 포맷 `{ error: { code, message, details } }` 적용)
- **수정**: `server/src/app.ts` — 라우트 마운트 경로를 `/api/plants` → `/api/v1/plants`로 변경 (NAMING.md 준수)
- **삭제**: `server/src/services/watering.service.ts`, `server/src/controllers/watering.controller.ts`, `server/src/routes/waterings.ts` — 현재 스키마에 없는 `WateringRecord` 모델 기준 레거시 코드로 컴파일 에러를 유발하여 제거

### 구현 내용

- 구조: `Route → Controller → Service → Repository` (AGENTS.md/RULES.md 준수)
- `GET /api/v1/plants` — 목록 조회 (`q`, `speciesId`, `locationId`, `status`, `originType`, `page`, `limit`, `sort`, `order` 쿼리 지원, Soft Delete된 개체 제외)
- `GET /api/v1/plants/:id` — 단일 조회 (품종/위치/상태/기원/부모개체/이미지/최근 이력 포함)
- `POST /api/v1/plants` — 생성. `qrCode`는 클라이언트가 지정하지 않고 `Species.category.code + QrSequence`로 서버가 트랜잭션으로 자동 발급
- `PUT /api/v1/plants/:id` — 수정 (품종은 변경 불가, `qrCode`는 응답에만 노출)
- `DELETE /api/v1/plants/:id` — Soft Delete (`deletedAt` 기록, 실제 row는 유지)
- 응답 포맷: 목록 `{ data, meta }`, 단건 `{ data }`, 에러 `{ error: { code, message, details } }` (`docs/api-specification.md` 공통 규칙 준수)
- Zod로 요청 바디/쿼리 검증, Prisma 에러(P2025/P2002/P2003)를 공통 에러 포맷으로 변환

### 영향 범위

- `server/`에만 영향. `client/`(Mock UI)는 변경 없음 — Mock 데이터는 계속 별도로 사용 중이며 이번 작업으로 연결되지 않음.
- 로컬 PostgreSQL(`ask_plant`) 스키마가 변경됨 (컬럼 추가만, 기존 데이터 손실 없음).

### 확인 사항 (테스트)

- `npm run build`(tsc) 통과
- 임시 스크립트로 종단 테스트 수행 후 삭제: 404 → 유효성 검사 실패 → 생성(QR 자동 발급 `OTH-000001`) → 조회 → 수정 → 목록 검색 → Soft Delete → 삭제 후 조회 404 확인 → DB상 `deletedAt` 기록 확인. 모두 정상 동작.

### 알려진 이슈 / 후속 논의 필요

- `docs/RULES.md`는 "모든 PK는 UUID"를 명시하지만 현재 스키마는 전 모델이 `cuid()`를 사용 중 (최초 설계부터 일관). 이번 작업 범위가 아니므로 변경하지 않았음 — 필요 시 별도 승인 후 전체 모델 대상으로 진행 필요.
- CommonCode/Species 시드 데이터가 아직 DB에 없어 실제 운영 데이터로 `POST /api/v1/plants`를 호출하려면 최소 `PLANT_STATUS`, `ORIGIN_TYPE` 코드와 `Species` 1건 이상이 먼저 등록되어야 함 (`server/prisma/seed-data.ts` 참고, 시드 실행 스크립트는 미작성 상태).
