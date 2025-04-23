
export interface TestHistory {
  test_id: number;
  test_date: string;
  test_type: string;
  score: number;
  duration: number;
  details: string;
  cooldown_end?: string; // Добавляем время окончания перезарядки теста
}

export interface TestQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  image?: string;
  images?: string[];
  grid?: any[][];
  matrix?: number[][];
  stimulus?: string | string[];
  delay?: number;
  correct_answer?: string;
  answer_options?: string[];
  question_text?: string;
  animation?: string;
  multiple_select?: boolean; // Добавляем возможность множественного выбора
}

export interface TestSession {
  test_id: string;
  questions: TestQuestion[];
  time_limit: number;
}

export interface TestResult {
  test_id: number;
  test_date: string;
  test_type: string;
  score: number;
  duration: number;
  details: {
    total_questions: number;
    correct_answers: number;
    error_analysis?: Record<string, number>;
  };
  mistakes: TestMistake[];
  cooldown_end?: string; // Добавляем время окончания перезарядки теста
}

export interface TestMistake {
  question: string;
  user_answer: string;
  correct_answer: string;
}

export interface TestResultSummary {
  score: number;
  test_id: number;
  total_questions?: number;
  correct_answers?: number;
  cooldown_end?: string; // Добавляем время окончания перезарядки теста
}

export interface QuestionResponse {
  questionId: string;
  answer: string;
  timeTaken?: number;
}
