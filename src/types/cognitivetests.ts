
export interface TestHistory {
  test_id: number;
  test_date: string;
  test_type: string;
  score: number;
  duration: number;
  details: string;
}

export interface TestQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  delay?: number;
  correct_answer?: string;
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
  details: Record<string, any>;
  mistakes: TestMistake[];
}

export interface TestMistake {
  question: string;
  user_answer: string;
  correct_answer: string;
}

export interface TestResultSummary {
  score: number;
  test_id: number;
}
