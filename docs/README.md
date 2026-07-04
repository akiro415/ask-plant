# Ask Plant 문서

다육식물 컬렉션 관리 시스템 **Ask Plant** 설계 문서입니다.

| 문서 | 설명 |
|------|------|
| [DB 명세서](./db-specification.md) | 테이블, Enum, CommonCode, 관계, ERD, QR 규칙 (v1.1) |
| [API 명세서](./api-specification.md) | REST API — Swagger(OpenAPI) 스타일, MVP / 향후 확장 구분 (v1.1) |

> 기준: `server/prisma/schema.prisma` (Prisma 6.x / PostgreSQL)
>
> **v1.1 개정 요약:** PlantCategory 추가, OriginType의 CommonCode 전환, PlantHistory-PlantImage 연결, Public/Import/Dashboard/Inquiry/Propagation API 추가. 각 문서의 "변경 이력" 절 참고.
