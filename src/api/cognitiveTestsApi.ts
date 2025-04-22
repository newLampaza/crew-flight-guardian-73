
import axios from 'axios';
import { TestHistory, TestSession, TestResult, TestResultSummary } from '../types/cognitivetests';

const API_URL = '/api';

export const cognitiveTestsApi = {
  // Получить историю тестов
  getTestHistory: async (): Promise<TestHistory[]> => {
    const response = await axios.get(`${API_URL}/cognitive-tests`);
    return response.data;
  },

  // Начать новый тест
  startTest: async (testType: string): Promise<TestSession> => {
    const response = await axios.post(`${API_URL}/tests/start`, { test_type: testType });
    return response.data;
  },

  // Отправить результаты теста
  submitTest: async (testId: string, answers: Record<string, string>): Promise<TestResultSummary> => {
    const response = await axios.post(`${API_URL}/tests/submit`, {
      test_id: testId,
      answers: answers
    });
    return response.data;
  },

  // Получить детальные результаты теста
  getTestResults: async (testId: number): Promise<TestResult> => {
    const response = await axios.get(`${API_URL}/tests/results/${testId}`);
    return response.data;
  }
};
