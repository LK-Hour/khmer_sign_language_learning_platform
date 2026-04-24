# Decisions

## 2026-04-21

1. **Area:** Architecture  
   **Decision:** Web fetches data via FastAPI endpoints; no direct DB access from frontend.  
   **Reason:** Keeps auth, business rules, and response shaping centralized.

2. **Area:** Content delivery  
   **Decision:** Lesson, exercise, and quiz UIs are API-driven and DB-backed for dynamic updates.  
   **Reason:** New signs/videos/questions should appear without frontend code changes.

3. **Area:** AI pipeline  
   **Decision:** Sign Language and Finger Spelling evaluators remain strictly separate.  
   **Reason:** Different landmark inputs, scoring logic, and model behaviors.

4. **Area:** Session continuity  
   **Decision:** Use `docs/project-state.md`, `docs/decisions.md`, and `docs/todo.md` as single-source handoff files.  
   **Reason:** Human-readable collaboration across multiple Copilot sessions.

5. **Area:** Repository architecture  
   **Decision:** Start with npm workspaces + Turborepo for web/shared packages, and keep Python backend as a sibling app.  
   **Reason:** Enables shared TS contracts while preserving FastAPI-native backend workflows.

6. **Area:** Data integrity  
   **Decision:** Use enum-backed track/status fields and an initial Alembic migration scaffold from day one.  
   **Reason:** Prevents drift in constrained values and keeps schema evolution explicit.

7. **Area:** Web auth integration  
   **Decision:** Persist JWT tokens in browser local storage for the current Phase 1 learner flow so dashboard, progress, and completion endpoints can be called with Bearer auth from client components.  
   **Reason:** The current web scaffolding is client-rendered and needs a lightweight, immediate bridge to authenticated API calls until a fuller auth/session layer is introduced.

8. **Area:** Test account provisioning  
   **Decision:** Add an idempotent backend script (`scripts/seed_test_accounts.py`) that upserts one learner and one admin account with deterministic defaults, and ensure both get `UserStats` rows.  
   **Reason:** Provides a repeatable local QA setup for both role paths without manual DB edits.

9. **Area:** Auth dependency compatibility  
   **Decision:** Pin `bcrypt==4.0.1` alongside `passlib[bcrypt]==1.7.4` in backend dependencies.  
   **Reason:** Newer bcrypt versions break passlib backend checks in this stack, which blocks password hashing for register/login and test-account seeding.

10. **Area:** Local web-backend integration  
    **Decision:** Enable FastAPI CORS middleware with configurable origins and include localhost web dev origins by default.  
    **Reason:** Browser preflight requests from the Next.js dev server must be accepted for login/register API calls.

11. **Area:** Google authentication (Phase 1 backend)  
    **Decision:** Implement `POST /auth/google` as an ID-token intake endpoint that validates Google JWT claims against Google JWKs, then upserts learner users and issues local JWT tokens.  
    **Reason:** Delivers a backend-complete Google OAuth path for Phase 1 while keeping the web client implementation flexible (GIS button flow can be added next).

12. **Area:** Google authentication (Phase 1 web client)  
   **Decision:** Use Google Identity Services (GIS) button flow on the web login page and send returned credential ID tokens to backend `/auth/google` for local JWT issuance.  
   **Reason:** Keeps Google verification centralized in FastAPI while enabling a production-style one-click login UX on web.

13. **Area:** Track selection persistence  
   **Decision:** Store active learner track in browser local storage (`ksl_active_track`) and mirror it in dashboard query params (`?track=sign-language|finger-spelling`).  
   **Reason:** Provides explicit, user-controlled track switching with stable navigation state across refreshes and direct links.

14. **Area:** Web UI design system  
   **Decision:** Standardize web UI implementation on Material Design via MUI and avoid introducing shadcn/ui unless explicitly requested for a specific task.  
   **Reason:** Keeps component behavior, accessibility, and visual language consistent across learner and admin experiences.

15. **Area:** Finger Spelling training data  
   **Decision:** Treat Finger Spelling dataset as image-based labeled hand-shape data for training and pipeline design.  
   **Reason:** Aligns model and data pipeline assumptions with actual data format and avoids incorrect video-first implementation choices.

16. **Area:** Finger Spelling dataset storage  
   **Decision:** Keep lesson/drill media separate from training dataset storage by using a dedicated `finger_spelling_dataset_images` table for image-based training samples and provenance.  
   **Reason:** Prevents the exercise media model from doubling as the training dataset and keeps the backend contracts aligned with the documented image-based pipeline.

17. **Area:** Sign Language dataset storage  
   **Decision:** Keep lesson media separate from training dataset storage by using a dedicated `sign_language_dataset_videos` table for video-based training samples and provenance.  
   **Reason:** Prevents the exercise media model from doubling as the training dataset and keeps the backend contracts aligned with the documented video-based pipeline.

18. **Area:** Developer onboarding docs  
   **Decision:** Maintain a root README with explicit prerequisites, env setup, migration/seed workflow, run commands, and troubleshooting for local development.  
   **Reason:** Reduces setup friction and standardizes local run procedures across contributors.
