
import axios from 'axios';

const API_URL = '/api';

export interface TestQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
}

export interface TestSession {
  test_id: string;
  questions: TestQuestion[];
  time_limit: number;
}

export interface TestResult {
  score: number;
  test_id: number;
  mistakes?: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
  }>;
}

export const cognitiveTestsApi = {
  startTest: async (testType: string): Promise<TestSession> => {
    const response = await axios.post(`${API_URL}/tests/start`, { test_type: testType });
    return response.data;
  },

  submitTest: async (testId: string, answers: Record<string, string>): Promise<TestResult> => {
    const response = await axios.post(`${API_URL}/tests/submit`, {
      test_id: testId,
      answers
    });
    return response.data;
  },

  getResults: async (testId: number): Promise<TestResult> => {
    const response = await axios.get(`${API_URL}/tests/results/${testId}`);
    return response.data;
  },

  getTestHistory: async () => {
    const response = await axios.get(`${API_URL}/cognitive-tests`);
    return response.data;
  }
};
