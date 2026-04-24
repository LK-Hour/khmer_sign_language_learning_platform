# KSL Learning Platform

Khmer Sign Language learning platform with two tracks:

- Sign Language
- Finger Spelling

This is a monorepo containing:

- Web app: Next.js + TypeScript
- Backend API: FastAPI + SQLAlchemy + Alembic
- Shared package: Types, schemas, constants

## Tech Summary

- Web: Next.js 14, React 18, TypeScript
- UI System: Material Design
- Backend: FastAPI, SQLAlchemy (async), Alembic
- Database: PostgreSQL
- Monorepo tooling: npm workspaces + Turborepo (shared packages, faster task orchestration, and consistent builds across app/web)

## Version Requirements

- Node.js: 20+
- npm: 11.12.1 (project package manager lock)
- Python: 3.12+ (backend requires-python >= 3.12)
- PostgreSQL: 14+ (local default config uses localhost:5433)

## Repository Structure

- apps/web: Next.js learner/admin frontend
- backend: FastAPI backend
- packages/shared: shared types and constants

## Environment Setup

Create these files before running:

1. apps/web/.env.local

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

2. backend/.env

APP_ENV=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/ksl
MEDIA_BASE_URL=https://cdn.example.com
JWT_SECRET_KEY=change-this-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_DAYS=7
GOOGLE_CLIENT_ID=
CORS_ALLOW_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

Notes:

- Use the same Google client ID in NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID.
- Replace JWT_SECRET_KEY with a secure value in real environments.

## Install Dependencies

From repository root:

- npm install

Backend virtual environment and Python packages:

- cd backend
- python3 -m venv .venv
- source .venv/bin/activate
- pip install -e .

## Database Setup

1. Ensure PostgreSQL is running on localhost:5433.
2. Create database ksl(khmer sign language) if needed.
3. Run migrations.
4. Seed phase 1 content and test users.

Commands (from backend):

- source .venv/bin/activate
- alembic upgrade head
- python -m scripts.seed_phase1
- python -m scripts.seed_test_accounts

Default seeded test accounts:

- Learner: learner@test.ksl
- Admin: admin@test.ksl
- Password: Test@123456

## Run the Project

Open two terminals.

Terminal A: backend

- cd backend
- source .venv/bin/activate
- uvicorn main:app --reload --host 0.0.0.0 --port 8000

Terminal B: web

- cd apps/web
- npm run dev

App URLs:

- Web: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Useful Commands

From repo root:

- npm run dev
- npm run build
- npm run typecheck
- npm run lint
- npm run test

From apps/web:

- npm run dev
- npm run build
- npm run typecheck

From backend:

- alembic upgrade head
- alembic downgrade -1
- python -m scripts.seed_phase1
- python -m scripts.seed_test_accounts

## Project Conventions

- Web UI should follow Material Design (MUI-first).
- Do not introduce shadcn/ui unless explicitly requested.
- Sign Language and Finger Spelling AI pipelines are separate.
- Finger Spelling model training data is image-based (labeled hand-shape images), not video-first.
