import type {
  AuthTokens,
  DrillDetail,
  QuizPayload,
  QuizQuestion,
  QuizSubmitResponse,
  SectionDetail,
  SectionListItem,
  UnitDetail,
  UnitListItem,
  UserStatsDto,
  LessonDetail,
} from "@ksl/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "ksl_access_token";
const REFRESH_TOKEN_KEY = "ksl_refresh_token";

export type AuthRole = "ADMIN" | "LEARNER" | "UNKNOWN";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return readAccessToken();
}

export function getCurrentRole(): AuthRole {
  const token = readAccessToken();
  if (!token) {
    return "UNKNOWN";
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  if (role === "ADMIN" || role === "LEARNER") {
    return role;
  }

  return "UNKNOWN";
}

export function hasAccessToken(): boolean {
  return readAccessToken() !== null;
}

export function saveTokens(tokens: AuthTokens): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  auth?: boolean;
};

export type VideoQuizListItemDto = {
  id: string;
  title: string;
  description: string | null;
  quiz_type: string;
  question_count: number;
  pass_threshold: number;
  time_limit_seconds: number | null;
};

export type VideoQuizQuestionDto = {
  id: string;
  order: number;
  video_url: string;
  video_duration_seconds: number | null;
  prompt: string;
  question_type: string;
  options: string[] | null;
};

export type VideoQuizDetailDto = VideoQuizListItemDto & {
  questions: VideoQuizQuestionDto[];
};

export type VideoQuizAnswerResponseDto = {
  attempt_id: string;
  question_id: string;
  is_correct: boolean;
  correct_answer: string;
  explanation: string | null;
  similarity_score: number | null;
};

export type VideoQuizSubmitResponseDto = {
  attempt_id: string;
  score_percent: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number | null;
  xp_earned: number;
  badges_earned: string[];
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const method = options.method ?? "GET";

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const token = readAccessToken();
    if (!token) {
      throw new Error("You need to login first.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { detail?: string } | null;
    if (errorBody?.detail) {
      throw new Error(errorBody.detail);
    }
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function login(email: string, password: string): Promise<AuthTokens> {
  const payload = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
  };
}

export async function register(email: string, password: string, displayName: string): Promise<AuthTokens> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Phnom_Penh";
  const payload = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password, display_name: displayName, timezone },
  });
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
  };
}

export async function loginWithGoogle(idToken: string): Promise<AuthTokens> {
  const payload = await request<AuthResponse>("/auth/google", {
    method: "POST",
    body: { id_token: idToken },
  });
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
  };
}

export async function fetchUnits(): Promise<UnitListItem[]> {
  const payload = await request<Array<{ id: string; title: string; progress_percent: number }>>("/units");
  return payload.map((unit) => ({
    id: unit.id,
    title: unit.title,
    progressPercent: unit.progress_percent,
  }));
}

export async function fetchUnitDetail(unitId: string): Promise<UnitDetail> {
  const payload = await request<{
    id: string;
    title: string;
    description: string;
    order: number;
    cover_image_url: string;
    is_locked: boolean;
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      lessons: Array<{ id: string; title: string; order: number; duration_minutes: number }>;
    }>;
  }>(`/units/${unitId}`);
  return {
    id: payload.id,
    title: payload.title,
    description: payload.description,
    order: payload.order,
    coverImageUrl: payload.cover_image_url,
    isLocked: payload.is_locked,
    chapters: payload.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        durationMinutes: lesson.duration_minutes,
      })),
    })),
  };
}

export async function fetchLessonDetail(lessonId: string): Promise<LessonDetail> {
  const payload = await request<{
    lesson_id: string;
    chapter_id: string;
    title: string;
    order: number;
    duration_minutes: number;
    exercises: Array<{
      id: string;
      type: string;
      order: number;
      sign_video_url: string;
      slow_mo_video_url: string;
      options: string[] | null;
      correct_answer: string;
    }>;
  }>(`/lessons/${lessonId}`);
  return {
    lessonId: payload.lesson_id,
    chapterId: payload.chapter_id,
    title: payload.title,
    order: payload.order,
    durationMinutes: payload.duration_minutes,
    exercises: payload.exercises.map((exercise) => ({
      id: exercise.id,
      type: exercise.type as LessonDetail["exercises"][number]["type"],
      order: exercise.order,
      signVideoUrl: exercise.sign_video_url,
      slowMoVideoUrl: exercise.slow_mo_video_url,
      options: exercise.options,
      correctAnswer: exercise.correct_answer,
    })),
  };
}

export async function completeLesson(lessonId: string, score: number, stars: number): Promise<void> {
  await request(`/lessons/${lessonId}/complete`, {
    method: "POST",
    auth: true,
    body: { score, stars },
  });
}

export async function fetchSections(): Promise<SectionListItem[]> {
  const payload = await request<Array<{ id: string; title: string; progress_percent: number }>>(
    "/spelling/sections"
  );
  return payload.map((section) => ({
    id: section.id,
    title: section.title,
    progressPercent: section.progress_percent,
  }));
}

export async function fetchSectionDetail(sectionId: string): Promise<SectionDetail> {
  const payload = await request<{
    section_id: string;
    title: string;
    letters_covered: string[];
    drill_sets: Array<{ id: string; title: string; order: number }>;
  }>(`/spelling/sections/${sectionId}`);
  return {
    sectionId: payload.section_id,
    title: payload.title,
    lettersCovered: payload.letters_covered,
    drillSets: payload.drill_sets.map((drill) => ({
      id: drill.id,
      title: drill.title,
      order: drill.order,
    })),
  };
}

export async function fetchDrillDetail(drillId: string): Promise<DrillDetail> {
  const payload = await request<{
    drill_id: string;
    section_id: string;
    title: string;
    order: number;
    exercises: Array<{
      id: string;
      type: string;
      order: number;
      letter: string | null;
      word: string | null;
      hand_shape_video_url: string;
      slow_mo_video_url: string;
      options: string[] | null;
      correct_answer: string;
    }>;
  }>(`/spelling/drills/${drillId}`);
  return {
    drillId: payload.drill_id,
    sectionId: payload.section_id,
    title: payload.title,
    order: payload.order,
    exercises: payload.exercises.map((exercise) => ({
      id: exercise.id,
      type: exercise.type as DrillDetail["exercises"][number]["type"],
      order: exercise.order,
      letter: exercise.letter,
      word: exercise.word,
      handShapeVideoUrl: exercise.hand_shape_video_url,
      slowMoVideoUrl: exercise.slow_mo_video_url,
      options: exercise.options,
      correctAnswer: exercise.correct_answer,
    })),
  };
}

export async function completeDrill(drillId: string, score: number, stars: number): Promise<void> {
  await request(`/spelling/drills/${drillId}/complete`, {
    method: "POST",
    auth: true,
    body: { score, stars },
  });
}

export async function fetchChapterQuiz(chapterId: string): Promise<QuizQuestion[]> {
  const payload = await request<{
    chapter_id: string;
    questions: Array<{ exercise_id: string; type: string; prompt: string; options: string[] | null }>;
  }>(`/quiz/chapter/${chapterId}`);
  return payload.questions.map((question) => ({
    exerciseId: question.exercise_id,
    type: question.type as QuizQuestion["type"],
    prompt: question.prompt,
    options: question.options,
  }));
}

export async function submitChapterQuiz(
  chapterId: string,
  quizPayload: QuizPayload
): Promise<QuizSubmitResponse> {
  const payload = await request<{ score: number; passed: boolean; message: string }>(
    `/quiz/chapter/${chapterId}/submit`,
    {
      method: "POST",
      auth: true,
      body: quizPayload,
    }
  );
  return payload;
}

export async function fetchSpellingQuiz(sectionId: string): Promise<QuizQuestion[]> {
  const payload = await request<{
    section_id: string;
    questions: Array<{ exercise_id: string; type: string; prompt: string; options: string[] | null }>;
  }>(`/quiz/spelling/${sectionId}`);
  return payload.questions.map((question) => ({
    exerciseId: question.exercise_id,
    type: question.type as QuizQuestion["type"],
    prompt: question.prompt,
    options: question.options,
  }));
}

export async function submitSpellingQuiz(
  sectionId: string,
  quizPayload: QuizPayload
): Promise<QuizSubmitResponse> {
  const payload = await request<{ score: number; passed: boolean; message: string }>(
    `/quiz/spelling/${sectionId}/submit`,
    {
      method: "POST",
      auth: true,
      body: quizPayload,
    }
  );
  return payload;
}

export async function fetchUserStats(): Promise<UserStatsDto> {
  return await request<UserStatsDto>("/user/stats", { auth: true });
}

export async function fetchVideoQuizList(): Promise<VideoQuizListItemDto[]> {
  return await request<VideoQuizListItemDto[]>("/video-quiz", { auth: true });
}

export async function fetchVideoQuizDetail(quizId: string): Promise<VideoQuizDetailDto> {
  return await request<VideoQuizDetailDto>(`/video-quiz/${quizId}`, { auth: true });
}

export async function submitVideoQuizAnswer(payload: {
  quizId: string;
  attemptId?: string | null;
  questionId: string;
  userAnswer: string;
}): Promise<VideoQuizAnswerResponseDto> {
  return await request<VideoQuizAnswerResponseDto>(`/video-quiz/${payload.quizId}/answer`, {
    method: "POST",
    auth: true,
    body: {
      attempt_id: payload.attemptId ?? null,
      question_id: payload.questionId,
      user_answer: payload.userAnswer,
    },
  });
}

export async function submitVideoQuiz(payload: {
  quizId: string;
  attemptId?: string | null;
  responses?: Array<{ question_id: string; user_answer: string }>;
}): Promise<VideoQuizSubmitResponseDto> {
  return await request<VideoQuizSubmitResponseDto>(`/video-quiz/${payload.quizId}/submit`, {
    method: "POST",
    auth: true,
    body: {
      quiz_id: payload.quizId,
      attempt_id: payload.attemptId ?? null,
      responses: payload.responses ?? [],
    },
  });
}
