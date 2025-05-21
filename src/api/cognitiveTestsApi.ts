
import axios from 'axios';
import { TestHistory, TestSession, TestResult, TestResultSummary } from '../types/cognitivetests';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fatigue-guard-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const cognitiveTestsApi = {
  getTestHistory: async (): Promise<TestHistory[]> => {
    const response = await apiClient.get('/cognitive-tests');
    return response.data || [];
  },

  startTest: async (testType: string): Promise<TestSession> => {
    const response = await apiClient.post('/tests/start', { test_type: testType });
    return response.data;
  },

  submitTest: async (testId: string, answers: Record<string, string>): Promise<TestResultSummary> => {
    const response = await apiClient.post('/tests/submit', {
      test_id: testId,
      answers: answers
    });
    return response.data;
  },

  getTestResults: async (testId: number): Promise<TestResult> => {
    const response = await apiClient.get(`/tests/results/${testId}`);
    return response.data;
  },
  
  checkTestCooldown: async (testType: string): Promise<{ in_cooldown: boolean, cooldown_end?: string }> => {
    try {
      const response = await apiClient.get(`/tests/cooldown/${testType}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке перезарядки теста:', error);
      return { in_cooldown: false };
    }
  }
};
