# Ask Plant - 식물 관리 시스템

Vue 3, TypeScript, Express, Prisma, PostgreSQL 기반의 식물 관리 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router |
| Backend | Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |

## 프로젝트 구조

```
ask-plant/
├── client/          # Vue 3 프론트엔드
├── server/          # Express 백엔드
└── package.json     # 모노레포 루트
```

## 시작하기

### 사전 요구사항

- Node.js 20+
- PostgreSQL 15+

### 설치

```bash
npm install
```

### 환경 변수 설정

```bash
# server/.env.example 을 참고하여 server/.env 파일 생성
cp server/.env.example server/.env
```

### 데이터베이스 설정

```bash
npm run db:generate
npm run db:migrate
```

### 개발 서버 실행

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 클라이언트 + 서버 동시 실행 |
| `npm run dev:client` | 프론트엔드만 실행 |
| `npm run dev:server` | 백엔드만 실행 |
| `npm run build` | 전체 빌드 |
| `npm run db:studio` | Prisma Studio 실행 |
