
import axios from 'axios';

const API_URL = '/api';

export interface TestQuestion {
  id: string;
  type: 'attention' | 'memory' | 'reaction';
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
  score: number;
  test_id: number;
  test_type: string;
  test_date: string;
  duration: number;
  details: {
    total_questions: number;
    correct_answers: number;
  };
  mistakes?: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
  }>;
}

export interface TestHistory {
  test_id: number;
  test_date: string;
  test_type: string;
  score: number;
  duration: number;
  details: string;
}

export const cognitiveTestsApi = {
  // Get list of all user's tests
  getTestHistory: async (): Promise<TestHistory[]> => {
    const response = await axios.get(`${API_URL}/cognitive-tests`);
    return response.data;
  },

  // Start a new test session
  startTest: async (testType: string): Promise<TestSession> => {
    const response = await axios.post(`${API_URL}/tests/start`, { test_type: testType });
    return response.data;
  },

  // Submit test answers
  submitTest: async (testId: string, answers: Record<string, string>): Promise<TestResult> => {
    const response = await axios.post(`${API_URL}/tests/submit`, {
      test_id: testId,
      answers
    });
    return response.data;
  },

  // Get detailed results for a specific test
  getTestResults: async (testId: number): Promise<TestResult> => {
    const response = await axios.get(`${API_URL}/tests/results/${testId}`);
    return response.data;
  }
};
