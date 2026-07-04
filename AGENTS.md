# Ask Plant AI Development Guide

## 프로젝트 개요

Ask Plant는 다육식물 컬렉션 관리 및 판매 보조를 위한 모바일 웹(PWA) 프로젝트이다.

목표는 단순한 쇼핑몰이 아니라,

- 식물 관리
- QR 관리
- 품종 관리
- 위치 관리
- 판매 관리
- 컬렉션 관리

를 하나의 시스템에서 수행하는 것이다.

---

# 기술스택

Frontend

- Vue3
- TypeScript
- Vite
- Pinia
- Vue Router

Backend

- Node.js
- Express
- TypeScript

Database

- PostgreSQL
- Prisma

---

# 개발 원칙

- Mobile First
- PWA 지원
- Responsive 지원
- REST API
- Repository Pattern
- Controller → Service → Repository 구조
- TypeScript strict mode
- any 사용 금지

---

# UI 원칙

모바일 사용이 가장 많다.

PC는 보조 환경이다.

모든 화면은 모바일 기준으로 먼저 제작한다.

---

# API 원칙

관리자 API

/api/v1/...

Public API

/api/v1/public/...

QR 스캔은 로그인 없이 접근 가능해야 한다.

---

# 권한

ADMIN

STAFF

CUSTOMER

PUBLIC

---

# 금지사항

AI는

- 기존 구조를 임의 변경하지 않는다.
- 파일명을 임의 변경하지 않는다.
- 대규모 리팩토링을 하지 않는다.
- 사용자의 승인 없이 DB를 변경하지 않는다.
- 사용자의 승인 없이 API를 변경하지 않는다.

---

# 작업 방식

항상

1. 변경 이유

2. 변경 파일

3. 영향 범위

를 설명한 후 작업한다.

사용자가 승인하면 구현을 진행한다.