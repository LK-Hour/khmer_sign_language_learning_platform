export type ExerciseType =
  | "VIDEO_WATCH"
  | "SIGN_MATCH"
  | "PICTURE_MATCH"
  | "AI_PRACTICE"
  | "DIALOGUE";

export type SpellingExerciseType =
  | "LETTER_WATCH"
  | "LETTER_MATCH"
  | "AI_SPELL"
  | "WORD_SPELL";

export type UnitListItem = {
  id: string;
  title: string;
  progressPercent: number;
};

export type LessonSummary = {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
};

export type ChapterDetail = {
  id: string;
  title: string;
  order: number;
  lessons: LessonSummary[];
};

export type UnitDetail = {
  id: string;
  title: string;
  description: string;
  order: number;
  coverImageUrl: string;
  isLocked: boolean;
  chapters: ChapterDetail[];
};

export type SectionListItem = {
  id: string;
  title: string;
  progressPercent: number;
};

export type DrillSummary = {
  id: string;
  title: string;
  order: number;
};

export type SectionDetail = {
  sectionId: string;
  title: string;
  lettersCovered: string[];
  drillSets: DrillSummary[];
};

export type LessonExercise = {
  id: string;
  type: ExerciseType;
  order: number;
  signVideoUrl: string;
  slowMoVideoUrl: string;
  options: string[] | null;
  correctAnswer: string;
};

export type LessonDetail = {
  lessonId: string;
  chapterId: string;
  title: string;
  order: number;
  durationMinutes: number;
  exercises: LessonExercise[];
};

export type DrillExercise = {
  id: string;
  type: SpellingExerciseType;
  order: number;
  letter: string | null;
  word: string | null;
  handShapeVideoUrl: string;
  slowMoVideoUrl: string;
  options: string[] | null;
  correctAnswer: string;
};

export type DrillDetail = {
  drillId: string;
  sectionId: string;
  title: string;
  order: number;
  exercises: DrillExercise[];
};

export type FingerSpellingDatasetImage = {
  id: string;
  letter: string;
  imageUrl: string;
  handLandmarksJson: string | null;
  sourceContributionId: string | null;
  createdAt: string;
};

export type QuizQuestion = {
  exerciseId: string;
  type: ExerciseType | SpellingExerciseType;
  prompt: string;
  options: string[] | null;
};

export type QuizPayload = {
  score: number;
  stars: number;
};

export type QuizSubmitResponse = {
  score: number;
  passed: boolean;
  message: string;
};

export type UserStatsDto = {
  user_id: string;
  streak: number;
  xp: number;
  badges: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};
