
import axios from 'axios';
import { TestHistory, TestSession, TestResult, TestResultSummary, QuestionResponse } from '../types/cognitivetests';

// For development environment, we need to use the full URL with port
// In production, the API_URL should be just '/api'
const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик запросов для добавления токена авторизации
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
  // Получить историю тестов
  getTestHistory: async (): Promise<TestHistory[]> => {
    try {
      const response = await apiClient.get('/cognitive-tests');
      return response.data || [];
    } catch (error) {
      console.error('Не удалось получить историю тестов:', error);
      throw error;
    }
  },

  // Начать новый тест
  startTest: async (testType: string): Promise<TestSession> => {
    const response = await apiClient.post('/tests/start', { test_type: testType });
    return response.data;
  },

  // Отправить результаты теста
  submitTest: async (testId: string, answers: Record<string, string>): Promise<TestResultSummary> => {
    const response = await apiClient.post('/tests/submit', {
      test_id: testId,
      answers: answers
    });
    return response.data;
  },

  // Получить детальные результаты теста
  getTestResults: async (testId: number): Promise<TestResult> => {
    const response = await apiClient.get(`/tests/results/${testId}`);
    return response.data;
  },
  
  // Проверить статус перезарядки теста
  checkTestCooldown: async (testType: string): Promise<{ in_cooldown: boolean, cooldown_end?: string }> => {
    try {
      // Используем единый URL для проверки перезарядки - /tests/cooldown/
      const response = await apiClient.get(`/tests/cooldown/${testType}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке перезарядки теста:', error);
      // Возвращаем значение по умолчанию, если произошла ошибка
      return { in_cooldown: false };
    }
  }
};
