# Project State

- **Project:** KSL Learning Platform
- **Current phase:** Phase 1 - Core Learning Loop (MVP)
- **Status:** Phase 1 complete
- **Last updated:** 2026-04-21
- **Focus:** Phase 1 fully closed; prepare Phase 2 AI practice plan

## Completed

- Set up session handoff rules in `.github/copilot-instructions.md` to use `docs/*` files.
- Initialized monorepo foundation (`apps/web`, `backend`, `packages/shared`) with Turborepo.
- Added Next.js web scaffold and shared package contracts (types, Zod pagination schema, thresholds).
- Added FastAPI backend scaffold with route modules, core config/security/deps, and admin guard dependency.
- Added SQLAlchemy model layer and initial Alembic migration scaffold for Phase 1 schema.
- Wired initial DB-backed auth flow (`register`, `login`, `refresh`) and stats/progress read endpoints.
- Wired initial DB-backed content reads for units, sections, chapters, lessons, and drills.
- Wired lesson/drill/quiz submission flows to append `UserProgress` rows and update `UserStats` XP/streak.
- Added Phase 1 seed workflow for Unit 1 and Section A.
- Added learner/admin route scaffolds for dashboard, auth, quiz, dictionary, practice, and moderation screens.
- Added track-selection/dashboard entry UI and learner/admin page scaffolds in Next.js.
- Set up a local backend Python virtual environment and installed the backend runtime/dev dependencies.
- Updated backend datetime handling to stay compatible with the available local Python runtime.
- Added VS Code/Pylance workspace settings so the backend interpreter points at `backend/.venv`.
- Verified the web app by running its TypeScript check and production build successfully.
- Integrated more of Phase 1 end-to-end by wiring auth forms, token-based web API calls, and learner flow pages (unit/section detail, lesson/drill exercise views, and chapter/section quiz submission UIs).
- Expanded backend Phase 1 content endpoints to return structured chapter/lesson/drill/exercise payloads needed by the web learner pages.
- Added reusable test-account seeding (`backend/scripts/seed_test_accounts.py`) and seeded both learner/admin test users in the local database.
- Pinned backend `bcrypt` to a passlib-compatible version to keep password hashing stable for login/register and account seeding.
- Added backend CORS middleware with configurable allowed origins so web login requests from `http://localhost:3000` can reach FastAPI in development.
- Replaced scaffolded Google auth route with a working `POST /auth/google` ID-token flow that validates Google JWT claims and issues local JWT tokens.
- Upgraded lesson/drill pages from static scaffolds to interactive exercise players with intro, per-exercise feedback, completion scoring, and progress submission.
- Wired quiz result navigation pages so chapter/section submissions flow into dedicated result screens.
- Added a real Google Sign-In web client flow using Google Identity Services on the login page, posting ID tokens to backend `/auth/google`.
- Implemented persistent active-track selection (`sign-language` / `finger-spelling`) on dashboard using query param + local storage, and wired home track cards to deep-link into the selected track.

## In Progress

- None.

## Next Steps

1. Plan Phase 2 AI practice and contribution workflows.
2. Expand automated tests for lesson/drill and quiz flows.

## Blockers

- None.
