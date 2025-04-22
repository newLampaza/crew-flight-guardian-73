
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

interface AnalysisResult {
  analysis_id?: number;
  fatigue_level?: string;
  neural_network_score?: number;
  analysis_date?: string;
  feedback_score?: number;
  video_path?: string;
  from_code?: string;
  to_code?: string;
  resolution?: string;
  fps?: number;
}

interface Flight {
  flight_id?: number;
  from_code?: string;
  to_code?: string;
  departure_time?: string;
  video_path?: string;
}

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("fatigue-guard-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const useFatigueAnalysis = (onSuccess?: (result: AnalysisResult) => void) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState({
    loading: false,
    message: '',
    percent: 0,
  });

  // Использование форматирования даты с сервера, клиент только отображает
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const submitRecording = async (blob: Blob) => {
    try {
      setAnalysisProgress({
        loading: true,
        message: 'Обработка видео...',
        percent: 20,
      });

      if (!blob || blob.size === 0) {
        throw new Error('Записанное видео слишком короткое или повреждено');
      }

      const formData = new FormData();
      formData.append('video', blob, `recording_${Date.now()}.webm`);

      // Установка интервала для обновления прогресса (имитация)
      const interval = setInterval(() => {
        setAnalysisProgress(p => ({
          ...p,
          percent: Math.min(p.percent + 1, 95),
          message: p.percent < 40 ? 'Загрузка на сервер...' : 'Анализ нейросетью...'
        }));
      }, 100);

      try {
        // Реальный запрос к API для анализа
        const response = await api.post('/api/fatigue/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setAnalysisProgress(p => ({
                ...p,
                percent: Math.min(40 + percentCompleted * 0.4, 95),
              }));
            }
          },
        });

        clearInterval(interval);
        setAnalysisProgress({ loading: false, message: '', percent: 0 });

        if (response.data) {
          // Используем данные, полученные с сервера
          setAnalysisResult(response.data);
          if (onSuccess) onSuccess(response.data);
        }
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    } catch (error) {
      setAnalysisProgress({loading: false, message: '', percent: 0});
      toast({
        title: "Ошибка анализа",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  const analyzeFlight = async (lastFlight?: Flight | null) => {
    try {
      if (!lastFlight?.flight_id) {
        throw new Error('Не указан ID рейса для анализа');
      }

      setAnalysisProgress({
        loading: true,
        message: 'Отправка запроса...',
        percent: 20,
      });

      // Установка интервала для обновления прогресса (имитация)
      const interval = setInterval(() => {
        setAnalysisProgress(p => ({
          ...p,
          percent: Math.min(p.percent + 1, 95),
          message: p.percent < 50 ? 'Поиск видео рейса...' : 'Анализ нейросетью...'
        }));
      }, 100);

      try {
        // Реальный запрос к API для анализа
        const response = await api.post('/api/fatigue/analyze-flight', { 
          flight_id: lastFlight.flight_id 
        });

        clearInterval(interval);
        setAnalysisProgress({ loading: false, message: '', percent: 0 });

        if (response.data) {
          // Используем данные, полученные с сервера
          setAnalysisResult(response.data);
          if (onSuccess) onSuccess(response.data);
        }
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    } catch (error) {
      setAnalysisProgress({loading: false, message: '', percent: 0});
      toast({
        title: "Ошибка анализа рейса",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  return {
    analysisResult,
    setAnalysisResult,
    analysisProgress,
    submitRecording,
    analyzeFlight,
    formatDate
  };
};
