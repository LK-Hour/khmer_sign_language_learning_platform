# KSL Learning Platform — Copilot Instructions

> **Project:** Khmer Sign Language (KSL) Learning Platform
> **Inspiration:** [Lingvano](https://app.lingvano.com/dashboard) — gamified, structured sign-language learning
> **Goal:** An accessible, gamified web + mobile platform that teaches KSL through two distinct learning tracks — **Sign Language** and **Finger Spelling** — supported by AI-powered real-time feedback, a sign dictionary, and a community data-contribution loop.

---

## 1. Project Overview

The platform has **two primary learning tracks** that the user selects from the home/dashboard screen before entering any lesson content. These tracks are fully separate in terms of content, structure, and AI evaluation logic.

| Track | What it teaches | AI evaluation focus |
|---|---|---|
| **Sign Language** | Full KSL signs — words, phrases, sentences | Full-body + hand pose recognition |
| **Finger Spelling** | The KSL alphabet (A–Z) spelled letter by letter | Hand shape classification per letter |

Both tracks share the same gamification engine (XP, streaks, badges, gems) and the same user account, but their content hierarchies, exercise types, and AI models are managed independently.

The platform has three surfaces:

| Surface | Who uses it | Core purpose |
|---|---|---|
| **Learner App (Web)** | Registered users | Study KSL via gamified Units → Chapters → Lessons |
| **Mobile App (Android-first)** | Registered users | Same learning experience, offline-capable, camera-native |
| **Admin Dashboard** | Staff / moderators | Review contributed videos, manage users & content |

> 📱 **Mobile App Note:** The mobile app (React Native + Expo, Android-first) will be fully specified in a separate document. However, all backend APIs, data models, and business logic defined here must be designed mobile-first and offline-compatible from day one. See §11 for mobile considerations.

---

## 2. Tech Stack

### Confirmed Stack

| Layer | Technology | Reason |
|---|---|---|
| **Web Frontend** | Next.js 14 (App Router) + TypeScript | SSR, RSC, SEO, admin panel |
| **Mobile App** | React Native + Expo (Android-first) | Native camera, offline SQLite, Play Store |
| **Backend API** | **FastAPI (Python)** | Single unified API for web + mobile; native home for AI model |
| **Database** | PostgreSQL | Relational progress tracking |
| **ORM / Query** | SQLAlchemy (async) + Alembic for migrations | Pythonic, pairs with FastAPI |
| **Auth** | FastAPI + OAuth2 / JWT; Google OAuth via `authlib` | Single auth source for web + mobile |
| **Media Storage** | Cloudflare R2 + CDN | Low-egress cost, fast delivery to Cambodia |
| **AI — Signs** | MediaPipe Holistic + custom KSL classifier (TensorFlow/PyTorch) | Full-body + hand landmark scoring |
| **AI — Finger Spelling** | MediaPipe Hands + letter classifier | Isolated hand shape per letter |
| **Offline (Mobile)** | WatermelonDB + Expo FileSystem video cache | Lesson content + videos cached on-device |
| **Monorepo** | Turborepo | Share types, API clients, Zod schemas across web + mobile |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  Next.js 14 (Web)              React Native + Expo (Mobile) │
│  - Dashboard / Admin           - Offline-first learner app  │
│  - Learner web app             - Native camera for AI       │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS / REST + JSON
┌────────────────────────▼────────────────────────────────────┐
│                     FastAPI (Python)                        │
│  /auth  /units  /lessons  /quiz  /practice  /admin  /dict  │
└────────┬──────────────────┬──────────────────┬─────────────┘
         │                  │                  │
    PostgreSQL         Cloudflare R2      AI Models
    (via asyncpg)      (videos/media)     (MediaPipe +
                                          TF/PyTorch)
```

### Monorepo Structure

```
/
├── apps/
│   ├── web/              → Next.js 14 (website + admin)
│   └── mobile/           → React Native + Expo (Android-first)
├── packages/
│   └── shared/           → API types, Zod schemas, XP/streak logic, constants
└── backend/              → FastAPI app
    ├── app/
    │   ├── routers/      → auth, units, lessons, quiz, practice, admin, dictionary
    │   ├── models/       → SQLAlchemy models
    │   ├── schemas/      → Pydantic request/response schemas
    │   ├── services/     → business logic (progress, gamification, AI eval)
    │   └── ai/           → sign classifier, fingerspelling classifier
    ├── alembic/          → DB migrations
    └── main.py
```

---

## 3. Learning Track Architecture

### 3.1 Track Selection (Home Screen)

When a user lands on the dashboard after login, **before seeing any lesson content**, they choose their learning track:

```
┌─────────────────────────────────────────────────────┐
│              What would you like to learn?          │
│                                                     │
│   ┌─────────────────────┐  ┌─────────────────────┐ │
│   │                     │  │                     │ │
│   │    🤲 Sign Language  │  │  🔤 Finger Spelling  │ │
│   │                     │  │                     │ │
│   │  Learn full KSL     │  │  Learn the KSL      │ │
│   │  words & phrases    │  │  alphabet A–Z       │ │
│   │                     │  │                     │ │
│   └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Users can **switch tracks** anytime from the sidebar/nav — progress in each track is saved independently
- A user's active track is stored in their session/local state, not persisted to DB (they can freely switch)
- The **gamification engine is shared** — XP, streaks, and badges span both tracks

---

### 3.2 Sign Language Track

Follows a structured curriculum hierarchy:

```
Sign Language Track
└── Unit (e.g., "Unit 1 — Greetings")
     └── Chapter (e.g., "Chapter 1 — Hello & Goodbye")
          └── Lesson (e.g., "Lesson 1 — Saying Hello")
               └── Exercise (video-watch, sign-match, picture-match, AI-practice, dialogue)
          └── Chapter Quiz (end-of-chapter gate, pass = 70%)
     └── Unit Milestone (unlocks next Unit, awards badge, scored 1–5 stars)
```

**Exercise types for Sign Language:**

| Type | Description |
|---|---|
| `VIDEO_WATCH` | Watch a native KSL signer demonstrate the sign |
| `SIGN_MATCH` | Watch a sign video → choose correct meaning (4 options) |
| `PICTURE_MATCH` | See a picture → choose the correct sign video |
| `AI_PRACTICE` | Perform the sign live; AI scores in real-time using full-body landmarks |
| `DIALOGUE` | Watch a KSL conversation scene → answer comprehension questions |

---

### 3.3 Finger Spelling Track

Follows a lighter, drill-oriented structure:

```
Finger Spelling Track
└── Section (e.g., "Section A — Letters A to E")
     └── Drill Set (e.g., "Drill 1 — Learn A, B, C")
          └── Exercise (letter-watch, letter-match, AI-spell, word-spell)
     └── Section Quiz (pass = 75%)
└── Full Alphabet Milestone (unlocks Word Spelling mode)
```

**Exercise types for Finger Spelling:**

| Type | Description |
|---|---|
| `LETTER_WATCH` | Watch the hand shape for a single KSL letter |
| `LETTER_MATCH` | See a letter hand shape → choose correct letter (4 options) |
| `AI_SPELL` | Show a single letter to camera; AI identifies and scores it |
| `WORD_SPELL` | Spell out a full word letter-by-letter; AI evaluates each letter in sequence |

**AI model difference:** Finger spelling uses `MediaPipe Hands` only (no body pose needed), running a simpler letter-classification model. The endpoint and scoring logic are separate from the sign language AI pipeline.

---

## 4. Data Models

### 4.1 Sign Language Content

```python
# SQLAlchemy models (simplified)

class Unit(Base):
    id: UUID
    title: str              # "Unit 1 — Greetings"
    description: str
    order: int
    cover_image_url: str
    is_locked: bool
    chapters: List[Chapter]

class Chapter(Base):
    id: UUID
    unit_id: UUID
    title: str
    order: int
    lessons: List[Lesson]

class Lesson(Base):
    id: UUID
    chapter_id: UUID
    title: str
    order: int
    duration_minutes: int   # target ~10
    exercises: List[Exercise]

class Exercise(Base):
    id: UUID
    lesson_id: UUID
    type: ExerciseType      # Enum: VIDEO_WATCH | SIGN_MATCH | PICTURE_MATCH | AI_PRACTICE | DIALOGUE
    order: int
    sign_video_url: str
    slow_mo_video_url: str  # pre-rendered 0.5x; do NOT use browser playback speed
    options: JSON           # list of strings for multiple-choice
    correct_answer: str
```

### 4.2 Finger Spelling Content

```python
class SpellingSection(Base):
    id: UUID
    title: str              # "Section A — Letters A to E"
    order: int
    letters_covered: List[str]   # ["A", "B", "C", "D", "E"]
    drill_sets: List[DrillSet]

class DrillSet(Base):
    id: UUID
    section_id: UUID
    title: str
    order: int
    exercises: List[SpellingExercise]

class SpellingExercise(Base):
    id: UUID
    drill_set_id: UUID
    type: SpellingExerciseType   # LETTER_WATCH | LETTER_MATCH | AI_SPELL | WORD_SPELL
    order: int
    letter: str             # single letter e.g. "A"
    word: Optional[str]     # for WORD_SPELL e.g. "BAS"
    hand_shape_video_url: str
    slow_mo_video_url: str
    options: Optional[JSON]
    correct_answer: str
```

### 4.3 User Progress

```python
class UserProgress(Base):
    id: UUID
    user_id: UUID
    # Sign Language progress
    lesson_id: Optional[UUID]
    exercise_id: Optional[UUID]
    # Finger Spelling progress
    drill_set_id: Optional[UUID]
    spelling_exercise_id: Optional[UUID]
    # Shared
    score: float            # 0.0 – 100.0
    stars: int              # 1–5 (milestone/section quiz)
    retry_count: int        # append-only; never delete progress
    completed_at: datetime

class UserStats(Base):
    user_id: UUID
    current_streak: int
    longest_streak: int
    total_xp: int
    last_active_date: date
    badges: JSON            # list of badge IDs
    fcm_token: Optional[str]    # for mobile push notifications (streak reminders)
    timezone: str               # stored at signup; used for server-side streak calc
```

### 4.4 Contributed Video (Community Data)

```python
class ContributedVideo(Base):
    id: UUID
    user_id: UUID
    track: str              # "SIGN_LANGUAGE" | "FINGER_SPELLING"
    sign_label: str         # what sign/letter this represents
    video_url: str          # private R2 bucket URL
    consent_given: bool     # MUST be explicitly True from user action
    status: str             # "PENDING" | "APPROVED" | "REJECTED"
    reviewed_by: Optional[UUID]
    reviewed_at: Optional[datetime]
    created_at: datetime
```

---

## 5. Feature Specifications

### 5.1 Authentication

- Google OAuth via `authlib` + FastAPI OAuth2 flow
- Email + password fallback (bcrypt hashed)
- JWT access token (short-lived, 15 min) + refresh token (7 days, stored in HTTP-only cookie for web; secure storage for mobile)
- On first login: onboarding → track selection → goal-setting → start first Unit/Section
- `consent_for_video_contribution: bool` stored on User model, default `False`, explicitly opt-in only

### 5.2 Learner Dashboard

After selecting a track, the dashboard renders the learning path for that track:

**Sign Language dashboard:**
```
┌─────────────────────────────────────────────────────┐
│  🔥 5-day streak   ⭐ 1,240 XP   🏅 3 badges        │
├─────────────────────────────────────────────────────┤
│  📍 Continue → Chapter 2, Lesson 3                  │
├─────────────────────────────────────────────────────┤
│  UNIT 1 — Greetings              ████████░░  80%    │
│  [Ch.1 ✅] [Ch.2 🔄] [Ch.3 🔒] [Ch.4 🔒]           │
├─────────────────────────────────────────────────────┤
│  UNIT 2 — Family    [🔒 Complete Unit 1 first]      │
└─────────────────────────────────────────────────────┘
```

**Finger Spelling dashboard:**
```
┌─────────────────────────────────────────────────────┐
│  🔥 5-day streak   ⭐ 1,240 XP   🏅 3 badges        │
├─────────────────────────────────────────────────────┤
│  SECTION A — Letters A to E      ██████░░░░  60%    │
│  [Drill 1 ✅] [Drill 2 🔄] [Drill 3 🔒]             │
├─────────────────────────────────────────────────────┤
│  SECTION B — Letters F to J  [🔒 Complete A first]  │
└─────────────────────────────────────────────────────┘
```

- Units/Sections are displayed as a visual learning path (Lingvano-style road/map UI)
- Locked items show a padlock with a tooltip explaining the unlock condition
- Persistent top bar: streak flame 🔥, XP ⭐, daily goal ring — visible in both tracks

### 5.3 Lesson / Drill Flow

Every lesson (Sign Language) and drill set (Finger Spelling) follows the same inner loop:

1. **Intro card** — title, signs/letters covered, estimated time
2. **Exercise sequence** — ~8–12 exercises, mixed types per track
3. **End-of-lesson results** — score %, XP earned, stars (1–3), confetti animation
4. **Navigation prompt** — continue to next lesson, or return to dashboard

Rules:
- Never navigate away mid-lesson without a confirmation dialog
- **🐢 Turtle mode** — every sign/hand-shape video has a slow-motion button (pre-rendered 0.5x asset)
- Immediate feedback per exercise: green flash + sound = correct; red shake = wrong

### 5.4 Chapter Quiz (Sign Language) / Section Quiz (Finger Spelling)

- Triggered after all lessons/drills in a chapter/section are complete
- 10–15 questions, mixing all exercise types from that chapter/section
- Pass threshold: **70%** (Sign Language), **75%** (Finger Spelling — letters require more precision)
- Fail → retry quiz only; lesson progress is preserved
- Pass → unlock next chapter/section, award badge, show XP summary

### 5.5 Unit Milestone / Alphabet Milestone

- Final gate before the next Unit/Section group unlocks
- Scored **1–5 stars** based on accuracy
- Score < 60% → must retry; all lesson progress preserved
- On pass → full-screen celebration animation, Unit/Alphabet Badge awarded

### 5.6 Gamification System

| Element | Mechanic |
|---|---|
| **XP** | Earned per exercise; bonus for streaks and perfect scores |
| **Streak 🔥** | Daily login + ≥1 lesson/drill completed; resets at midnight (user timezone, server-side) |
| **Stars ⭐** | 1–5 per milestone; permanently displayed on that lesson/section card |
| **Badges 🏅** | Chapter complete, Unit complete, Section complete, 7-day streak, 85%+ AI score |
| **Gems 💎** | Earned at 90%+ score; spend to skip an exercise, get a hint, or retry quiz instantly |
| **Leaderboard** | Weekly XP leaderboard across all users (opt-in, both tracks combined) |

### 5.7 Sign Dictionary (Text → Sign)

- Searchable by Khmer text or English text
- Filterable by: **track** (Sign Language / Finger Spelling), Unit/Section, topic
- Each entry: Khmer label, English label, sign video loop, slow-mo video, example sentence
- Accessible from sidebar at all times — not gated by lesson progress
- Future v2: community-submitted entries, admin-approved

### 5.8 AI Real-Time Practice

#### Sign Language AI Practice

- Unlocked per chapter after chapter completion
- **Free Practice Mode** (unlocked per unit): user picks any sign from completed units to practice freely
- Flow:
  1. Camera permission via browser (`getUserMedia`) or native Expo camera
  2. Platform shows sign prompt (Khmer text + optional reference video)
  3. User performs sign live
  4. MediaPipe Holistic → hand + body landmarks → POST to `/practice/sign/evaluate`
  5. FastAPI runs KSL classifier → returns `{ sign, confidence, feedback[] }`
  6. Overlay shows: score %, positional tips, pass/fail
  7. Score ≥ 85% → optional video contribution prompt (see §5.9)

#### Finger Spelling AI Practice

- Separate flow and endpoint from Sign Language
- User selects a letter or a word to practice
- MediaPipe Hands only (no body pose) → POST to `/practice/spelling/evaluate`
- For `WORD_SPELL`: evaluates letter-by-letter in sequence, shows which letters were correct
- Score ≥ 85% → optional video contribution prompt

### 5.9 Community Video Contribution

Inspired by [signs-ai.com](https://signs-ai.com):

- Only triggered when score **≥ 85%** on an AI practice exercise
- Modal: *"Great job! Would you like to contribute this sign to our KSL dataset? Your video will be reviewed before use."*
- **Explicit user action required** — no default opt-in; `consent_given` must be set server-side only after user taps "Yes, contribute"
- `ContributedVideo` saved with `status: PENDING`; stored in private R2 bucket
- Admin must approve before video enters training dataset

### 5.10 Admin Dashboard

**Users tab:** table with name, email, join date, current unit/chapter, XP, streak; drill-down to full lesson history

**Video Review tab:** queue of `PENDING` contributed videos; play video, see sign/letter label, APPROVE or REJECT with note; approved videos enter AI training pool

**Content tab (v2):** add/edit Units, Chapters, Lessons, Exercises; upload sign videos; manage Finger Spelling sections and drills

---

## 6. API Route Structure (FastAPI)

```
POST /auth/register
POST /auth/login
POST /auth/google
POST /auth/refresh
POST /auth/logout

# Sign Language Track
GET  /units                              → all units + user progress
GET  /units/{unit_id}                    → unit detail + chapters
GET  /chapters/{chapter_id}             → chapter + lessons
GET  /lessons/{lesson_id}               → lesson + exercises
POST /lessons/{lesson_id}/complete      → submit score, update progress

GET  /quiz/chapter/{chapter_id}         → quiz exercises
POST /quiz/chapter/{chapter_id}/submit  → score + unlock

POST /practice/sign/evaluate            → { landmarks[], sign_label } → { score, feedback }
POST /practice/sign/contribute          → { video_blob, sign_label, consent: true }

# Finger Spelling Track
GET  /spelling/sections                          → all sections + user progress
GET  /spelling/sections/{section_id}             → section + drill sets
GET  /spelling/drills/{drill_id}                 → drill + exercises
POST /spelling/drills/{drill_id}/complete

GET  /quiz/spelling/{section_id}
POST /quiz/spelling/{section_id}/submit

POST /practice/spelling/evaluate        → { landmarks[], letter } → { score, feedback }
POST /practice/spelling/contribute      → { video_blob, letter, consent: true }

# Shared
GET  /dictionary                        → searchable sign list (both tracks, filterable)
GET  /dictionary/{sign_id}
GET  /user/stats                        → XP, streak, badges
GET  /user/progress                     → full progress map (both tracks)
POST /sync/progress                     → batch offline progress sync (mobile)

# Admin (role-protected)
GET  /admin/users
GET  /admin/users/{user_id}
GET  /admin/videos
PATCH /admin/videos/{video_id}/approve
PATCH /admin/videos/{video_id}/reject
```

---

## 7. Key Constraints & Rules

1. **Never auto-enroll a user's video.** `consent_given` must be set server-side only after an explicit user action — never set it programmatically or by default.
2. **Sign Language and Finger Spelling AI pipelines are strictly separate.** Do not share model weights, endpoints, or scoring logic between the two tracks.
3. **Slow-motion video is a pre-rendered asset.** Store as `slow_mo_video_url`. Do not rely on browser/native `playbackRate` — it is unreliable across devices.
4. **Gate AI practice on chapter/section completion.** Users must finish all lessons/drills in a chapter/section before AI practice for those signs/letters is unlocked.
5. **Progress is append-only.** Never delete `UserProgress` records. Use `retry_count` to track retries.
6. **Streak is calculated server-side** using `user.timezone` stored at signup — never trust client-computed streak values.
7. **Admin routes require `role = "ADMIN"`** enforced by a `require_admin` FastAPI dependency before any handler logic runs.
8. **All media URLs use environment variables.** Never hardcode R2 or CDN URLs — always use `settings.MEDIA_BASE_URL`.
9. **Khmer-first UI.** Default language is Khmer (`km`). English is secondary. Use `next-intl` (web) and `i18n-js` (mobile) with shared translation keys from `packages/shared`.
10. **All APIs must be mobile-compatible.** Pagination on all list endpoints (`?page=1&limit=20`), JWT Bearer auth (no session cookies for mobile), lean response payloads.

---

## 8. Folder Structure

```
apps/web/
├── app/
│   ├── (auth)/login/ · register/
│   ├── (learner)/
│   │   ├── dashboard/                ← Track selector + learning path map
│   │   ├── sign-language/
│   │   │   ├── units/[unitId]/
│   │   │   └── lessons/[lessonId]/
│   │   ├── finger-spelling/
│   │   │   ├── sections/[sectionId]/
│   │   │   └── drills/[drillId]/
│   │   ├── practice/sign/
│   │   ├── practice/spelling/
│   │   ├── dictionary/
│   │   └── profile/
│   └── (admin)/admin/users/ · admin/videos/
├── components/
│   ├── lesson/VideoPlayer.tsx         ← includes 🐢 turtle mode
│   ├── lesson/ExerciseCard.tsx
│   ├── lesson/AICamera.tsx
│   ├── spelling/LetterCard.tsx
│   ├── spelling/WordSpellPlayer.tsx
│   ├── gamification/StreakBadge.tsx
│   ├── gamification/XPBar.tsx
│   └── gamification/Confetti.tsx
└── lib/api/                           ← typed FastAPI client (shared with mobile via packages/)

packages/shared/
├── types/                             ← Unit, Lesson, Exercise, SpellingSection, etc.
├── schemas/                           ← Zod validation schemas
├── constants/                         ← XP values, score thresholds (70/75/85/90%), badge IDs
└── utils/                             ← XP calc, score formatting (streak calc is server-only)

backend/
├── app/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── units.py · lessons.py · quiz.py
│   │   ├── spelling.py
│   │   ├── practice.py               ← /sign and /spelling as sub-routers
│   │   ├── dictionary.py
│   │   ├── sync.py                   ← offline progress batch sync
│   │   └── admin.py
│   ├── models/                       ← SQLAlchemy models
│   ├── schemas/                      ← Pydantic v2 schemas
│   ├── services/
│   │   ├── progress.py
│   │   ├── gamification.py
│   │   └── ai/
│   │       ├── sign_evaluator.py     ← MediaPipe Holistic + KSL classifier
│   │       └── spelling_evaluator.py ← MediaPipe Hands + letter classifier
│   └── core/
│       ├── config.py                 ← settings from env vars
│       ├── security.py               ← JWT helpers
│       └── deps.py                   ← get_current_user, require_admin dependencies
├── alembic/
└── main.py

apps/mobile/                          ← React Native + Expo (spec TBD)
```

---

## 9. UI/UX Design Principles

- **Cambodian visual identity:** Deep red (`#C0392B`) + gold (`#F1C40F`), Angkor-inspired textures for section dividers
- **Typography:** Noto Sans Khmer (Khmer) + Inter (Latin/numbers)
- **Mascot:** A friendly KSL character (similar to Lingvano's "Mano") — appears during onboarding, lesson starts, and celebrations; the mascot uses KSL gestures in its animations
- **Track distinction:** Sign Language uses warm red/gold tones; Finger Spelling uses cool blue/teal tones — clear visual identity per track without breaking the shared design system
- **Animations:** Framer Motion (web) for lesson transitions, confetti on completion, streak fire pulse, star fill on milestone
- **Mobile-first layout:** all web components must be responsive and usable at 375px viewport width

---

## 10. Development Phases

### Phase 1 — Core Learning Loop (MVP)
- [ ] Auth (Google OAuth + email/password via FastAPI + JWT)
- [ ] Track selection screen (home)
- [ ] Sign Language: Unit 1 full content seeded
- [ ] Lesson player: VIDEO_WATCH, SIGN_MATCH, PICTURE_MATCH
- [ ] Chapter quiz (Sign Language)
- [ ] Finger Spelling: Section A full content seeded
- [ ] Drill player: LETTER_WATCH, LETTER_MATCH
- [ ] Section quiz (Finger Spelling)
- [ ] Shared progress tracking, XP, streak
- [ ] Learner dashboard (both tracks)

### Phase 2 — AI Practice
- [ ] MediaPipe Holistic integration (web browser via WASM)
- [ ] FastAPI sign evaluator endpoint + KSL classifier model
- [ ] MediaPipe Hands integration
- [ ] FastAPI spelling evaluator endpoint + letter classifier model
- [ ] AI Practice UI (chapter/section-gated, both tracks)
- [ ] Score recording + real-time feedback overlay
- [ ] Video contribution flow (consent modal + R2 upload)

### Phase 3 — Gamification & Dictionary
- [ ] Full badge system (chapter, unit, section, streak, AI score badges)
- [ ] Gems economy (earn at 90%+, spend actions)
- [ ] Weekly XP leaderboard (opt-in)
- [ ] Sign dictionary (searchable, filterable by track)
- [ ] Free Practice mode (any unlocked unit/section)
- [ ] Turtle mode (🐢) for all exercise video types

### Phase 4 — Admin & Community
- [ ] Admin dashboard: users table + drill-down to lesson history
- [ ] Video review queue (approve/reject with note)
- [ ] Content management UI (v2): add/edit Units, Chapters, Lessons, Sections, Drills
- [ ] Analytics: completion rates, AI scores by sign/letter, contribution rates

### Phase 5 — Mobile App *(spec TBD — see §11)*
- [ ] React Native + Expo project setup within monorepo
- [ ] Android-first build; offline SQLite via WatermelonDB
- [ ] Chapter/section video download for offline (Expo FileSystem)
- [ ] Native camera for AI practice (both tracks)
- [ ] Offline progress sync via `POST /sync/progress` when reconnected
- [ ] FCM push notifications (streak reminders)
- [ ] Play Store release

---

## 11. Mobile App Considerations (Pre-Spec)

> Full mobile specification will be written in `mobile-instructions.md`. The following constraints apply to all backend and shared-package decisions made now so the mobile app can be built without backend changes later.

- **Stateless JWT auth only** — mobile uses `Authorization: Bearer <token>`; no session cookies
- **All list endpoints must be paginated** — `?page=1&limit=20`; mobile loads content lazily on scroll
- **Media delivery via pre-signed URLs** — mobile cannot handle auth-gated video streams; use time-limited Cloudflare R2 pre-signed URLs (TTL: 1 hour)
- **Lean response payloads** — avoid deep eager-loading in list responses; Cambodia 3G/4G bandwidth is limited
- **Offline sync endpoint** — `POST /sync/progress` accepts a batch of `UserProgress` records written offline; implement this endpoint in Phase 1 even though mobile ships in Phase 5
- **`fcm_token` field on User model** — add now for FCM push notifications (streak reminders); mobile will populate this on app launch
- **`timezone` field on User model** — captured at signup (both web and mobile); used for server-side streak calculation

---

## 12. Copilot Behavior Directives

When generating code for this project, Copilot must:

- **Always use Python type hints** and Pydantic v2 schemas in FastAPI; never use untyped dicts in route handlers
- **Use async SQLAlchemy** for all DB queries — no synchronous ORM calls inside async FastAPI handlers
- **Protect all `/admin/` routes** using a `require_admin` FastAPI dependency — this check must run before any handler logic
- **Never hardcode media URLs** — always reference `settings.MEDIA_BASE_URL` from `app/core/config.py`
- **Check `consent_given is True` server-side** before saving any `ContributedVideo` — never trust the client value alone
- **Keep Sign Language and Finger Spelling strictly separated** — separate routers, services, AI evaluators, and data models; do not merge their logic even when it looks similar
- **Write loading and error states** for every async UI component on the web frontend
- **Use Zod** (from `packages/shared`) for all API request validation on the web/mobile clients; use Pydantic v2 on the FastAPI side
- **Comment in Khmer and English** for domain-specific thresholds and business rules (e.g., pass scores, XP values)
- **Follow Lingvano's UX pattern:** every lesson/drill ends with a score screen — never navigate away mid-session without a confirmation dialog
- **Never delete `UserProgress` records** — always append; increment `retry_count` on retries
- **Streak is always server-side** using `user.timezone` — never trust or compute streak values on the client

---

*Last updated: April 2026 | Platform: KSL Learning (Khmer Sign Language)*

---

## 13. Session Handoff (Cross-Session Memory)

Use repository docs as the single source of truth for multi-session continuity:

- `docs/project-state.md` — current phase, completed work, in-progress work, blockers, next steps
- `docs/decisions.md` — key architecture/product decisions with rationale
- `docs/todo.md` (or linked GitHub Issues) — actionable tasks and statuses

Rules:

1. At the start of every session, read `docs/project-state.md`, `docs/decisions.md`, and `docs/todo.md` before coding.
2. At the end of every completed task, update those docs to reflect the latest state.
3. Keep `.github/copilot-instructions.md` for stable project rules and workflow guidance, not day-to-day status logs.
