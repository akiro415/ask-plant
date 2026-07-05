# Ask Plant — 프로젝트 현재 상태 (STATUS)

> 마지막 갱신: 2026-07-05 · Admin UX/디자인 시스템 통합 + CRUD UX 표준화
>
> 이 문서는 실제 코드를 기준으로 "지금 무엇이 동작하는가"만 기록하는 단일 진실 소스(Single Source of Truth)다.
> 설계 근거/전체 로드맵은 [DB 명세서](./db-specification.md), [API 명세서](./api-specification.md), [ROADMAP](./ROADMAP.md)를 참고한다.

## 1. 현재 개발 완료 상태 요약

| 영역 | 상태 | 비고 |
|---|---|---|
| 프로젝트 골격 (모노레포: client/server) | ✅ | npm workspaces + concurrently |
| DB 스키마 (Prisma, 13개 모델) | ✅ | `SystemSettings` 추가, `db push`로만 동기화 |
| **Plant CRUD API** | ✅ | 인증 필수 + RBAC(ownerId 기반) 적용, QR 자동발급, Soft Delete. **commerce 필드**(`flowerColor`, 두수·판매가, 구입업체/농장 등) POST/PUT 지원 |
| **Species CRUD API** | ✅ | `GET/GET:id/POST/PUT/DELETE`, 인증 필수 + RBAC(ADMIN/STAFF만 CUD), 삭제는 `isActive=false` soft delete |
| **PlantLocation CRUD API** | ✅ | `GET/GET:id/POST/PUT/DELETE`, 인증 필수 + RBAC(ADMIN/STAFF만 CUD), 계층 구조 순환 참조 방지, soft delete |
| **Dashboard 요약 API** | ✅ | `GET /dashboard`, 인증 필수 + RBAC(ADMIN/STAFF만), Prisma `count`/`groupBy` 집계 사용 |
| **인증 API (JWT)** | ✅ | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/me`(본인 name/phone 수정) |
| **Public 판매 목록 API** | ✅ | `GET /public/plants` — 필터·페이지네이션, latestImage 포함 |
| CommonCode API | ✅ | `GET/GET:id/POST/PUT/DELETE`, **인증 필수** + CUD는 `requireRole('ADMIN','STAFF')`. 삭제는 `isActive=false` soft delete |
| Image/History/Cart API | ✅ | History/Image CRUD + **Cart CRUD** 완료 |
| **QR 관리 API** | ✅ | `GET /qr/list`, `GET /qr/preview/:plantId`, RBAC( CUSTOMER=본인 소유 ) |
| **Settings API** | ✅ | `GET/PUT /settings`, `SystemSettings` 싱글톤, GET=ADMIN/STAFF, PUT=ADMIN |
| **User 관리 API** | ✅ | `GET/GET:id/PUT/DELETE /users`, `authenticate` + `requireRole('ADMIN')`, 삭제는 `isActive=false` soft delete, 마지막 ADMIN 보호. `PUT`으로 **활성/비활성 토글** 지원 |
| Seed 스크립트 | ✅ | SYSTEM ADMIN/테스트 CUSTOMER + 테스트 데이터, upsert 기반 재실행 안전 |
| **Admin 디자인 시스템 + UX 패턴** | ✅ | `tokens.css` CSS 변수, BaseButton/Input/Select/Textarea/Table/Modal, FilterBar·DetailPageActions·TableRowActions 공통화. Primary/Danger/Warning/Neutral 버튼·sm/md/lg 크기 통일 |
| **Vue 관리자 화면 — Plant(목록/상세/등록)** | ✅ API 연동, mock 0% | FilterBar + BaseTable + TableRowActions. 상세 commerce 강조 영역·계산 필드. 등록/수정/삭제(DetailPageActions). commerce 필드 등록·수정 폼 반영 |
| **Vue 관리자 화면 — CommonCode** | ✅ API 연동 + CUD | 그룹/코드 **Grid Table** + 검색 + `CommonCodeFormModal`. ADMIN/STAFF만 CUD 버튼 노출 |
| **Vue 관리자 화면 — Species(목록/상세 + 등록/수정/삭제)** | ✅ API 연동, mock 0% | 카드 → **BaseTable** 전환. 상세에서 수정(Modal)·삭제(soft delete)·목록(DetailPageActions). 목록 등록 버튼 **「등록」** 통일 |
| **Vue 관리자 화면 — Location(목록/상세 + 등록/수정/삭제)** | ✅ API 연동, mock 0% | 트리 목록 + 상세 **계층 breadcrumb**. 상세 수정(Modal)·삭제·목록(DetailPageActions) |
| **Vue 관리자 화면 — Dashboard** | ✅ API 연동 | Stat 카드·상태 분포·최근 목록 **클릭 시 실제 상세/필터 목록** 연결. loading/error UI 표준화 |
| **Vue 관리자 화면 — User(사용자관리)** | ✅ API 연동, mock 0% | 카드 → **BaseTable**. role/status 필터. **활성/비활성 토글**(PUT `isActive`), 마지막 ADMIN 보호 유지. 상세 DetailPageActions |
| **Vue 관리자 화면 — QR(관리)** | ✅ API 연동, mock 0% | 목록 TableRowActions(라벨/상세 아이콘). 상세 DetailPageActions. 라벨 일괄인쇄 API 없음 → 버튼 비활성 |
| **Vue 관리자 화면 — Settings(설정)** | ✅ API 연동, mock 0% | BaseInput/BaseSelect 통일. 시스템/QR/알림 단일 패널 + 저장. ADMIN만 PUT |
| **Vue 관리자 화면 — Photo(사진관리)** | ✅ API 연동, mock 0% | 그리드 카드 **우측 상단** 수정/삭제 아이콘. FilterBar + BaseTable 혼합. 별도 PhotoDetailView 없음(개체 상세 연결) |
| **Vue Admin 레이아웃 (모바일 사이드바)** | ✅ | `sidebarMobileOpen` drawer + backdrop. **메뉴 RBAC**(`config/menu.ts` roles → `AdminSidebar` 필터) |
| **Vue 로그인 화면 / 토큰 저장·첨부** | ✅ | `/login` 페이지, localStorage 토큰 저장, axios 인터셉터, 401 리다이렉트, `/admin/*` 라우터 가드 모두 구현 |
| **Vue 모바일 Public 화면(`/p/:qrCode`)** | ✅ API 연동 | `GET /public/plants/:qrCode` + `latestImage`/`latestHistory` 포함. loading/error/404 UI |
| Vue 모바일 Public Showcase(`/p`) | ✅ API 연동 | `GET /public/plants` 쇼케이스 그리드 + 필터 + skeleton |

## 2. 아키텍처 상태

**단계 판단**: **상용 MVP + Admin UX 통합 완료** — Cart·Public 쇼케이스·관리자 전 기능 실 API + 디자인 시스템/CRUD UX 패턴 통일. 남은 갭은 결제/주문 API, 파일 업로드(S3), QR 라벨 인쇄 API뿐.

**강점**

- `Route → Controller → Service → Repository` 레이어가 전 도메인(Plant/Auth/CommonCode/Species/Public)에 일관 적용됨
- RBAC이 서비스 레이어에서 강제됨 — CUSTOMER의 `ownerId` 필터는 쿼리 파라미터로 우회 불가, 생성 시 `ownerId`도 클라이언트 입력을 무시하고 서버가 강제 설정
- Public API가 컨트롤러·서비스·리포지토리 전 계층에서 물리적으로 분리되어 있고, 관리자 전용 필드는 Prisma `select` 단계에서부터 조회하지 않음(응답 유출 구조적으로 불가)
- Seed 스크립트가 전부 `upsert` 기반이라 재실행해도 안전, 신규 환경 온보딩 비용이 낮음
- 프론트 토큰 저장 로직(`api/http.ts`의 `getStoredAccessToken` 등)을 Pinia 스토어와 분리해 `router → stores/auth → api/auth.api → api/http` 순환 참조 없이 구성함
- `router.beforeEach`가 최초 보호 라우트 진입 시 `GET /auth/me`로 토큰을 서버에서 재검증(`meChecked` 플래그로 1회만 수행) — localStorage 토큰이 위조/만료됐어도 화면이 잠깐이라도 렌더링되지 않고 즉시 `/login`으로 이동
- Species/PlantLocation 모두 CUD를 물리적 삭제가 아닌 `isActive=false`로 처리 — 참조 중인 Plant.speciesId/locationId FK가 어떤 상황에서도 깨지지 않는다. Location은 추가로 자기참조(`parentId`) 순환/자기지정을 서비스 레이어에서 사전 차단한다.
- 프론트에서 서버가 내려주지 않는 파생 데이터(품종별/위치별 개체 수, 위치 계층 depth)를 새 API를 추가하지 않고 이미 로드된 `plantStore.plants`로 클라이언트에서 계산하는 패턴이 확립됨(`stores/species.ts`의 `speciesList` computed, `stores/location.ts`의 `buildOrderedTree`) — Plant 목록 화면의 `speciesId → categoryCode` 매핑과 동일한 접근.
- **Admin UI 디자인 시스템** — `client/src/assets/tokens.css` CSS 변수(색·간격·radius·shadow·컴포넌트 높이) + `components/base/*`(Button/Input/Select/Textarea/Table/Modal/IconButton)로 페이지별 스타일 분산을 줄였다. `FilterBar`(드롭다운→검색→검색 버튼), `DetailPageActions`(수정/삭제/목록), `TableRowActions`(리스트 아이콘 액션)가 관리 화면 CRUD UX의 공통 패턴이다.
- **RBAC UI 반영** — 서버 RBAC와 별도로 `config/menu.ts`의 `roles` + `AdminSidebar` 필터로 메뉴 노출을 제한한다. 버튼/액션은 각 화면에서 `auth.hasRole('ADMIN','STAFF')`로 2차 제어.

**위험 요소**

- **API 보호 수준 통일(대부분 해소)**: `/plants`, `/species`, `/locations`, `/common-codes` 모두 `authenticate` 필수. CommonCode CUD는 `requireRole('ADMIN','STAFF')`. Public API만 무인증 유지.
- **401 리다이렉트가 풀 리로드 방식**: `api/http.ts`의 401 처리는 `window.location.href` 이동을 사용해 순환 참조를 피했다 — 라우터 상태(SPA 네비게이션)를 보존하지 않고 페이지를 새로고침한다. 추후 라우터 인스턴스를 지연 참조(dynamic import)하는 방식으로 개선 여지가 있다.
- Refresh Token이 없어 `JWT_EXPIRES_IN=1d` 만료 시 자동 재로그인 없이 즉시 로그아웃(401) 처리된다.
- Migration 이력 없음(`db push`만 사용) — 스키마 변경 추적/롤백 불가
- 전 모델 PK가 `cuid()`인데 `docs/RULES.md`는 "모든 PK는 UUID"를 명시 — 규칙과 실제 코드가 불일치한 채 방치됨
- 테스트 코드 전무(unit/integration) — 회귀 검증 수단이 curl 수동 테스트뿐
- Mock 데이터 **완전 제거** — `client/src/mock/` 폴더 삭제, 모든 화면이 실 API만 사용
- **Dashboard mock 의존 완전 제거** — "최근 분갈이/판매/사진등록" 목록이 실 API(`GET /histories/recent`, `GET /images/recent`) 기반으로 전환되어 `plantId`가 실제 seed/API ID를 가리키며 상세 화면 링크가 정상 동작한다.
- **Dashboard 통계 카드에서 "오늘 등록" 항목이 제거됨** — `GET /dashboard` 응답에 해당 필드가 없어(서버 스펙상 `plantCount/speciesCount/locationCount/recentPlants/statusDistribution`만 제공) 클라이언트에서 근사치를 계산하지 않고 카드 자체를 뺐다. 필요하다면 서버 DTO에 `todayRegisteredCount`를 추가해야 한다.
- Species/PlantLocation 등록·수정 폼에 교배 계통(`parentSpecies1Id`/`parentSpecies2Id`)과 배치도 좌표(`imagePath`/`posX`/`posY`) 입력 필드가 추가됐다. `description`(Location) 등 기타 스키마 필드는 아직 UI에 없다.
- **PhotoDetailView 없음** — 사진은 개체 상세(`/admin/plants/:id`)로 연결. 별도 사진 상세 라우트·수정 화면은 미구현.
- **QR 삭제/재발급 API 없음** — QR 상세는 조회·라벨 미리보기 중심. 재발급/수정은 추후 API 필요.
- **PlantCreateView/BaseInput 마이그레이션 미완** — 등록 폼은 commerce 필드 반영됐으나 일부 화면은 아직 native input/select 혼용(PlantFormModal, PlantCreateView 등).

## 3. 백엔드 상태

**인증 (JWT)**

- `POST /auth/register` — 이메일 중복 시 `409`, bcrypt 해싱(`saltRounds=10`), `role`은 요청과 무관하게 항상 `CUSTOMER`로 생성
- `POST /auth/login` — bcrypt 비교 후 JWT 발급(`JWT_EXPIRES_IN=1d`), 계정 존재 여부를 노출하지 않도록 실패 사유 무관 동일한 `401` 메시지
- `GET /auth/me` — 인증 필요, 본인 프로필 반환
- Refresh Token, 비밀번호 변경/재설정, `POST /users`(사용자 생성) API는 없음 — User 관리는 조회/수정/비활성화만 지원

**RBAC (ADMIN / STAFF / CUSTOMER)**

- `authenticate` 미들웨어가 `/plants` 라우트 전체에 `router.use()`로 적용됨
- `plant.service.ts`: `CUSTOMER`는 `list()`에서 강제로 `ownerId = 본인`, `getById/update/remove`는 소유자가 아니면 `403 FORBIDDEN`
- `create()`는 요청 바디의 `ownerId`(스키마에 없어 애초에 zod가 제거)와 무관하게 항상 `requestUser.id`로 저장
- `ADMIN`/`STAFF`는 전체 접근 가능(코드상 동일 취급). 단, `STAFF` 역할의 seed 계정은 없어 실제로 테스트된 적은 없음
- `requireRole(...)` 헬퍼가 이번 작업에서 처음 실사용됨 — Species/PlantLocation의 생성·수정·삭제 라우트에 `requireRole('ADMIN', 'STAFF')`로 적용, CUSTOMER는 조회(`GET`)만 가능(curl로 403/200 응답 모두 확인)

**Plant API**

- `GET/POST/PUT/DELETE /plants`, `/plants/:id` — 전부 인증 필수 + 위 RBAC 적용
- QR 자동발급(`Species.category.code` + `QrSequence` 원자적 증가), Soft Delete(`deletedAt`)
- **Commerce 필드**(2026-07-05 추가): `flowerColor`, `purchaseHeadCount`, `purchaseUnitPrice`, `currentHeadCount`, `unitSellingPrice`, `totalSellingPrice`, `purchaseVendor`, `purchaseFarm` — POST/PUT 스키마·리포지토리·서비스 반영. 레거시 `purchasePrice`/`sellingPrice`와 병행.
- 목록/상세 응답에 자식 개체 목록·개수, 이력 담당자/위치/사진은 아직 내려주지 않음(DTO 미구현, 프론트에서 0/[]으로 대체 표시)

**Species API**

- `GET /species`, `GET /species/:id`, `POST /species`, `PUT /species/:id`, `DELETE /species/:id` — 전부 `authenticate` 필수, CUD는 `requireRole('ADMIN', 'STAFF')`
- `GET /species`(쿼리 미지정)는 최소 필드(`id/displayName/scientificName/koreanName/category`)를 포함해 항상 전 필드(영문명/필드넘버/판매자명/taxonRank/썸네일 등)를 함께 반환하도록 확장됨 — Species 관리자 화면(목록/상세)이 이 응답 하나로 렌더링된다. 기존 최소 필드만 쓰는 `fetchSpeciesOptions()`(PlantCreateView) 소비자는 영향 없음(하위 호환). `q`/`categoryId`/`includeInactive` 쿼리로 검색·비활성 포함 조회도 지원
- `DELETE`는 실제 row를 지우지 않고 `isActive=false`로만 변경(soft delete) — 이미 등록된 `Plant.speciesId` FK가 어떤 경우에도 깨지지 않는다. 사용 중인 개체 수와 무관하게 항상 성공(비활성화이므로 안전)

**PlantLocation API**

- `GET /locations`, `GET /locations/:id`, `POST /locations`, `PUT /locations/:id`, `DELETE /locations/:id` — Species와 동일한 인증/RBAC 정책
- 계층 구조(`parentId` 자기참조) 무결성 보호: 자기 자신을 상위로 지정 불가, 상위 체인을 순회해 순환 참조가 발생하면 `400 VALIDATION_ERROR`로 차단
- `DELETE`도 Species와 동일하게 `isActive=false` soft delete — `Plant.locationId`, 하위 위치의 `parentId` FK 보호

**Dashboard API**

- `GET /dashboard` — `authenticate` + `requireRole('ADMIN', 'STAFF')`, CUSTOMER는 `403`
- 응답: `plantCount`(Plant.count, `deletedAt: null`), `speciesCount`(Species.count, `isActive: true`), `locationCount`(PlantLocation.count, `isActive: true`), `recentPlants`(최신 5건, `createdAt desc`), `statusDistribution`(Plant를 `statusId` 기준 `groupBy`한 뒤 CommonCode `sortOrder`로 정렬)
- `plantCount`/`speciesCount`/`locationCount`는 `prisma.*.count()`, 상태 분포는 `prisma.plant.groupBy({ by: ['statusId'], _count: { _all: true } })`로 계산 — JS에서 전체 row를 가져와 집계하지 않고 Prisma 집계 쿼리로 DB에서 계산한다.
- 프론트(`stores/dashboard.ts`)가 `GET /dashboard`와 함께 `GET /histories/recent`·`GET /images/recent`를 병렬 호출해 통계 카드/상태 분포/최근 등록 개체/최근 분갈이·판매·사진 목록을 모두 실 API로 채운다.

**History / Image API**

- `GET /plants/:id/histories` — 인증 필수, CUSTOMER는 본인 소유 개체만, ADMIN/STAFF는 전체. 페이지네이션 지원.
- `POST /plants/:id/histories` — 이력 생성. `type`(HISTORY_TYPE code), `description`, `performedAt`, `title`, `amount` 지원. 동일 RBAC.
- `PUT /histories/:id`, `DELETE /histories/:id` — 이력 수정/삭제. PlantHistory에 soft delete 컬럼 없어 **물리 삭제**.
- `GET /plants/:id/images` — 동일 RBAC. `imageType` 필터 및 페이지네이션 지원.
- `POST /plants/:id/images` — URL(`url`/`imageUrl`) + `imageType` 등록. multer 미사용.
- `PUT /images/:id`, `DELETE /images/:id` — 메타 수정/삭제. PlantImage **물리 삭제**.
- `GET /histories/recent?type=REPOT&limit=5` — 최신 이력 조회.
- `GET /images/recent?limit=5`, `GET /images` — 사진관리 목록.

**User API**

- `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` — 전부 `authenticate` + `requireRole('ADMIN')`, CUSTOMER/STAFF는 `403`
- `GET /users` — `q`(이메일/이름/전화 검색), `role`, `includeInactive` 쿼리 지원
- `PUT /users/:id` — `name`/`phone`/`role`/`isActive` 변경. 본인 역할을 ADMIN 이외로 내리거나 본인을 비활성화하는 것은 차단. 마지막 활성 ADMIN의 역할 변경·비활성화·삭제도 차단. 프론트 활성/비활성 토글은 `DELETE` 대신 `PUT { isActive }`(`toggleUserActive`) 사용
- `DELETE /users/:id` — `isActive=false` soft delete(물리 삭제 없음). 본인 삭제 불가
- 응답 DTO에 `passwordHash` 미포함(`userRepository.findById` select 제한)

**QR API**

- `GET /qr/list?plantId=&q=&limit=` — QR 발급 목록. CUSTOMER는 본인 소유 개체만.
- `GET /qr/preview/:plantId` — QR 미리보기 메타(qrCode, categoryCode, sequenceNumber, publicPath). 동일 RBAC.

**Settings API**

- `GET /settings` — `authenticate` + `requireRole('ADMIN', 'STAFF')`
- `PUT /settings` — `requireRole('ADMIN')`. `serviceName`, `defaultLanguage`, `defaultPlantStatusCode`, 알림 플래그, `qrCodeDigits`, `labelPaperSize` 지원
- `SystemSettings` 모델(id='default' 싱글톤) — seed upsert 포함

**CommonCode / Public API**

- `GET /common-codes?groupCode=` — `authenticate` 필수, 조회 가능
- `GET /common-codes/:id`, `POST /common-codes`, `PUT /common-codes/:id`, `DELETE /common-codes/:id` — CUD는 `requireRole('ADMIN','STAFF')`. 삭제는 `isActive=false` soft delete
- `GET /public/plants`, `GET /public/plants/:qrCode` — Public API는 인증 불필요(아래 Public API 섹션 참고)

**Cart API**

- `GET /cart` — 본인 장바구니 조회 (`authenticate` 필수)
- `POST /cart/items` — `{ plantId | qrCode, quantity }` 추가 (동일 plant는 quantity 증가)
- `PUT /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart/clear`
- FOR_SALE 상태 Plant만 추가 가능

**Public API**

- `GET /public/plants` — 공개 판매 목록 (기본 status=FOR_SALE). `categoryId`, `speciesId`, `status`, `q`, `page`, `limit`
- `GET /public/plants/:qrCode` — 인증 불필요. `latestImage`/`latestHistory`(최신 1건) 포함. 관리자 전용 필드는 Prisma `select` 단계부터 조회하지 않음

## 4. 프론트 상태

### 4-1. Admin 디자인 시스템 · UX 패턴

- **CSS 토큰** — `client/src/assets/tokens.css`: Primary/Danger/Warning/Success 색, 4px spacing scale, `--radius-*`, `--shadow-*`, 버튼/input 높이(`--btn-height-sm/md/lg`). `admin.css`·`main.css`에서 import.
- **Base 컴포넌트** — `components/base/`: `BaseButton`(primary/secondary/outline/danger/ghost/warning, sm/md/lg), `BaseInput`, `BaseSelect`, `BaseTextarea`, `BaseTable`, `BaseModal`, `IconButton`(edit/delete/view SVG).
- **공통 UX 컴포넌트** — `FilterBar`(필터 슬롯 → 검색 input → 검색 버튼), `DetailPageActions`(상세: 수정/삭제/목록), `TableRowActions`(목록: 아이콘 수정/삭제/상세), `PageHeader`, `EmptyState`, `StatusBadge`.
- **등록 버튼 텍스트** — Plant/Species/Location/QR 목록 액션 버튼을 **「등록」**으로 통일(페이지 제목·Modal 제목은 도메인명 유지).
- **상세 CRUD 패턴** — Plant/Species/Location/User/QR 상세에 `DetailPageActions` 적용. 편집은 Modal(`*FormModal.vue`) 기반으로 통일. Plant/User 상세는 삭제 API 연동, Species/Location은 soft delete.
- **모바일 사이드바** — `stores/ui.ts`의 `sidebarMobileOpen` + `AdminLayout` backdrop + `AdminSidebar` slide-in drawer. PC는 `sidebarCollapsed` 토글 유지.
- **메뉴 RBAC** — `config/menu.ts` 각 항목 `roles` → `AdminSidebar`에서 `auth.hasRole()` 필터(예: 사용자관리=ADMIN only).

### 4-2. 인증 · 라우팅

- **로그인 페이지** — `views/LoginView.vue` + `/login` 라우트. `useAuthStore().login()` 성공 시 `redirect` 쿼리(또는 `/admin/dashboard`)로 이동.
- **토큰 저장** — `api/http.ts`가 `localStorage`(`ask-plant.accessToken`) 읽기/쓰기/삭제 함수를 소유하고, `stores/auth.ts`는 사용자 정보(`ask-plant.user`)와 로그인/로그아웃 액션만 관리한다(순환 참조 방지를 위해 토큰 저장소를 store 밖으로 분리).
- **axios interceptor** — `api/http.ts` 요청 인터셉터가 저장된 토큰이 있으면 모든 요청에 `Authorization: Bearer <token>`을 자동 첨부. 응답 인터셉터는 `401`(단, `/auth/login` 자체 실패는 제외)을 감지하면 토큰을 지우고 `window.location.href`로 `/login?redirect=...`로 이동.
- **router guard** — `router/index.ts`의 `beforeEach`가 `meta.requiresAuth`(부모 라우트 `/admin`에 설정, 하위 전체 상속)를 검사해 미인증(토큰 없음) 시 즉시 `/login`(`redirect` 쿼리로 원래 경로 보존), 토큰은 있지만 아직 검증 전(`meChecked=false`, 새로고침 직후 포함)이면 `GET /auth/me`로 유효성을 확인한 뒤 통과/실패를 결정한다. `meta.roles: UserRole[]`를 지정하면 해당 role만 통과시키는 확장 지점도 마련(현재 실제로 role을 제한하는 라우트는 없음).
- **auth store 확장** — `stores/auth.ts`에 `fetchMe()`(GET /auth/me로 토큰 검증 + user 갱신, 실패 시 세션 정리) 및 `hasRole(...roles)` 헬퍼 추가. `meChecked`/`meLoading` 상태로 중복 호출을 방지.
- **AdminHeader** — mock 사용자 대신 `useAuthStore().user`(실제 로그인 사용자)를 표시하고 로그아웃 버튼 추가.
- **실질적 영향**: 서버 인증 요구와 프론트 로그인 계층이 맞물려 동작 — `/admin/*` 미인증 진입 시 `/login` 리다이렉트.

### 4-3. 관리자 화면별 연동

- **Plant** — FilterBar + BaseTable + commerce 컬럼. 상세: 판매 강조 패널·계산 필드·`PlantFormModal`·삭제. 등록(`PlantCreateView`): commerce 필드 포함.
- **Species** — BaseTable 목록 + FilterBar. 상세: `DetailPageActions` + `SpeciesFormModal` + soft delete.
- **Location** — 트리 목록(`buildOrderedTree`) + 상세 계층 breadcrumb + `LocationFormModal` + soft delete.
- **CommonCode** — 그룹/코드 Grid Table + `CommonCodeFormModal` CUD(ADMIN/STAFF).
- **User** — BaseTable + role/active FilterBar. `toggleUserActive`(PUT `isActive`). 상세 `UserFormModal` + DetailPageActions.
- **Dashboard** — Stat 카드·상태 분포·최근 목록 클릭 → Plant/Species/Location 상세 또는 필터 목록.
- **Photo** — 그리드 + 우측 상단 IconButton(수정/삭제). `PhotoFormModal` URL 등록.
- **Plant 상세 Timeline** — `HistoryFormModal` + 이력 삭제.
- **QR** — TableRowActions(라벨/상세). `QrDetailView` DetailPageActions. 라벨 인쇄 API 미구현.
- **Settings** — BaseInput/BaseSelect. 프로필·시스템(QR/알림 포함) 분리 패널.

### 4-4. Public · Cart

- **Public(`/p`)** — `stores/publicShowcase.ts` → `GET /public/plants` 쇼케이스 그리드·필터
- **Cart** — `stores/cart.ts` → `/cart/*` API. `/cart` 로그인 필수. toast + header badge
- **Public(`/p/:qrCode`)** — `stores/publicPlant.ts` → `GET /public/plants/:qrCode`
- **AdminHeader "MOCK DATA" 배지** — 관리자 라우트 전부 `meta.isMock: false`. 배지 미표시.

## 5. DB 상태

- 13개 모델, PostgreSQL, `prisma db push`로 스키마 동기화(migration 이력 없음 — `_prisma_migrations` 미사용 환경에서는 `db push` + `migrate resolve`로 수동 정렬 가능)
- **Plant commerce 컬럼**(2026-07-05): `flowerColor`, `purchaseHeadCount`, `purchaseUnitPrice`, `currentHeadCount`, `unitSellingPrice`, `totalSellingPrice`, `purchaseVendor`, `purchaseFarm`
- **핵심 관계**: `User(1)` — `Plant(N, ownerId)` / `Species(1)` — `Plant(N)` / `CommonCode(1)` — `Plant(N, status·originType 2개 FK)` / `PlantLocation(1)` — `Plant(N)`
- `Plant.ownerId`는 스키마상 optional FK이지만, `plant.service.ts`의 `create()`가 항상 값을 채워 넣으므로 사실상 필수처럼 동작한다.
- Soft Delete는 `Plant.deletedAt`(타임스탬프)만 사용하고, 다른 모델(`User`, `Species`, `PlantCategory` 등)은 `isActive` boolean 패턴을 쓴다 — 모델마다 삭제 정책이 다르다.
- **Seed 데이터**(`server/prisma/seed.ts` + `seed-data.ts`, `npx prisma db seed`로 실행, upsert 기반 재실행 안전):
  - `PlantCategory` 5종(CON/LTH/CAT/AFR/OTH), `CommonCode` 27종(PLANT_STATUS/HISTORY_TYPE/LOCATION_TYPE/ORIGIN_TYPE)
  - `User` 2명 — SYSTEM ADMIN(`admin@ask-plant.local`), 테스트 CUSTOMER(`customer@ask-plant.local`), 비밀번호는 bcrypt 해시로 저장
  - `Species` 5종(카테고리별 1개), `PlantLocation` 2종(온실/전시)
  - `Plant` 3건(SYSTEM ADMIN 소유로 생성) + `PlantImage` 6건 + `PlantHistory` 6건(입고/분갈이/개화 등) — Dashboard/Photo/History API 즉시 테스트 가능

## 6. 다음 개발 우선순위 3개

1. **주문/결제 API** — 장바구니 문의 접수·주문 확정 미구현.
2. **파일 업로드(multer/S3)** — Image 등록 URL 입력 방식.
3. **QR 라벨 인쇄 API** — 관리 화면 버튼은 있으나 서버 미구현(비활성).

---

**결론(한 줄)**: 상용 MVP + Admin UX 통합 완료 — 실 API·디자인 시스템·CRUD 패턴 일원화. 결제/파일업로드/QR인쇄만 남음.
