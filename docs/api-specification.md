# Ask Plant — REST API 명세서

## 0. 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-07-04 | 최초 API 명세 (Auth ~ QR, 10개 태그) |
| v1.1 | 2026-07-04 | **Public**, **Import**, **Dashboard**, **Inquiry** 태그 추가 / Species 검색조건 확대 / Plant 번식 전용 API 추가 / QR 라벨 API 추가 / PlantCategory를 MVP로 승격 / Plant의 `originType`을 CommonCode 참조로 변경 |

> 본 개정은 기존 API 구조를 유지한 상태의 **소폭 개선**이다. API 구현은 포함하지 않으며 문서·설계만 수정한다.

---

## OpenAPI 3.0 개요

```yaml
openapi: 3.0.3
info:
  title: Ask Plant API
  description: 다육식물 컬렉션 관리 시스템 REST API
  version: 1.1.0
servers:
  - url: http://localhost:3000/api/v1
    description: Local development
tags:
  - name: Auth
  - name: CommonCode
  - name: PlantCategory
  - name: Species
  - name: Plant
  - name: Propagation
  - name: PlantImage
  - name: PlantHistory
  - name: PlantLocation
  - name: Cart
  - name: QR
  - name: Public
  - name: Import
  - name: Dashboard
  - name: Inquiry
```

### 공통 사항

| 항목 | 규칙 |
|------|------|
| Base URL | `/api/v1` |
| Content-Type | `application/json` (파일 업로드는 `multipart/form-data`) |
| 인증 | `Authorization: Bearer {accessToken}` |
| 페이지네이션 | `?page=1&limit=20` (기본 limit=20, max=100) |
| 정렬 | `?sort=createdAt&order=desc` |
| 검색 | `?q={keyword}` — 리소스별 지원 필드는 각 절 참고, 기본은 **부분검색(LIKE, 대소문자 무시)** |
| 날짜 | ISO 8601 (`2026-07-04T12:00:00.000Z`) |
| ID | cuid 문자열 |

### 권한 정의

| 권한 | 설명 | UserRole |
|------|------|----------|
| **Public** | 인증 불필요 | — |
| **User** | 로그인 사용자 (CUSTOMER) | CUSTOMER |
| **Staff** | 재고·이력 관리 | STAFF |
| **Admin** | 전체 관리 | ADMIN |

> 표의 **권한** 열: `Admin` = ADMIN, `Staff` = STAFF, `User` = CUSTOMER, `Public` = 인증 불필요

### 공통 응답

**성공 (목록)**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

**성공 (단건)**

```json
{ "data": { } }
```

**에러**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터가 올바르지 않습니다",
    "details": [{ "field": "displayName", "message": "필수 항목입니다" }]
  }
}
```

| HTTP | code | 설명 |
|------|------|------|
| 400 | VALIDATION_ERROR | 유효성 검사 실패 |
| 401 | UNAUTHORIZED | 미인증 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | CONFLICT | 중복 (email, qrCode 등) |
| 500 | INTERNAL_ERROR | 서버 오류 |

### MVP / 확장 구분

| 표시 | 의미 |
|------|------|
| **MVP** | 1차 출시 필수 |
| **확장** | 2차 이후 |

---

## 1. Auth

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/auth/register` | POST | 회원가입 | `{ "email": "user@example.com", "password": "string", "name": "홍길동", "phone": "010-1234-5678" }` | `201` `{ "data": { "id", "email", "name", "role": "CUSTOMER", "createdAt" } }` | Public |
| `/auth/login` | POST | 로그인 | `{ "email": "user@example.com", "password": "string" }` | `200` `{ "data": { "accessToken", "refreshToken", "expiresIn": 3600, "user": { "id", "email", "name", "role" } } }` | Public |
| `/auth/me` | GET | 내 프로필 조회 | — | `200` `{ "data": { "id", "email", "name", "phone", "role", "createdAt" } }` | User |
| `/auth/logout` | POST | 로그아웃 (refreshToken 무효화) | `{ "refreshToken": "string" }` | `204` No Content | User |

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/auth/refresh` | POST | accessToken 갱신 | `{ "refreshToken": "string" }` | `200` `{ "data": { "accessToken", "expiresIn" } }` | Public |
| `/auth/password` | PATCH | 비밀번호 변경 | `{ "currentPassword", "newPassword" }` | `204` | User |
| `/auth/me` | PATCH | 프로필 수정 | `{ "name", "phone" }` | `200` `{ "data": { User } }` | User |
| `/auth/users` | GET | 사용자 목록 | — (query: `role`, `q`, `page`) | `200` `{ "data": [User], "meta" }` | Admin |
| `/auth/users/{id}` | PATCH | 사용자 수정 (role, isActive) | `{ "role", "isActive" }` | `200` `{ "data": { User } }` | Admin |
| `/auth/users/{id}` | DELETE | 사용자 비활성화 | — | `204` | Admin |

---

## 2. CommonCode

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/common-codes` | GET | 코드 목록 조회 | — (query: `groupCode`, `isActive=true`) | `200` `{ "data": [{ "id", "groupCode", "code", "name", "description", "sortOrder" }] }` | Public |
| `/common-codes/groups/{groupCode}` | GET | 그룹별 코드 조회 | — | `200` `{ "data": [{ "id", "code", "name", "sortOrder" }] }` | Public |

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/common-codes` | POST | 코드 등록 | `{ "groupCode", "code", "name", "description", "sortOrder" }` | `201` `{ "data": { CommonCode } }` | Admin |
| `/common-codes/{id}` | PUT | 코드 수정 | `{ "name", "description", "sortOrder", "isActive" }` | `200` `{ "data": { CommonCode } }` | Admin |
| `/common-codes/{id}` | DELETE | 코드 비활성화 | — | `204` | Admin |

**groupCode 목록:** `PLANT_STATUS`, `HISTORY_TYPE`, `LOCATION_TYPE`, **`ORIGIN_TYPE`** [v1.1 추가]

> **[v1.1]** `ORIGIN_TYPE`은 기존 `Plant.originType` Enum(구매/실생/삽목/분지/접목)을 대체한다. 코드 추가만으로 교환/나눔/수입/채종 등을 확장할 수 있다.

---

## 3. PlantCategory [v1.1: 확장 → MVP 승격]

> **[v1.1]** DB에 `plant_categories` 테이블이 실제로 추가되어 더 이상 `Species.genus` 대체 전략이 필요 없다. QR 접두사의 유일한 근거이기도 하다.

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plant-categories` | GET | 카테고리 목록 조회 | — (query: `isActive`) | `200` `{ "data": [{ "id", "code", "name", "description", "sortOrder" }] }` | Public |
| `/plant-categories/{id}` | GET | 카테고리 상세 | — | `200` `{ "data": { PlantCategory } }` | Public |
| `/plant-categories` | POST | 카테고리 등록 | `{ "code": "LTH", "name": "Lithops 계열", "description", "sortOrder" }` | `201` `{ "data": { PlantCategory } }` | Admin |
| `/plant-categories/{id}` | PUT | 카테고리 수정 | `{ "name", "description", "sortOrder", "isActive" }` | `200` `{ "data": { PlantCategory } }` | Admin |
| `/plant-categories/{id}` | DELETE | 카테고리 비활성화 | — | `204` | Admin |

**PlantCategory**

```json
{
  "id": "cuid",
  "code": "LTH",
  "name": "Lithops 계열",
  "description": null,
  "sortOrder": 2,
  "isActive": true,
  "speciesCount": 24
}
```

**시드 예시:** `CON`, `LTH`, `CAT`, `AFR`, `OTH`

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plant-categories/{id}/species` | GET | 카테고리별 품종 목록 | — (query: `page`) | `200` `{ "data": [SpeciesSummary], "meta" }` | Public |

---

## 4. Species

### 4.1 검색조건 [v1.1: 개선]

`GET /species`의 `q` 파라미터는 아래 필드에 대해 **모두 부분검색(OR 조건)** 을 수행한다.

| 검색 대상 필드 | 설명 |
|----------------|------|
| `displayName` | 유통명/표시명 |
| `scientificName` | 학명 |
| `englishName` | 영문명 |
| `koreanName` | 국문명 |
| `fieldNumber` | 필드넘버 |
| `sellerName` | 판매자/육성자명 |

`category` 파라미터로 `PlantCategory.id` 또는 `code`를 지정하면 정확히 일치하는 카테고리로 필터링한다(부분검색 아님).

```
GET /species?q=SB1234
  → displayName, scientificName, englishName, koreanName, fieldNumber, sellerName
    중 하나라도 "SB1234"를 포함하면 매치

GET /species?category=LTH
  → PlantCategory.code = "LTH" 인 품종만 조회

GET /species?q=한국다육&category=CON
  → sellerName에 "한국다육" 포함 + Conophytum 계열만
```

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/species` | GET | 품종 목록 | — (query: `q`, `category`, `genus`, `taxonRank`, `isActive`, `page`) | `200` `{ "data": [SpeciesSummary], "meta" }` | Public |
| `/species/{id}` | GET | 품종 상세 | — | `200` `{ "data": { SpeciesDetail } }` | Public |
| `/species` | POST | 품종 등록 | 아래 **CreateSpecies** | `201` `{ "data": { SpeciesDetail } }` | Staff |
| `/species/{id}` | PUT | 품종 수정 | 아래 **UpdateSpecies** | `200` `{ "data": { SpeciesDetail } }` | Staff |
| `/species/{id}` | DELETE | 품종 비활성화 | — | `204` | Admin |

**CreateSpecies** (`qrPrefix` 제거, `categoryId` 추가 — [v1.1])

```json
{
  "displayName": "Lithops sp. SB1234",
  "scientificName": null,
  "englishName": "Living Stones",
  "koreanName": "리토프스",
  "fieldNumber": "SB1234",
  "sellerName": "한국다육",
  "taxonRank": "SP",
  "isHybrid": false,
  "parentSpecies1Id": null,
  "parentSpecies2Id": null,
  "categoryId": "cuid",
  "family": "Aizoaceae",
  "genus": "Lithops",
  "description": "설명",
  "careGuide": "관리법",
  "defaultWateringCycleDays": 14
}
```

**UpdateSpecies:** CreateSpecies 필드 전체 optional

**SpeciesSummary** (`qrPrefix` → `category` 객체로 변경 — [v1.1])

```json
{
  "id": "cuid",
  "displayName": "Lithops sp. SB1234",
  "scientificName": null,
  "genus": "Lithops",
  "taxonRank": "SP",
  "category": { "id", "code": "LTH", "name": "Lithops 계열" },
  "thumbnailUrl": null,
  "plantCount": 12
}
```

**SpeciesDetail:** Summary + englishName, koreanName, fieldNumber, sellerName, isHybrid, parentSpecies1/2, careGuide, createdAt, updatedAt

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/species/{id}/plants` | GET | 품종별 개체 목록 | — (query: `status`, `page`) | `200` `{ "data": [PlantSummary], "meta" }` | Public |
| `/species/merge` | POST | 품종 병합 | `{ "sourceId", "targetId" }` | `200` `{ "data": { "mergedCount": 5 } }` | Admin |
| `/species/{id}/duplicate-check` | GET | 유사 품종 검색 | — (query: `displayName`) | `200` `{ "data": [SpeciesSummary] }` | Staff |

---

## 5. Plant

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants` | GET | 개체 목록 | — (query: `q`, `speciesId`, `locationId`, `status`, `originType`, `page`) | `200` `{ "data": [PlantSummary], "meta" }` | Staff |
| `/plants/{id}` | GET | 개체 상세 | — | `200` `{ "data": { PlantDetail } }` | Staff |
| `/plants/qr/{qrCode}` | GET | QR 코드로 개체 조회 | — | `200` `{ "data": { PlantDetail } }` | Staff |
| `/plants` | POST | 개체 등록 (QR 자동 발급) | 아래 **CreatePlant** | `201` `{ "data": { PlantDetail } }` | Staff |
| `/plants/{id}` | PUT | 개체 수정 | 아래 **UpdatePlant** | `200` `{ "data": { PlantDetail } }` | Staff |
| `/plants/{id}` | DELETE | 개체 삭제 | — | `204` | Admin |
| `/plants/{id}/status` | PATCH | 상태 변경 | `{ "statusId": "cuid" }` | `200` `{ "data": { PlantDetail } }` | Staff |

**CreatePlant** (`originType` 문자열 → `originTypeId` cuid — [v1.1])

```json
{
  "speciesId": "cuid",
  "nickname": "SB1234-1",
  "locationId": "cuid",
  "statusId": "cuid",
  "originTypeId": "cuid",
  "parentPlantId": null,
  "purchasePrice": 50000,
  "sellingPrice": 80000,
  "purchaseDate": "2026-01-15T00:00:00.000Z",
  "seedDate": null,
  "potSize": "5cm",
  "memo": "메모"
}
```

> `qrCode`는 서버에서 `Species.category.code`(PlantCategory) + `QrSequence`로 자동 생성. (기존: `Species.qrPrefix` 기준 → [v1.1] `Species.category.code` 기준으로 변경)

**UpdatePlant:** CreatePlant 필드 optional + `ownerId`, `soldAt`

**PlantSummary** (`originType` 문자열 → 코드 객체로 변경 — [v1.1])

```json
{
  "id": "cuid",
  "qrCode": "LTH-000042",
  "nickname": "SB1234-1",
  "species": { "id", "displayName", "genus" },
  "location": { "id", "code", "name" },
  "status": { "code": "FOR_SALE", "name": "판매중" },
  "originType": { "code": "PURCHASE", "name": "구매" },
  "sellingPrice": 80000,
  "primaryImageUrl": "https://...",
  "createdAt": "2026-01-15T00:00:00.000Z"
}
```

**PlantDetail:** Summary + purchasePrice, purchaseDate, seedDate, potSize, memo, parentPlant, owner, images[], recentHistories[]

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/for-sale` | GET | 판매중 개체 (쇼핑) | — (query: `speciesId`, `category`, `page`) | `200` `{ "data": [PlantSummary], "meta" }` | Public |
| `/plants/{id}/lineage` | GET | 번식 계보 트리 | — | `200` `{ "data": { "plant", "parent", "children": [] } }` | Staff |
| `/plants/bulk` | POST | 개체 일괄 등록 | `{ "speciesId", "items": [{ "originTypeId", "memo" }] }` | `201` `{ "data": [PlantDetail] }` | Staff |
| `/plants/export` | GET | CSV/Excel 내보내기 | — (query: filters) | `200` file stream | Admin |
| `/plants/my` | GET | 내 소유 개체 | — | `200` `{ "data": [PlantSummary], "meta" }` | User |

---

## 6. Propagation (번식 전용 API) **[v1.1 신규]**

다육식물 특성상 하나의 개체(모株)에서 여러 방식으로 새 개체가 파생된다. 개체 생성 API(`POST /plants`)와 별도로, 아래 4개 API는 **부모-자식 연결, 이력 기록, QR 발급, 기원 유형 설정을 자동으로 처리**한다.

### 공통 동작

모든 번식 API는 성공 시 다음을 트랜잭션으로 함께 처리한다.

1. **부모 Plant 자동 연결** — 신규 Plant의 `parentPlantId` = 요청 경로의 `{id}`
2. **PlantHistory 자동 생성** — `historyType = PROPAGATION`, `metadata.method`에 번식 방식 기록, 부모 Plant 이력에도 1건 추가(`"자식 개체 파생"`)
3. **QR 자동 발급** — 신규 Plant의 `speciesId` 기준 `Species.category.code` + `QrSequence`로 발급
4. **OriginType 자동 설정** — `originTypeId`를 해당 방식의 `ORIGIN_TYPE` 코드로 설정 (요청 바디로 재정의 가능한 것은 `clone`뿐)

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{id}/offset` | POST | 분지로 신규 개체 생성 | `{ "locationId"?, "potSize"?, "memo"? }` | `201` `{ "data": { "plant": PlantDetail, "history": PlantHistory } }` | Staff |
| `/plants/{id}/cutting` | POST | 삽목으로 신규 개체 생성 | `{ "locationId"?, "cutDate"?, "potSize"?, "memo"? }` | `201` `{ "data": { "plant": PlantDetail, "history": PlantHistory } }` | Staff |
| `/plants/{id}/seed` | POST | 실생으로 신규 개체(들) 생성 | `{ "speciesId"?, "seedDate"?, "count"? (기본 1), "locationId"?, "memo"? }` | `201` `{ "data": { "plants": [PlantDetail], "histories": [PlantHistory] } }` | Staff |
| `/plants/{id}/clone` | POST | 개체복제 (범용 duplication) | `{ "originTypeId"? (기본값=부모의 originTypeId), "count"? (기본 1), "locationId"?, "memo"? }` | `201` `{ "data": { "plants": [PlantDetail], "histories": [PlantHistory] } }` | Staff |

**originTypeId 자동 매핑**

| 엔드포인트 | ORIGIN_TYPE 코드 |
|-----------|-------------------|
| `/offset` | `OFFSET` (분지) |
| `/cutting` | `CUTTING` (삽목) |
| `/seed` | `SEEDLING` (실생) |
| `/clone` | 요청의 `originTypeId` 또는 부모의 `originTypeId` 상속 |

**`/seed` 사용 이유:** 다육은 실생 시 여러 개체(트레이 단위)가 동시에 발아하는 경우가 많아 `count`로 일괄 생성을 지원한다. 교배 결과 다른 품종(교배종)이 태어날 수 있어 `speciesId`를 별도로 지정할 수 있다(미지정 시 부모 품종 상속).

**`/clone` 사용 이유:** 분지·삽목·실생 같은 명확한 번식 방식이 아니라 "동일 개체를 여러 화분에 나누어 관리 번호만 새로 부여"하거나 교환/나눔 등으로 개체를 복제 등록할 때 사용하는 범용 API다.

**Response 예시 (`/offset`)**

```json
{
  "data": {
    "plant": {
      "id": "cuid",
      "qrCode": "LTH-000087",
      "speciesId": "cuid",
      "parentPlantId": "cuid(부모 id)",
      "originType": { "code": "OFFSET", "name": "분지" },
      "status": { "code": "IN_STOCK", "name": "재고" }
    },
    "history": {
      "id": "cuid",
      "plantId": "cuid(부모 id)",
      "historyType": { "code": "PROPAGATION", "name": "번식" },
      "description": "분지로 신규 개체(LTH-000087) 생성",
      "metadata": { "method": "OFFSET", "childPlantId": "cuid" }
    }
  }
}
```

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{id}/graft` | POST | 접목으로 신규 개체 생성 | `{ "rootstockSpeciesId"?, "locationId"?, "memo"? }` | `201` `{ "data": { "plant": PlantDetail, "history": PlantHistory } }` | Staff |
| `/plants/propagation-batch` | POST | 여러 부모 개체 일괄 번식 처리 | `{ "items": [{ "plantId", "method", "count" }] }` | `201` `{ "data": [PlantDetail] }` | Staff |

---

## 7. PlantImage

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{plantId}/images` | GET | 개체 이미지 목록 | — (query: `imageType`) | `200` `{ "data": [{ "id", "url", "imageType", "caption", "sortOrder", "isPrimary" }] }` | Staff |
| `/plants/{plantId}/images` | POST | 이미지 등록 | `{ "url", "imageType": "PRIMARY", "caption", "sortOrder", "isPrimary" }` | `201` `{ "data": { PlantImage } }` | Staff |
| `/plants/{plantId}/images/{id}` | PUT | 이미지 수정 | `{ "imageType", "caption", "sortOrder", "isPrimary" }` | `200` `{ "data": { PlantImage } }` | Staff |
| `/plants/{plantId}/images/{id}` | DELETE | 이미지 삭제 | — | `204` | Staff |

**imageType:** `PRIMARY` | `FLOWER` | `SALE` | `OTHER`

> **[v1.1]** 이미지 등록 응답의 `id`는 `PlantHistory` 등록 시 `imageId`로 재사용할 수 있다 (분갈이/개화/판매 이력에 사진 연결). 별도 엔드포인트 추가 없이 기존 API로 충분하다.

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{plantId}/images/upload` | POST | 파일 업로드 | `multipart/form-data` `{ file, imageType, caption }` | `201` `{ "data": { PlantImage } }` | Staff |
| `/plants/{plantId}/images/reorder` | PATCH | 정렬 순서 변경 | `{ "orders": [{ "id", "sortOrder" }] }` | `200` `{ "data": [PlantImage] }` | Staff |
| `/plants/{plantId}/images/{id}/primary` | PATCH | 대표 이미지 지정 | — | `200` `{ "data": { PlantImage } }` | Staff |

---

## 8. PlantHistory

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{plantId}/histories` | GET | 개체 이력 목록 | — (query: `historyType`, `from`, `to`, `page`) | `200` `{ "data": [PlantHistory], "meta" }` | Staff |
| `/plants/{plantId}/histories` | POST | 이력 등록 | 아래 **CreateHistory** | `201` `{ "data": { PlantHistory } }` | Staff |
| `/plants/{plantId}/histories/{id}` | GET | 이력 상세 | — | `200` `{ "data": { PlantHistory } }` | Staff |

**CreateHistory (공통, `imageId` 추가 — [v1.1])**

```json
{
  "historyTypeId": "cuid",
  "performedAt": "2026-07-04T10:00:00.000Z",
  "title": "분갈이",
  "description": "21cm 화분으로 이식",
  "amount": null,
  "fromLocationId": null,
  "toLocationId": null,
  "imageId": null,
  "metadata": { "potSize": "21cm" }
}
```

**유형별 CreateHistory 예시**

| 유형 | code | 추가 필드 |
|------|------|-----------|
| 분갈이 | REPOT | metadata: `{ "potSize", "soilMix" }`, **imageId**(분갈이 사진) |
| 판매 | SALE | amount, metadata: `{ "buyerName", "paymentMethod" }`, **imageId**(판매 사진) |
| 위치변경 | LOCATION_CHANGE | fromLocationId, toLocationId → **서버가 Plant.locationId 동시 갱신** |
| 개화 | FLOWERING | title, metadata: `{ "flowerColor" }`, **imageId**(꽃 사진) |
| 메모 | MEMO | description |
| 물주기 | WATERING | description |
| **번식** [v1.1] | PROPAGATION | metadata: `{ "method", "childPlantId" }` — [6장](#6-propagation-번식-전용-api-v11-신규) API가 자동 생성 |

**PlantHistory Response (`image` 추가 — [v1.1])**

```json
{
  "id": "cuid",
  "plantId": "cuid",
  "historyType": { "code": "REPOT", "name": "분갈이" },
  "performedBy": { "id", "name" },
  "performedAt": "2026-07-04T10:00:00.000Z",
  "title": "분갈이",
  "description": "21cm 화분으로 이식",
  "amount": null,
  "fromLocation": null,
  "toLocation": null,
  "image": { "id": "cuid", "url": "https://...", "imageType": "OTHER" },
  "metadata": { "potSize": "21cm" },
  "createdAt": "2026-07-04T10:00:00.000Z"
}
```

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/plants/{plantId}/histories/{id}` | PUT | 이력 수정 | CreateHistory (partial) | `200` `{ "data": { PlantHistory } }` | Staff |
| `/plants/{plantId}/histories/{id}` | DELETE | 이력 삭제 | — | `204` | Admin |
| `/histories` | GET | 전체 이력 검색 | — (query: `historyType`, `performedById`, `from`, `to`) | `200` `{ "data": [], "meta" }` | Staff |
| `/plants/{plantId}/histories/location-change` | POST | 위치변경 전용 (shortcut) | `{ "toLocationId", "description" }` | `201` `{ "data": { PlantHistory, plant } }` | Staff |
| `/plants/{plantId}/histories/sale` | POST | 판매 처리 (shortcut) | `{ "amount", "buyerUserId", "metadata" }` | `201` `{ "data": { PlantHistory, plant } }` | Staff |

---

## 9. PlantLocation

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/locations` | GET | 위치 목록 (플랫) | — (query: `parentId`, `typeId`, `isActive`) | `200` `{ "data": [PlantLocation] }` | Staff |
| `/locations/tree` | GET | 위치 트리 | — | `200` `{ "data": [{ "id", "code", "name", "children": [] }] }` | Staff |
| `/locations/{id}` | GET | 위치 상세 | — | `200` `{ "data": { PlantLocationDetail } }` | Staff |
| `/locations` | POST | 위치 등록 | `{ "code", "name", "description", "typeId", "parentId", "sortOrder" }` | `201` `{ "data": { PlantLocation } }` | Admin |
| `/locations/{id}` | PUT | 위치 수정 | `{ "name", "description", "typeId", "parentId", "imagePath", "posX", "posY", "sortOrder", "isActive" }` | `200` `{ "data": { PlantLocation } }` | Admin |
| `/locations/{id}` | DELETE | 위치 비활성화 | — | `204` | Admin |
| `/locations/{id}/plants` | GET | 위치별 개체 | — (query: `page`) | `200` `{ "data": [PlantSummary], "meta" }` | Staff |

**PlantLocationDetail**

```json
{
  "id": "cuid",
  "code": "GH-A-Z1-S3",
  "name": "3번 선반",
  "description": null,
  "type": { "code": "SHELF", "name": "선반" },
  "parent": { "id", "code", "name" },
  "imagePath": "/uploads/maps/greenhouse-a.png",
  "posX": 0.25,
  "posY": 0.35,
  "plantCount": 8,
  "children": []
}
```

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/locations/map` | GET | 지도용 위치+개체 핀 | — (query: `rootLocationId`) | `200` `{ "data": { "imagePath", "locations": [{ "id", "posX", "posY", "plants": [] }] } }` | Staff |
| `/locations/{id}/image` | POST | 배치도 이미지 업로드 | `multipart/form-data` `{ file }` | `200` `{ "data": { "imagePath" } }` | Admin |
| `/locations/{id}/move` | PATCH | 계층 이동 | `{ "parentId" }` | `200` `{ "data": { PlantLocation } }` | Admin |

---

## 10. Cart

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/cart` | GET | 내 장바구니 | — | `200` `{ "data": [{ "id", "plant": PlantSummary, "quantity", "createdAt" }], "meta": { "totalAmount": 150000 } }` | User |
| `/cart` | POST | 장바구니 담기 | `{ "plantId": "cuid" }` | `201` `{ "data": { CartItem } }` | User |
| `/cart/{id}` | DELETE | 항목 삭제 | — | `204` | User |
| `/cart` | DELETE | 장바구니 비우기 | — | `204` | User |

**비즈니스 규칙 (MVP)**

- `Plant.status` = `FOR_SALE` 인 개체만 담기 가능
- 동일 plantId 중복 불가 (`409 CONFLICT`)
- 담기 시 Plant.status → `RESERVED` (확장: 별도 예약 TTL)

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/cart/validate` | POST | 담기 전 유효성 | `{ "plantId" }` | `200` `{ "data": { "available": true, "reason": null } }` | User |
| `/cart/{id}` | PATCH | 수량 변경 | `{ "quantity" }` | `200` `{ "data": { CartItem } }` | User |

> **[v1.1]** 결제 기능은 구현하지 않으므로 기존 `POST /cart/checkout`은 명세에서 제외한다. 장바구니는 [Inquiry(문의)](#14-inquiry-신규)로 이어진다.

---

## 11. QR

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/qr/scan/{qrCode}` | GET | QR 스캔 → 개체 조회 | — | `200` `{ "data": { PlantDetail } }` | Staff |
| `/qr/prefixes` | GET | QR 접두사(PlantCategory) 목록 | — | `200` `{ "data": [{ "code": "LTH", "lastNumber": 42, "name": "Lithops 계열" }] }` | Staff |
| `/qr/generate` | POST | QR 번호 발급 | `{ "speciesId": "cuid" }` | `200` `{ "data": { "qrCode": "LTH-000043", "prefix": "LTH", "sequence": 43 } }` | Staff |
| `/qr/label/{plantId}` | GET | **[v1.1 신규]** 라벨 프린터 출력용 데이터 | — | `200` 아래 **QrLabel** | Staff |

**QR generate 동작 (`Species.category.code` 기준 — [v1.1])**

1. `Species.categoryId` → `PlantCategory.code` 조회 (null → `OTH`)
2. `QrSequence` 트랜잭션 증가
3. `preview=true` query 시 DB 저장 없이 다음 번호만 반환 (확장)

**QrLabel (`GET /qr/label/{plantId}`) — Brother 라벨 프린터 대응**

```json
{
  "data": {
    "qrCode": "LTH-000042",
    "qrImageBase64": "data:image/png;base64,iVBORw0KGgo...",
    "plantName": "Lithops sp. SB1234",
    "nickname": "SB1234-1",
    "managementNumber": "LTH-000042",
    "category": { "code": "LTH", "name": "Lithops 계열" },
    "label": {
      "widthMm": 29,
      "heightMm": 90,
      "printer": "BROTHER_QL",
      "fields": [
        { "type": "qr", "value": "LTH-000042" },
        { "type": "text", "value": "Lithops sp. SB1234", "style": "bold" },
        { "type": "text", "value": "SB1234-1", "style": "normal" }
      ]
    }
  }
}
```

> `qr/label`은 프린터 SDK가 바로 사용할 수 있는 **구조화된 JSON**을 반환한다. 여러 장을 한 번에 인쇄하는 PDF 출력은 아래 확장 `qr/print`를 사용한다.

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/qr/print/{plantId}` | GET | QR 라벨 PDF (다건 인쇄용) | — (query: `format=a4`) | `200` application/pdf | Staff |
| `/qr/label/batch` | POST | 라벨 데이터 일괄 조회 | `{ "plantIds": ["cuid"] }` | `200` `{ "data": [QrLabel] }` | Staff |
| `/qr/batch-generate` | POST | 일괄 QR 발급 | `{ "speciesId", "count": 10 }` | `201` `{ "data": [{ "qrCode" }] }` | Staff |

---

## 12. Public **[v1.1 신규]**

QR을 스캔한 **비로그인 일반 사용자**를 위한 공개 조회 API. 관리자 전용 정보는 절대 반환하지 않는다.

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/public/plants/{qrCode}` | GET | QR 스캔 → 공개 정보 조회 | — | `200` 아래 **PublicPlant** | Public |

**PublicPlant Response**

```json
{
  "data": {
    "qrCode": "LTH-000042",
    "nickname": "SB1234-1",
    "species": {
      "displayName": "Lithops sp. SB1234",
      "scientificName": null,
      "koreanName": "리토프스",
      "englishName": "Living Stones"
    },
    "sellingPrice": 80000,
    "status": { "code": "FOR_SALE", "name": "판매중" },
    "location": { "name": "온실 A" },
    "images": [
      { "url": "https://.../primary.jpg", "imageType": "PRIMARY" },
      { "url": "https://.../flower.jpg", "imageType": "FLOWER" }
    ]
  }
}
```

**절대 반환하지 않는 관리자 전용 필드**

| 필드 | 사유 |
|------|------|
| `purchasePrice` | 구매가(내부 원가) |
| `memo` | 관리자 메모 |
| `ownerId` / `owner` | 소유자 개인정보 |
| `parentPlantId` / 번식 계보 | 내부 관리 정보 |
| `plant_locations.code` / `posX` / `posY` / 상위 계층 상세 | 정확한 물리적 위치(보안) — **위치는 이름만 선택적으로 노출** |
| `PlantHistory` 전체 | 내부 작업 이력 |
| `performedBy`, `amount` 등 이력 관련 정보 | 내부 관리 정보 |

**동작 규칙**

- QR이 존재하지 않거나 `Plant.status = DISCARDED`(폐기) 인 경우 `404 NOT_FOUND` 반환 (내부 상태 노출 방지)
- `location`은 노출 여부를 상위 설정으로 제어할 수 있도록 설계 확장 여지를 둔다(확장: `PlantLocation.isPublicVisible` 같은 플래그 도입 검토)

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/public/species/{id}` | GET | 품종 공개 정보 (관리 가이드 등) | — | `200` `{ "data": { "displayName", "koreanName", "careGuide" } }` | Public |
| `/public/plants/{qrCode}/inquiry` | POST | QR 상세 화면에서 바로 문의 | `{ "name", "phone", "content" }` | `201` `{ "data": { Inquiry } }` | Public |

---

## 13. Import **[v1.1 신규]**

기존 엑셀 재고 데이터를 시스템으로 이관한다.

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/import/excel` | POST | 엑셀 업로드 → Species/Plant 자동 생성 | `multipart/form-data` `{ file, categoryId?, dryRun? }` | `201` 아래 **ImportReport** | Admin |

**동작**

1. 엑셀 업로드 파싱 (행 단위)
2. `displayName` + `fieldNumber` 조합으로 기존 `Species` 매칭, 없으면 **자동 생성**
3. 행마다 `Plant` **자동 생성** (QR 자동 발급, `categoryId` 미지정 행은 요청의 기본 `categoryId` 또는 `OTH` 적용)
4. **중복 체크**: 이미 존재하는 `qrCode` 열이 있으면 skip, 신규 행은 `fieldNumber + displayName + purchaseDate` 조합으로 중복 후보 판정
5. 결과 리포트 반환 (성공/실패/중복 건수 및 행별 상세)

**ImportReport Response**

```json
{
  "data": {
    "totalRows": 120,
    "successCount": 110,
    "duplicateCount": 5,
    "failCount": 5,
    "createdSpeciesCount": 18,
    "createdPlantCount": 110,
    "results": [
      { "row": 2, "status": "SUCCESS", "plantId": "cuid", "qrCode": "LTH-000042" },
      { "row": 3, "status": "DUPLICATE", "reason": "동일 fieldNumber+구매일 데이터 존재", "existingPlantId": "cuid" },
      { "row": 7, "status": "FAILED", "reason": "필수 항목 누락 (displayName)" }
    ]
  }
}
```

`dryRun: true` 요청 시 실제 저장 없이 위와 동일한 리포트만 미리보기로 반환한다.

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/import/excel/template` | GET | 엑셀 업로드 템플릿 다운로드 | — | `200` file (xlsx) | Admin |
| `/import/jobs/{jobId}` | GET | 대용량 비동기 처리 상태 조회 | — | `200` `{ "data": { "status": "PROCESSING", "progress": 0.6 } }` | Admin |

---

## 14. Dashboard **[v1.1 신규]**

관리자 첫 화면용 요약 통계.

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/dashboard` | GET | 대시보드 요약 조회 | — (query: `recentLimit` 기본 5) | `200` 아래 **DashboardSummary** | Staff |

**DashboardSummary Response**

```json
{
  "data": {
    "totalPlants": 1230,
    "totalSpecies": 340,
    "statusCounts": {
      "FOR_SALE": 210,
      "RESERVED": 15,
      "SOLD": 640,
      "IN_STOCK": 360,
      "DISCARDED": 5
    },
    "totalLocations": 42,
    "todayRegisteredCount": 8,
    "recentRepots": [
      { "plantId": "cuid", "qrCode": "LTH-000042", "plantName": "Lithops sp. SB1234", "performedAt": "2026-07-04T09:00:00.000Z" }
    ],
    "recentSales": [
      { "plantId": "cuid", "qrCode": "CAT-000011", "plantName": "황금기린", "amount": 30000, "performedAt": "2026-07-03T15:00:00.000Z" }
    ],
    "recentImages": [
      { "plantId": "cuid", "qrCode": "CON-000005", "imageUrl": "https://...", "imageType": "FLOWER", "createdAt": "2026-07-04T08:00:00.000Z" }
    ]
  }
}
```

| 필드 | 설명 |
|------|------|
| `totalPlants` | 총 식물(개체) 수 |
| `totalSpecies` | 품종 수 |
| `statusCounts.FOR_SALE` | 판매중 |
| `statusCounts.RESERVED` | 예약중 |
| `statusCounts.SOLD` | 판매완료 |
| `totalLocations` | 위치 수 |
| `todayRegisteredCount` | 오늘 등록 개체 수 |
| `recentRepots` | 최근 분갈이 이력 (`historyType=REPOT`) |
| `recentSales` | 최근 판매 이력 (`historyType=SALE`) |
| `recentImages` | 최근 사진등록 |

### 확장

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/dashboard/trends` | GET | 기간별 등록/판매 추이 | — (query: `from`, `to`, `interval`) | `200` `{ "data": [{ "date", "registered", "sold" }] }` | Staff |
| `/dashboard/species-ranking` | GET | 인기 품종 랭킹 | — (query: `by=views\|sales`) | `200` `{ "data": [{ "speciesId", "displayName", "count" }] }` | Staff |

---

## 15. Inquiry (문의) **[v1.1 신규]**

결제 기능은 구현하지 않고, 장바구니에 담긴 식물을 기준으로 **문의하기**만 제공한다. 문자/카카오톡/이메일 등으로 확장 가능한 구조로 설계한다.

> **DB 참고:** 이번 개정은 `schema.prisma`에 Inquiry 테이블을 추가하지 않는다([DB 명세서 7장](./db-specification.md#7-향후-확장-스키마-미반영-설계안) 참고). 아래 API는 향후 `Inquiry`/`InquiryItem`/`InquiryNotification` 테이블 도입을 전제로 한 설계이며, 실제 구현 시점에 별도 마이그레이션이 필요하다.

### MVP

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/inquiries` | POST | 문의 등록 (현재 로그인 사용자의 장바구니를 스냅샷) | `{ "name": "홍길동", "phone": "010-1234-5678", "content": "실물 상태가 궁금해요" }` | `201` 아래 **Inquiry** | User |
| `/inquiries/my` | GET | 내 문의 내역 | — (query: `page`) | `200` `{ "data": [InquirySummary], "meta" }` | User |
| `/inquiries` | GET | 전체 문의 목록 (관리자) | — (query: `status`, `q`, `page`) | `200` `{ "data": [InquirySummary], "meta" }` | Staff |
| `/inquiries/{id}` | GET | 문의 상세 | — | `200` `{ "data": { InquiryDetail } }` | Staff |

**Inquiry 등록 동작**

1. 요청 사용자의 `Cart` 조회
2. 각 항목을 `{ plantId, qrCode, displayName, sellingPrice }` 스냅샷으로 저장 (이후 가격/상태 변경과 무관하게 문의 시점 값 보존)
3. `totalAmount` = 스냅샷 `sellingPrice` 합계
4. 상태 `NEW`로 생성

**Inquiry Response**

```json
{
  "data": {
    "id": "cuid",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "content": "이 아이들 실물 상태가 궁금해요.",
    "plants": [
      { "plantId": "cuid", "qrCode": "LTH-000042", "displayName": "Lithops sp. SB1234", "sellingPrice": 80000 },
      { "plantId": "cuid", "qrCode": "CAT-000011", "displayName": "황금기린", "sellingPrice": 30000 }
    ],
    "totalAmount": 110000,
    "status": "NEW",
    "createdAt": "2026-07-04T12:00:00.000Z"
  }
}
```

**InquirySummary:** id, name, phone, totalAmount, status, plantCount, createdAt
**InquiryDetail:** InquirySummary + plants[], content, notifications[](확장)

### 확장 — 알림 채널 (문자 / 카카오톡 / 이메일)

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/inquiries/{id}/status` | PATCH | 상태 변경 (`NEW`/`IN_PROGRESS`/`DONE`) | `{ "statusId" }` | `200` `{ "data": { Inquiry } }` | Staff |
| `/inquiries/{id}/notify` | POST | 알림 발송 | `{ "channel": "SMS" \| "KAKAO" \| "EMAIL" }` | `201` `{ "data": { "notificationId", "channel", "status": "SENT" } }` | Staff |
| `/inquiries/{id}/notifications` | GET | 발송 이력 조회 | — | `200` `{ "data": [{ "channel", "status", "sentAt" }] }` | Staff |

**확장성 설계:** `channel`은 `CommonCode`(groupCode=`INQUIRY_CHANNEL`: `SMS`, `KAKAO`, `EMAIL`)로 관리하여 새 채널을 코드 추가만으로 지원한다. 실제 발송은 채널별 어댑터(문자 API, 카카오 알림톡 API, 이메일 SMTP)를 뒤에 두는 구조로 설계해 채널 확장 시 API 계약을 바꾸지 않는다.

---

## 16. Health (시스템)

| URL | Method | 설명 | Request Body | Response | 권한 |
|-----|--------|------|--------------|----------|------|
| `/health` | GET | 서버 상태 | — | `200` `{ "status": "ok", "timestamp": "..." }` | Public |

---

## 17. MVP API 요약

| Tag | MVP 엔드포인트 수 | 핵심 |
|-----|-------------------|------|
| Auth | 4 | register, login, me, logout |
| CommonCode | 2 | 목록, 그룹별 조회 |
| PlantCategory | 5 | **[v1.1]** CRUD + 목록/상세 (확장→MVP 승격) |
| Species | 5 | CRUD + 목록/상세 (검색조건 확대) |
| Plant | 7 | CRUD, QR조회, 상태변경 |
| Propagation | 4 | **[v1.1]** offset, cutting, seed, clone |
| PlantImage | 4 | CRUD (URL 기반, imageId로 이력 연결 가능) |
| PlantHistory | 3 | 목록, 등록(imageId 지원), 상세 |
| PlantLocation | 7 | CRUD, 트리, 위치별 개체 |
| Cart | 4 | 조회, 담기, 삭제, 비우기 |
| QR | 4 | 스캔, 접두사, 발급, **라벨[v1.1]** |
| Public | 1 | **[v1.1]** QR 공개 조회 |
| Import | 1 | **[v1.1]** 엑셀 Import |
| Dashboard | 1 | **[v1.1]** 요약 통계 |
| Inquiry | 4 | **[v1.1]** 등록, 내 문의, 목록, 상세 |

**MVP 합계: 56 endpoints** (v1.0: 39 → v1.1: 56, +17)

---

## 18. 확장 API 요약

| Tag | 확장 | 비고 |
|-----|------|------|
| Auth | refresh, password, 사용자 관리 | |
| CommonCode | CRUD | Admin |
| PlantCategory | 카테고리별 품종 목록 | |
| Species | plants, merge, duplicate-check | |
| Plant | for-sale, lineage, bulk, export, my | `propagate`는 Propagation 태그로 이관 |
| Propagation | graft, propagation-batch | |
| PlantImage | upload, reorder, primary | 파일 스토리지 |
| PlantHistory | 수정/삭제, 전역검색, shortcut API | |
| PlantLocation | map, image upload, move | 지도 UI |
| Cart | validate, 수량변경 | 결제 없음(checkout 제외) |
| QR | print(PDF), label/batch, prefix 관리, batch-generate | |
| Public | species 공개조회, QR 상세에서 바로 문의 | |
| Import | 템플릿 다운로드, 비동기 job 조회 | |
| Dashboard | 추이, 품종 랭킹 | |
| Inquiry | 상태변경, 알림발송(SMS/카카오/이메일), 발송이력 | |

---

## 19. 버전 정책

| 버전 | URL | 상태 |
|------|-----|------|
| v1 | `/api/v1/*` | MVP (v1.0 → v1.1 소폭 개선, 동일 메이저 버전 유지) |
| v2 | `/api/v2/*` | Inquiry 정식 테이블 도입, 결제/주문 기능 도입 시 |

Breaking change 시 v1 유지 + deprecation 헤더 `Sunset` 적용.

> **[v1.1]** `originType`이 문자열 Enum에서 `originTypeId`(CommonCode 참조)로, `qrPrefix`가 `categoryId`(PlantCategory 참조)로 바뀐 것은 **Breaking Change**이지만, 아직 API가 구현되지 않은 설계 단계이므로 별도 버전 분리 없이 v1 내에서 갱신한다.
