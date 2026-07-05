# Ask Plant 문서

다육식물 컬렉션 관리 시스템 **Ask Plant** 설계 문서입니다.

| 문서 | 설명 |
|------|------|
| [프로젝트 현재 상태](./STATUS.md) | 지금 실제로 구현/동작하는 범위 스냅샷 (구현 기능, 서버/DB/프론트 구조, 미완료 항목, 다음 단계) |
| [DB 명세서](./db-specification.md) | 테이블, Enum, CommonCode, 관계, ERD, QR 규칙 (v1.1) |
| [API 명세서](./api-specification.md) | REST API — Swagger(OpenAPI) 스타일, MVP / 향후 확장 구분 (v1.1) |
| [CHANGELOG](./CHANGELOG.md) | 작업 완료 시마다 기록되는 변경 이력 |

> 기준: `server/prisma/schema.prisma` (Prisma 6.x / PostgreSQL)
>
> **v1.1 개정 요약:** PlantCategory 추가, OriginType의 CommonCode 전환, PlantHistory-PlantImage 연결, Public/Import/Dashboard/Inquiry/Propagation API 추가. 각 문서의 "변경 이력" 절 참고.
