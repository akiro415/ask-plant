# CHANGELOG

> 작업을 완료할 때마다 이 파일에 기록합니다. (docs/참고용.md 지침)
>
> 작업 전 `AGENTS.md`, `docs/RULES.md`, `docs/UI.md`, `docs/ROADMAP.md`, `docs/NAMING.md`를 반드시 확인하고,
> 규칙과 충돌하는 부분은 구현 전에 설명 후 승인을 받습니다.

## 2026-07-05 — Cart API + Public 쇼케이스(`/p`) 완성

### 변경 이유

장바구니가 세션 메모리만 사용했고 Public `/p`가 QR 안내 랜딩만 제공해 거래·외부 노출 흐름이 미완성이었다.

### 변경 파일

**백엔드**

- **신규**: `cart` routes/controllers/services/repositories/schemas
- **수정**: `public` — `GET /public/plants` 목록 API
- **수정**: `seed-data.ts` — FOR_SALE 테스트 개체 2건

**프론트**

- **신규**: `api/cart.api.ts`, `stores/publicShowcase.ts`, `types/cart.ts`
- **수정**: `stores/cart.ts`(API 기반), `PublicShowcaseView.vue`, `PublicCartView.vue`, `PublicLayout.vue`(badge/toast)

### 검증

- `npx tsc --noEmit`, `npx vue-tsc -b --noEmit` 통과

## 2026-07-05 — SaaS MVP 마감 (QR/Settings API, mock 제거, Public 보강)

### 변경 이유

QR/Settings 화면이 Plant/Public API 우회 또는 placeholder로 동작했고, `client/src/mock/` 잔재가 남아 있었다. 전용 API 추가 및 mock 완전 제거로 MVP를 마감했다.

### 변경 파일

**백엔드**

- **신규**: `server/src/routes/qr.ts`, `settings.ts`, controllers/services/repositories/schemas
- **수정**: `server/prisma/schema.prisma` — `SystemSettings` 모델
- **수정**: `server/prisma/seed.ts` — SystemSettings upsert
- **수정**: `server/src/services/public.service.ts`, `repositories/public.repository.ts` — `latestImage`/`latestHistory`
- **수정**: `server/src/app.ts` — `/qr`, `/settings` 마운트

**프론트**

- **신규**: `client/src/api/qr.api.ts`, `settings.api.ts`, `types/qr.ts`, `types/settings.ts`
- **수정**: `stores/qr.ts`, `stores/settings.ts`, `QrListView.vue`, `SettingsView.vue`, `PublicPlantView.vue`, `types/public.ts`
- **삭제**: `client/src/mock/*` 전체

### 검증

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 통과
- `npx prisma db push` — `system_settings` 테이블 생성

## 2026-07-05 — Public 모바일 화면(`/p/:qrCode`) API 연동

### 변경 이유

QR 스캔 Public 화면이 mock(`getPlantByQrCode`)만 사용해 실제 seed/API 개체와 불일치했다. `GET /public/plants/:qrCode`로 전환했다.

### 변경 파일

- **신규**: `client/src/types/public.ts`, `client/src/stores/publicPlant.ts`
- **수정**: `client/src/api/public.api.ts`, `stores/cart.ts`(qrCode 기준)
- **수정**: `PublicPlantView.vue`, `PublicShowcaseView.vue`, `PublicCartView.vue`
- **수정**: `router/index.ts` — Public 라우트 `meta.isMock: false`

### 검증

- `npx vue-tsc -b --noEmit`(client) 통과

## 2026-07-05 — History/Image CUD API + Photo/PlantDetail 연동

### 변경 이유

History/Image 조회 API만 있어 Photo 업로드·Plant Timeline 등록/삭제가 불가능했다. CUD API를 추가하고 프론트를 연동했다.

### 변경 파일

**백엔드**

- **수정**: `server/src/schemas/history.schema.ts`, `image.schema.ts` — create/update 스키마
- **수정**: `server/src/repositories/history.repository.ts`, `image.repository.ts`, `common-code.repository.ts` — create/update/delete
- **수정**: `server/src/services/history.service.ts`, `image.service.ts` — CUD + RBAC
- **수정**: `server/src/controllers/history.controller.ts`, `image.controller.ts`
- **수정**: `server/src/routes/plants.ts`, `histories.ts`, `images.ts`

### API 엔드포인트

| Method | Path | RBAC |
|---|---|---|
| POST | `/plants/:id/histories` | authenticate, CUSTOMER=본인 소유만 |
| PUT | `/histories/:id` | 동일 |
| DELETE | `/histories/:id` | 동일 (물리 삭제) |
| POST | `/plants/:id/images` | 동일 |
| PUT | `/images/:id` | 동일 |
| DELETE | `/images/:id` | 동일 (물리 삭제) |

**프론트엔드**

- **신규**: `client/src/stores/history.ts`, `HistoryFormModal.vue`, `PhotoFormModal.vue`
- **수정**: `client/src/api/history.api.ts`, `image.api.ts`, `stores/photo.ts`
- **수정**: `PhotoListView.vue`, `PlantDetailView.vue`, `Timeline.vue`

### 검증

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 통과

## 2026-07-05 — QR/Settings API 연동 + 관리자 mock 100% 제거

### 변경 이유

STATUS.md 남은 mock 제거 작업 마지막 단계. QR 관리·Settings 화면이 mock 데이터만 사용해 관리자 영역 mock 의존이 남아 있었다.

### 변경 파일

**백엔드**

- **수정**: `server/src/schemas/auth.schema.ts` — `updateMeSchema` 추가
- **수정**: `server/src/services/auth.service.ts`, `controllers/auth.controller.ts`, `routes/auth.ts` — `PUT /auth/me`(본인 name/phone 수정)

**프론트엔드**

- **신규**: `client/src/api/public.api.ts` — `GET /public/plants/:qrCode`
- **신규**: `client/src/stores/qr.ts`, `client/src/stores/settings.ts`
- **수정**: `client/src/api/auth.api.ts`, `stores/auth.ts` — `updateMe`, `syncUser`
- **수정**: `client/src/views/admin/qr/QrListView.vue` — `GET /plants` + public fallback
- **수정**: `client/src/views/admin/settings/SettingsView.vue` — 내 계정(`GET/PUT /auth/me`) + 시스템 설정 UI 분리(비활성)
- **수정**: `client/src/router/index.ts` — QR/Settings `meta.isMock: false`

### 검증

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 통과

## 2026-07-05 — Species/Location 등록·수정 폼 상세 필드 보강

### 변경 이유

Species·PlantLocation 등록/수정 폼이 핵심 필드만 제공해 교배 계통(모본/부본)과 배치도 좌표·이미지를 API로 저장할 수 없었다. 백엔드 스키마는 이미 지원하므로 프론트 폼과 payload 타입만 보강했다.

### 변경 파일

- **수정**: `client/src/views/admin/species/SpeciesFormModal.vue` — `parentSpecies1Id`/`parentSpecies2Id` select 추가(선택, 수정 시 자기 자신 제외)
- **수정**: `client/src/views/admin/locations/LocationFormModal.vue` — `imagePath`/`posX`/`posY` 입력 추가
- **수정**: `client/src/api/species.api.ts`, `client/src/types/species.ts`, `client/src/stores/species.ts` — 교배 계통 필드 타입·매핑
- **수정**: `client/src/mock/species.mock.ts` — Species 타입 변경 반영

### 검증

- `npx vue-tsc -b --noEmit`(client) 통과

## 2026-07-05 — User 관리 API + UserListView 실 API 연동

### 변경 이유

STATUS.md 우선순위 2번. 사용자 관리 화면이 `mock/user.mock.ts`만 참조하고 있어 ADMIN이 실제 계정 목록을 조회·역할 변경·비활성화할 수 없었다. ADMIN 전용 User CRUD(생성 제외) API를 신설하고 프론트를 연동했다.

### 변경 파일

**백엔드**

- **신규**: `server/src/schemas/user.schema.ts`
- **수정**: `server/src/repositories/user.repository.ts` — `findMany`/`update`/`softDelete`/`countActiveAdmins`, `findById`에서 `passwordHash` 제외
- **신규**: `server/src/services/user.service.ts`, `server/src/controllers/user.controller.ts`, `server/src/routes/users.ts`
- **수정**: `server/src/app.ts` — `/users` 라우트 마운트
- **수정**: `server/src/services/auth.service.ts` — `findById` 반환 타입 변경에 맞춘 `toProfileDto` 시그니처 조정

**프론트엔드**

- **신규**: `client/src/api/user.api.ts`, `client/src/stores/user.ts`, `client/src/views/admin/users/UserFormModal.vue`
- **수정**: `client/src/views/admin/users/UserListView.vue` — mock 제거, 실 API 목록/수정/비활성화
- **수정**: `client/src/router/index.ts` — User 라우트 `meta.isMock: false`

### API 엔드포인트

| Method | Path | RBAC |
|---|---|---|
| GET | `/users?q=&role=&includeInactive=` | authenticate + ADMIN |
| GET | `/users/:id` | authenticate + ADMIN |
| PUT | `/users/:id` | authenticate + ADMIN (name/phone/role/isActive) |
| DELETE | `/users/:id` | authenticate + ADMIN (isActive=false) |

### 검증

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 통과
- admin 토큰으로 `GET /users`, `PUT /users/:id`(role 변경) curl 검증

## 2026-07-05 — History/Image 조회 API + Dashboard/Photo mock 제거

### 변경 이유

Dashboard의 "최근 분갈이/판매/사진등록" 목록과 Photo 관리 화면이 mock 데이터(`mock/dashboard.mock.ts`, `mock/images.mock.ts`)를 참조해 실제 존재하지 않는 `plantId`로 상세 화면 404가 발생했다. History/Image 조회 API를 신설하고 프론트를 실 API로 전환했다.

### 변경 파일

**백엔드**

- **신규**: `server/src/schemas/history.schema.ts`, `server/src/schemas/image.schema.ts`
- **신규**: `server/src/repositories/history.repository.ts`, `server/src/repositories/image.repository.ts`
- **신규**: `server/src/services/history.service.ts`, `server/src/services/image.service.ts`
- **신규**: `server/src/controllers/history.controller.ts`, `server/src/controllers/image.controller.ts`
- **신규**: `server/src/routes/histories.ts`, `server/src/routes/images.ts`
- **수정**: `server/src/routes/plants.ts` — `GET /:id/histories`, `GET /:id/images` 추가(`GET /:id`보다 먼저 등록)
- **수정**: `server/src/app.ts` — `/histories`, `/images` 라우트 마운트
- **수정**: `server/prisma/seed-data.ts`, `server/prisma/seed.ts` — PlantImage 6건 + PlantHistory 6건 seed 추가

**프론트엔드**

- **신규**: `client/src/api/history.api.ts`, `client/src/api/image.api.ts`
- **신규**: `client/src/stores/photo.ts`
- **수정**: `client/src/stores/dashboard.ts` — mock 제거, `GET /histories/recent` + `GET /images/recent` 병렬 호출
- **수정**: `client/src/views/admin/DashboardView.vue` — `(Mock)` 라벨 제거, `recentPart` 실 데이터 사용
- **수정**: `client/src/views/admin/photos/PhotoListView.vue` — `GET /images` API 연동, loading/error 상태
- **수정**: `client/src/router/index.ts` — Photo 라우트 `meta.isMock: false`

### API 엔드포인트

| Method | Path | RBAC |
|---|---|---|
| GET | `/plants/:id/histories` | authenticate, CUSTOMER=본인 소유만 |
| GET | `/plants/:id/images` | 동일 |
| GET | `/histories/recent?type=REPOT&limit=5` | 동일 |
| GET | `/images/recent?limit=5` | 동일 |
| GET | `/images?imageType=&limit=` | 동일 (사진관리 목록) |

### 검증

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 통과
- `npx prisma db seed` 후 admin 토큰으로 `GET /histories/recent?type=REPOT`, `GET /images/recent`, `GET /plants/seed-plant-1/histories`, `GET /images` curl 검증 — 실제 seed plantId 반환 확인

## 2026-07-05 — Dashboard `GET /dashboard` 전환 + Species/PlantLocation CUD 화면 + Mock 배지 동적화

### 변경 이유

백엔드에 이미 구현된 Species/PlantLocation CRUD API와 신규 Dashboard 집계 API를 프론트가 조회(READ)만 사용하고 있어, 실제로 생성/수정/삭제를 실행할 수 있는 화면이 없었고 Dashboard도 여전히 클라이언트 집계 방식이었다. 4가지 작업으로 프론트-백엔드 연결을 완성했다: ① Dashboard 스토어를 `GET /dashboard` 단일 호출로 전환, ② Species 등록/수정/삭제 화면 구현, ③ PlantLocation 등록/수정/삭제 화면 구현(상위 위치 자기참조 차단 포함), ④ "MOCK DATA" 배지를 라우트 메타 기준으로 동적 노출.

### 변경 파일

**Dashboard**

- **신규**: `client/src/api/dashboard.api.ts` — `fetchDashboardSummary()` (`GET /dashboard`)
- **수정**: `client/src/stores/dashboard.ts` — `plantStore`/`speciesStore`/`locationStore` 3개를 각각 로드해 집계하던 로직을 제거하고 `summary`(API 응답 그대로)와 `mockPart`(History/Image 미구현으로 유지되는 mock 3종)로 재구성
- **수정**: `client/src/views/admin/DashboardView.vue` — 통계 카드/상태 분포/최근 등록 개체(신규 패널)를 API 필드에 맞춰 재매핑, 서버가 제공하지 않는 "오늘 등록" 카드 제거, mock 유지 섹션에 `(Mock)` 라벨 추가

**Species CUD**

- **수정**: `client/src/api/species.api.ts` — `createSpecies`/`updateSpecies`/`deleteSpecies` 추가
- **수정**: `client/src/stores/species.ts` — `formLoading`/`formError`/`deleteLoadingId`/`deleteError` 상태와 `createSpecies`/`updateSpecies`/`deleteSpecies` 액션(성공 시 `fetchSpecies()` 재조회) 추가, 폼용 `categoryChoices`(id 포함 카테고리 목록) computed 추가
- **신규**: `client/src/views/admin/species/SpeciesFormModal.vue` — 등록/수정 겸용 폼 모달
- **수정**: `client/src/views/admin/species/SpeciesListView.vue` — `+ 품종 등록` 버튼 활성화, 카드별 "수정"/"삭제" 버튼 추가(ADMIN/STAFF만 노출), 삭제 시 `confirm()` 확인 후 API 호출

**PlantLocation CUD**

- **수정**: `client/src/api/location.api.ts` — `createLocation`/`updateLocation`/`deleteLocation` 추가
- **수정**: `client/src/stores/location.ts` — Species와 동일한 패턴의 CUD 상태/액션 추가, 위치유형 select용 `typeOptions`(`ensureTypeOptionsLoaded`, `GET /common-codes?groupCode=LOCATION_TYPE`) 추가
- **신규**: `client/src/views/admin/locations/LocationFormModal.vue` — 등록/수정 겸용 폼 모달, 상위 위치 select에서 수정 대상 자기 자신을 제외
- **수정**: `client/src/views/admin/locations/LocationListView.vue` — `+ 위치 등록` 버튼 활성화, 행별 "수정"/"삭제" 버튼 추가(ADMIN/STAFF만 노출)

**공용 컴포넌트 / Mock 배지**

- **신규**: `client/src/components/common/Modal.vue` — `Teleport` 기반 공용 모달(제목/본문 슬롯/`footer` 슬롯), Species/Location 폼 모달이 공유
- **수정**: `client/src/router/index.ts` — 관리자 라우트에 `meta.isMock` 추가(Plant/CommonCode/Species/Location/Dashboard: `false`, Photo/QR/User/Settings: `true`)
- **수정**: `client/src/components/layout/AdminHeader.vue` — "MOCK DATA" 배지를 `route.meta.isMock`이 `true`일 때만 렌더링하도록 `v-if` 적용

### 구현 내용

- **Dashboard**: 응답의 `plantCount/speciesCount/locationCount`는 통계 카드로, `statusDistribution`은 상태 분포 목록으로, `recentPlants`(신규 활용)는 새로 추가한 "최근 등록 개체" 패널로 매핑했다. 이 패널은 실제 `plantId`를 가리키므로 mock 목록과 달리 상세 화면 링크가 정상 동작한다.
- **Species/Location 폼**: 등록/수정을 하나의 모달 컴포넌트로 처리하고(`species`/`location` prop이 `null`이면 등록 모드), 제출 시 스토어의 `createX`/`updateX`를 호출한다. 성공하면 목록을 다시 조회(`fetchSpecies`/`fetchLocationList`)해 `speciesList`/`locations`(둘 다 computed, 후자는 `buildOrderedTree` 포함) 파생 상태가 자동으로 최신화된다.
- **상위 위치 자기참조 차단**: `LocationFormModal`의 `parentOptions`가 `store.locations`에서 수정 대상(`props.location.id`)을 제외해 select 옵션 자체에 자기 자신이 나타나지 않는다. 더 깊은 순환 참조(예: 자신의 하위 위치를 상위로 지정)는 서버의 `assertValidParent`/`wouldCreateCycle`가 최종 차단하며, 이 경우 `400` 응답이 `formError`로 표시된다.
- **RBAC UI 반영**: 등록/수정/삭제 버튼은 `useAuthStore().hasRole('ADMIN', 'STAFF')`일 때만 렌더링된다(서버가 이미 `requireRole`로 차단하지만, CUSTOMER 로그인 시 애초에 버튼을 노출하지 않아 UX상 혼란을 줄인다).
- **Soft Delete UX**: 삭제 버튼은 `confirm()`으로 1차 확인 후 `DELETE`를 호출하고, 서버가 `isActive=false`로만 처리하므로 성공 메시지 대신 목록에서 즉시 사라지는 것으로 결과를 보여준다(재활성화 UI는 아직 없음).
- **Mock 배지**: `route.meta.isMock`은 자식 라우트 각각에 개별 지정한다(상속 아님) — 관리자 레이아웃 자체에는 지정하지 않고 화면 단위로 정확히 표시한다.

### 검증

- `npx vue-tsc -b --noEmit`, `npm run build`(client) 모두 통과
- `POST /auth/login`(admin) → `GET /api/v1/dashboard` curl 호출로 응답 스키마(`plantCount/speciesCount/locationCount/recentPlants/statusDistribution`)가 프론트 타입(`DashboardSummaryDto`)과 일치함을 재확인
- Species/PlantLocation CUD API 자체는 이전 작업에서 이미 curl로 RBAC(`200`/`403`/`401`) 검증 완료 — 이번 작업은 프론트 연동이 스키마와 일치하는지 코드 리뷰 + 타입체크로 검증(라이브 DB에 대한 추가 쓰기성 curl 테스트는 실행하지 않음)

## 2026-07-05 — Dashboard 요약 API 신규 생성 (Prisma 집계)

### 변경 이유

관리자 대시보드에 필요한 통계(총 개체수/품종수/위치수/최근 개체/상태 분포)를 서버가 한 번에 계산해 내려주는 API가 없어, 프론트가 3개의 목록 API를 각각 호출한 뒤 클라이언트에서 직접 집계하고 있었다. `Plant/Species/PlantLocation`과 동일한 `Route → Controller → Service → Repository` 구조로 `GET /api/v1/dashboard`를 신규 추가하고, 집계는 Prisma의 `count`/`groupBy`를 사용해 DB에서 계산하도록 했다.

### 변경 파일

- **신규**: `server/src/repositories/dashboard.repository.ts` — `countPlants`/`countSpecies`/`countLocations`(Prisma `count`), `statusDistribution`(Prisma `groupBy`), `findCommonCodesByIds`, `recentPlants`
- **신규**: `server/src/services/dashboard.service.ts` — `DashboardSummaryDto` 정의, `statusDistribution`의 `statusId`를 CommonCode의 `code`/`name`으로 변환하고 `sortOrder`로 정렬
- **신규**: `server/src/controllers/dashboard.controller.ts` — `getSummary` 핸들러
- **신규**: `server/src/routes/dashboard.ts` — `authenticate` + `requireRole('ADMIN', 'STAFF')` 적용
- **수정**: `server/src/app.ts` — `/api/v1/dashboard` 라우트 등록

### 구현 내용

- **응답 형식**: `{ data: { plantCount, speciesCount, locationCount, recentPlants, statusDistribution } }`
  - `plantCount`: `prisma.plant.count({ where: { deletedAt: null } })`
  - `speciesCount`: `prisma.species.count({ where: { isActive: true } })`
  - `locationCount`: `prisma.plantLocation.count({ where: { isActive: true } })`
  - `recentPlants`: `createdAt desc` 정렬 후 최신 5건(품종/상태 요약 정보 포함)
  - `statusDistribution`: `prisma.plant.groupBy({ by: ['statusId'], where: { deletedAt: null }, _count: { _all: true } })`로 상태별 개체 수를 집계한 뒤, `statusId`를 CommonCode 조회로 `code`/`name`으로 변환하고 `sortOrder` 기준 정렬
- **RBAC**: `requireRole('ADMIN', 'STAFF')` — CUSTOMER는 `403 FORBIDDEN`, 미인증은 `401 UNAUTHORIZED`. 대시보드는 전체 집계 데이터라 CUSTOMER(자기 소유만 접근 가능한 역할)에게는 노출하지 않는다.
- **Prisma 집계 사용**: 상태 분포를 애플리케이션 레이어에서 전체 Plant row를 가져와 JS로 세는 대신 `groupBy` + `_count`로 DB에서 계산해 데이터량이 늘어도 성능이 저하되지 않도록 했다.

### 영향 범위

- 신규 엔드포인트 추가만 수행. 기존 `/plants`, `/species`, `/locations`, `stores/dashboard.ts`(클라이언트) 등은 변경하지 않았다 — 프론트는 아직 이 API를 사용하지 않고 기존 방식(클라이언트 집계)을 유지한다(`docs/STATUS.md` 다음 우선순위에 교체 작업 등록).

### 확인 사항 (테스트)

- `npx tsc --noEmit`(server) 통과
- curl로 RBAC 확인: ADMIN 토큰 `200`(정상 데이터: `plantCount:3, speciesCount:5, locationCount:2`, `recentPlants` 3건이 `createdAt desc`로 정렬, `statusDistribution`에 `IN_STOCK: 3`), CUSTOMER 토큰 `403 FORBIDDEN`, 토큰 없음 `401 UNAUTHORIZED`

---

## 2026-07-05 — 프론트 Species / PlantLocation / Dashboard 일부 통계 mock 제거 → 실 API 전환

### 변경 이유

서버는 Species/PlantLocation CRUD를 모두 갖췄지만 관리자 화면(`SpeciesListView`/`SpeciesDetailView`/`LocationListView`)은 여전히 `client/src/mock/*.mock.ts` 더미 데이터로 렌더링되고 있었다. Dashboard도 전부 mock 통계였다. 기존 UI(레이아웃/카드/테이블 구조)는 그대로 유지한 채, 데이터 소스만 mock → 실 API로 전환하고 loading/error 상태를 추가했다.

### 변경 파일

- **수정(서버, 하위 호환 확장)**: `server/src/repositories/species.repository.ts`, `server/src/services/species.service.ts` — `GET /species`(쿼리 미지정) 응답이 기존 최소 필드(`id/displayName/scientificName/koreanName/category`)에 더해 관리자 화면에 필요한 전 필드(영문명/필드넘버/판매자명/taxonRank/썸네일 등)를 항상 함께 반환하도록 확장. 기존 `fetchSpeciesOptions()` 소비자(PlantCreateView)는 필요한 필드만 읽으므로 영향 없음
- **신규**: `client/src/api/location.api.ts` — `GET /locations` 클라이언트, `LocationApiRow` 타입 정의
- **재작성**: `client/src/api/species.api.ts` — `SpeciesListItem`(전 필드) 타입과 `fetchSpeciesList()` 추가(`fetchSpeciesOptions()`는 유지)
- **재작성**: `client/src/stores/species.ts` — mock(`mockSpeciesList`) 제거, `fetchSpecies()`/`ensureSpeciesLoaded()`로 `GET /species` 연동. `plantStore.plants`를 `species.id` 기준으로 집계해 `plantCount`를 합성하는 computed 추가. 카테고리 필터 옵션은 조회된 품종에서 실제 등장한 카테고리만 추출(Plant 목록 화면과 동일 패턴)
- **재작성**: `client/src/stores/location.ts` — mock(`mockLocations`) 제거, `fetchLocationList()`/`ensureLocationsLoaded()`로 `GET /locations` 연동. 서버가 내려주는 평탄한 배열을 `parentId` 기준 DFS로 재정렬하며 `depth`를 계산하는 `buildOrderedTree()` 추가, `plantStore.plants`로 위치별 `plantCount` 합성
- **재작성**: `client/src/stores/dashboard.ts` — mock 전용 `buildDashboardSummary()` 의존 제거. 통계 카드 4종(총 식물수/품종수/상태분포/위치수/오늘등록)은 `plantStore`/`speciesStore`/`locationStore`의 실 데이터로 계산. "최근 분갈이/판매/사진등록" 3개 목록은 History/Image 조회 API가 없어 예시 데이터를 그대로 사용(요청 범위: "일부 통계")
- **수정**: `client/src/views/admin/species/SpeciesListView.vue`, `SpeciesDetailView.vue` — `onMounted`에서 `fetchSpecies()`/`ensureSpeciesLoaded()` 호출, loading(⏳)/error(⚠️+재시도) 상태 추가, `mockCategories` 참조 제거(→ `store.categoryOptions`), 썸네일 없는 품종은 이모지 placeholder로 대체 표시
- **수정**: `client/src/views/admin/locations/LocationListView.vue` — `onMounted`에서 `fetchLocationList()` 호출, loading/error/empty 상태 추가
- **수정**: `client/src/views/admin/DashboardView.vue` — `onMounted`에서 `fetchStats()` 호출, 페이지 상단 loading/error 상태 추가, `findCommonCode` mock 조회 제거(상태 라벨은 API 응답의 `plant.status.name` 그대로 사용), subtitle의 "(Mock Data)" 문구 제거
- **수정(타입 정리)**: `client/src/types/species.ts`(`SpeciesCategory` 축소 타입, `thumbnailUrl: string | null`), `client/src/types/location.ts`(`LocationTypeRef` 축소 타입), `client/src/types/plant.ts`(`PlantSpeciesCategoryRef` 축소 타입) — 실제 API가 내려주는 필드(id/code/name)에 맞춰 과도하게 넓던 타입(`PlantCategory`/`CommonCode` 재사용)을 정리

### 구현 내용

- **파생 데이터는 새 API 없이 클라이언트에서 계산**: 품종별/위치별 "개체 수"는 서버 응답에 없어 이미 로드된 `plantStore.plants`를 집계해 합성한다(Plant 목록 화면의 `speciesId → categoryCode` 매핑과 동일한 기존 패턴 재사용). 위치 계층의 들여쓰기 단계(`depth`)도 서버가 평탄한 배열만 주므로 클라이언트에서 트리를 재구성해 계산한다.
- **로딩/에러 UX는 기존 확립된 패턴을 그대로 재사용**: `PlantListView.vue`에서 이미 쓰던 `EmptyState` + 아이콘(⏳/⚠️) + "다시 시도" 버튼 조합을 Species/Location/Dashboard에 동일하게 적용해 화면 간 일관성을 유지했다.
- **Dashboard는 "일부"만 전환**: 통계 카드 4종은 실 API 기반이지만, 최근 분갈이/판매/사진등록 3개 목록은 History/Image 조회 API가 서버에 없어 의도적으로 mock을 유지했다(`docs/STATUS.md` 위험 요소에 관련 제약을 명시).
- **기존 UI 변경 최소화**: 레이아웃/테이블/카드 구조는 그대로 두고, 로딩·에러 상태 추가와 썸네일 null 처리(placeholder) 등 데이터 소스 전환에 필수적인 부분만 손댔다.

### 영향 범위

- 서버 변경은 `GET /species` 응답 필드 확장뿐이며 하위 호환(기존 필드 유지, 추가 필드만 늘어남)이라 다른 API/화면에 영향 없음.
- Photo/QR/User/Settings 화면과 모바일 Public 화면은 이번 작업 범위에 포함되지 않아 여전히 mock 상태다.

### 확인 사항 (테스트)

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client), `npm run build`(client) 모두 통과
- curl로 확장된 `GET /species` 응답에 전 필드가 포함됨을 확인
- 브라우저 E2E(관리자 로그인 후): Dashboard(총 식물수 3/품종수 5/재고 3개 등 실데이터 표시), Species 목록(카테고리 필터 정상 동작, 개체 수 정확), Species 상세(보유 개체 목록/썸네일 placeholder 정상), Location 목록(seed 위치 2건 정상 표시) 모두 시각적으로 확인 완료

---

## 2026-07-05 — Species / PlantLocation CRUD API 완성 + RBAC 적용

### 변경 이유

Plant CRUD와 인증/RBAC는 완성됐지만, 참조 데이터인 Species는 조회 API만 있었고 PlantLocation은 API 자체가 없어 관리자가 품종·위치를 직접 관리할 수 없었다. 기존 `Route → Controller → Service → Repository` 구조와 RBAC(ADMIN/STAFF만 CUD, CUSTOMER는 조회만) 패턴을 그대로 확장해 두 도메인의 CRUD API를 완성했다. CommonCode는 요청 범위상 "조회 + 그룹 필터 유지"로 변경하지 않았다.

### 변경 파일

- **신규**: `server/src/schemas/species.schema.ts` — `createSpeciesSchema`/`updateSpeciesSchema`/`listSpeciesQuerySchema`(zod)
- **재작성**: `server/src/repositories/species.repository.ts` — `findMany`(필터: `q`/`categoryId`/`includeInactive`), `findById`, `create`, `update`, `countPlantsUsing`, `softDelete` 추가
- **재작성**: `server/src/services/species.service.ts` — `SpeciesDetailDto` 추가(요약 DTO는 하위 호환 유지), `getById`/`create`/`update`/`remove` 구현. `remove`는 실제 삭제 대신 `isActive=false` 처리
- **재작성**: `server/src/controllers/species.controller.ts` — `getById`/`create`/`update`/`remove` 핸들러 추가
- **재작성**: `server/src/routes/species.ts` — `authenticate` 전체 적용, `POST/PUT/DELETE`에 `requireRole('ADMIN', 'STAFF')` 적용
- **신규**: `server/src/schemas/location.schema.ts`, `repositories/location.repository.ts`, `services/location.service.ts`, `controllers/location.controller.ts`, `routes/locations.ts` — PlantLocation CRUD 전 계층 신규 구현(Species와 동일 패턴)
- **수정**: `server/src/app.ts` — `/api/v1/locations` 라우트 신규 등록

### 구현 내용

- **RBAC**: 두 도메인 모두 `router.use(authenticate)`로 로그인을 강제하고, 생성/수정/삭제 라우트에만 `requireRole('ADMIN', 'STAFF')`를 추가로 적용. CUSTOMER는 `GET`만 가능(로그인은 필요). `requireRole`은 이번에 처음 실사용됨.
- **FK 보호(soft delete)**: `DELETE`는 물리적으로 row를 지우지 않고 `isActive=false`만 변경한다. 이미 등록된 `Plant.speciesId`/`Plant.locationId` FK가 어떤 경우에도 깨지지 않으며, 사용 중인 개체가 있어도 항상 성공한다(참고용으로 사용 중인 개체 수를 서비스 레이어에서 함께 조회).
- **PlantLocation 계층 구조 무결성**: `parentId` 자기참조 구조에서 ① 자기 자신을 상위로 지정하는 것과 ② 상위 체인을 순회했을 때 순환이 발생하는 경우를 서비스 레이어(`assertValidParent`, `wouldCreateCycle`)에서 사전 차단하고 `400 VALIDATION_ERROR`로 응답한다.
- **응답 포맷 하위 호환**: `GET /species`를 쿼리 없이 호출하면 기존과 동일한 최소 필드(`id/displayName/scientificName/koreanName/category`)만 반환해 `client/src/api/species.api.ts`의 `fetchSpeciesOptions()` 호출이 코드 변경 없이 그대로 동작한다. `q`/`categoryId`/`includeInactive` 쿼리는 신규 관리자 화면을 위해 추가된 옵션이며 기본값(미지정)에서는 동작이 바뀌지 않는다.
- **CommonCode는 변경하지 않음**: 요청 범위(`조회 + 그룹 필터 유지`)에 따라 라우트·서비스·인증 정책 모두 그대로 유지.

### 영향 범위

- 서버 전용 변경. 클라이언트 코드는 수정하지 않았으며, `httpClient`의 기존 요청 인터셉터가 로그인 토큰을 모든 API 호출에 자동 첨부하므로 Species API에 인증이 추가되어도 기존 `PlantCreateView`의 `fetchSpeciesOptions()` 호출은 영향을 받지 않는다(curl로 재검증).
- `Plant` 생성/수정 로직(`plant.repository.ts`, `plant.service.ts`)은 수정하지 않았고, FK 참조 대상(Species/PlantLocation)의 CRUD가 추가되어도 정상 동작함을 실제 Plant 생성 curl로 확인했다.

### 확인 사항 (테스트)

- `npx tsc --noEmit`(server), `npx vue-tsc -b --noEmit`(client) 모두 통과
- Species: ADMIN으로 `GET/POST/PUT/DELETE` 전부 정상(`200/201/200/204`), CUSTOMER로 `POST`는 `403 FORBIDDEN`, CUSTOMER로 `GET`은 `200`, 토큰 없이 `GET`은 `401 UNAUTHORIZED` 확인
- Species: 사용 중인 seed 품종(`seed-species-cat`)을 `DELETE`해도 `204` 성공 + row는 유지되고 `isActive:false`로만 바뀌며, 해당 품종을 참조하는 seed Plant가 그대로 조회 가능함을 확인(FK 보호). 테스트 후 `isActive:true`로 복구
- PlantLocation: 상위(`E2E-ROOT`)-하위(`E2E-CHILD`) 위치 생성 후 ① 상위의 `parentId`를 하위로 변경 시도 → `400`(순환 참조 차단), ② 하위의 `parentId`를 자기 자신으로 변경 시도 → `400`(자기참조 차단) 확인
- PlantLocation: CUSTOMER `POST`는 `403`, `GET`은 `200` 확인. 상위/하위 위치 모두 `DELETE`(soft delete) 성공, FK 안 깨짐 확인
- Plant 생성 sanity check: Species/Location API 추가 이후에도 `POST /plants`가 `seed-species-cat` FK를 정상 참조해 `201`로 생성됨을 확인(QR `CAT-000002` 발급). 테스트 데이터는 이후 soft delete로 정리

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
