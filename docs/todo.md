# Todo

## Done

- [x] Define cross-session handoff workflow in `.github/copilot-instructions.md`
- [x] Initialize monorepo structure (`apps/web`, `backend`, `packages/shared`)
- [x] Scaffold backend core modules, routers, and security dependencies
- [x] Add initial SQLAlchemy models and Alembic migration scaffold
- [x] Create shared package contracts (`types`, `schemas`, `constants`)
- [x] Add learner/admin route scaffolds for dashboard, auth, quiz, dictionary, practice, and moderation screens
- [x] Implement FastAPI auth and JWT flow with DB persistence
- [x] Replace placeholder sign/spelling endpoints with DB-backed services
- [x] Finalize progress + unlock logic (append-only progress, quiz pass rules, streak updates)
- [x] Seed Sign Language Unit 1 and Finger Spelling Section A
- [x] Build track selection and dashboard data APIs
- [x] Finalize learner/admin web screen wiring
- [x] Validate Phase 1 seed workflow for Sign Language Unit 1 and Finger Spelling Section A
- [x] Finalize quality gates + docs handoff
- [x] Set up local backend Python virtual environment and install backend dependencies
- [x] Add workspace Python settings for backend venv resolution
- [x] Verify web app typecheck and production build
- [x] Wire login/register forms to backend auth and persist tokens in web client
- [x] Expand unit/lesson/section/drill backend endpoints with structured content payloads
- [x] Implement learner flow page wiring for unit/section detail, lesson/drill exercise display, and quiz submit flows
- [x] Add backend script to seed deterministic learner/admin test accounts
- [x] Seed local learner/admin test accounts and verify role/password login compatibility
- [x] Enable backend CORS for local web origin (`localhost:3000`) to unblock auth requests
- [x] Replace scaffolded `/auth/google` with token-validation + JWT issuance flow
- [x] Convert lesson/drill pages into interactive Phase 1 exercise players
- [x] Route quiz submissions to dedicated chapter/section result pages
- [x] Add Google Identity Services login button flow in web UI and exchange ID token via `/auth/google`
- [x] Persist active learning track selection in dashboard and deep-link home track cards into selected track
- [x] Enforce Material Design (MUI) as the default web UI system and document no-shadcn convention in project instructions
- [x] Document Finger Spelling dataset as image-based for AI training and data pipeline decisions
- [x] Split out finger-spelling dataset image storage and update contribution payloads
- [x] Split out sign-language dataset video storage
- [x] Write a complete root README covering setup, version requirements, run steps, and troubleshooting
- [x] Create Finger Spelling ownership checklist and contributor guide documentation under `docs/`

## Next

- [ ] Implement baseline scoring logic in `backend/app/services/ai/spelling_evaluator.py`
- [ ] Build `apps/web/app/(learner)/practice/spelling/page.tsx` into full evaluate + feedback flow
- [ ] Compute real `progress_percent` values in `GET /spelling/sections`
- [ ] Add backend tests for spelling evaluator and quiz/drill endpoints
- [ ] Harden spelling quiz payload normalization and options parsing
- [ ] Expand Finger Spelling UI polish (sections, drills, quizzes, practice) with Khmer-first i18n
- [ ] Add contribution prompt + consent gate in spelling practice UI (>= 85 score)
