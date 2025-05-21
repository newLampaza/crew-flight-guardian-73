
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

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

// Configure axios instance with proper base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Enable sending cookies for cross-origin requests
});

export const useFatigueAnalysis = (onSuccess?: (result: AnalysisResult) => void) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState({
    loading: false,
    message: '',
    percent: 0,
  });

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
      setRecordedBlob(blob);
      setAnalysisProgress({
        loading: true,
        message: 'Обработка видео...',
        percent: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(p => ({...p, percent: 40, message: 'Загрузка на сервер...'}));

      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!blob || blob.size === 0) {
        throw new Error('Записанное видео слишком короткое или повреждено');
      }

      const formData = new FormData();
      formData.append('video', blob, `recording_${Date.now()}.webm`);

      setAnalysisProgress({
        loading: true,
        message: 'Анализ нейросетью...',
        percent: 60,
      });

      console.log('Submitting video to API:', `${API_BASE_URL}/fatigue/analyze`);
      // Реальный запрос к API
      try {
        const response = await apiClient.post('/fatigue/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setAnalysisProgress(p => ({
              ...p,
              percent: 40 + Math.min(percentCompleted / 2, 40), // от 40% до 80%
            }));
          }
        });

        setAnalysisProgress({
          loading: false,
          message: '',
          percent: 100,
        });

        if (response.data) {
          console.log('API Response:', response.data);
          setAnalysisResult(response.data);
          if (onSuccess) onSuccess(response.data);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        toast({
          title: "Ошибка соединения с API",
          description: "Проверьте что сервер запущен на порту 5000. Временно используем демо-данные.",
          variant: "destructive"
        });
        
        // Фолбек - генерируем результат для демо, если API недоступен
        setTimeout(() => {
          setAnalysisProgress({loading: false, message: '', percent: 0});
          
          const mockResult = {
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            fatigue_level: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString()),
            video_path: '/videos/test.mp4'
          };
          
          setAnalysisResult(mockResult);
          if (onSuccess) onSuccess(mockResult);
          
          toast({
            title: "Демо-режим",
            description: "API недоступно по адресу " + API_BASE_URL + ". Запустите Flask сервер на порту 5000.",
            variant: "default"
          });
        }, 1000);
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

  const saveToHistory = async (blob: Blob) => {
    try {
      setAnalysisProgress({
        loading: true,
        message: 'Сохранение записи...',
        percent: 50,
      });

      const formData = new FormData();
      formData.append('video', blob, `history_${Date.now()}.webm`);
      
      try {
        console.log('Saving video to API:', `${API_BASE_URL}/fatigue/save-recording`);
        
        // Сохраняем запись в базу данных
        const response = await apiClient.post('/fatigue/save-recording', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        setAnalysisProgress({loading: false, message: '', percent: 0});
        
        toast({
          title: "Запись сохранена",
          description: "Видео успешно сохранено в базе данных"
        });
        return response.data;
      } catch (apiError) {
        console.error('Save API Error:', apiError);
        setAnalysisProgress({loading: false, message: '', percent: 0});
        
        toast({
          title: "Ошибка сохранения",
          description: "API недоступно по адресу " + API_BASE_URL + ". Запустите Flask сервер на порту 5000.",
          variant: "destructive"
        });
        return null;
      }
      
      
    } catch (error) {
      setAnalysisProgress({loading: false, message: '', percent: 0});
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
      return null;
    }
  };

  const analyzeFlight = async (lastFlight?: Flight | null) => {
    try {
      setAnalysisProgress({
        loading: true,
        message: 'Подготовка к анализу рейса...',
        percent: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(p => ({...p, percent: 40, message: 'Загрузка видео рейса...'}));

      try {
        console.log('Analyzing flight with API:', `${API_BASE_URL}/fatigue/analyze-flight`, lastFlight);
        
        // Реальный запрос к API для анализа последнего рейса
        const response = await apiClient.post('/fatigue/analyze-flight', {
          flight_id: lastFlight?.flight_id,
        });

        setAnalysisProgress({loading: false, message: '', percent: 100});

        console.log('Flight analysis response:', response.data);
        
        if (response.data) {
          setAnalysisResult(response.data);
          if (onSuccess) onSuccess(response.data);
          return;
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        toast({
          title: "Ошибка соединения с API",
          description: "Проверьте что сервер запущен на порту 5000. Временно используем демо-данные.",
          variant: "destructive"
        });
        
        // Фолбек для демо-режима
        setAnalysisProgress({
          loading: true,
          message: 'Анализ нейросетью...',
          percent: 80,
        });

        const interval = setInterval(() => {
          setAnalysisProgress(p => ({
            ...p,
            percent: Math.min(p.percent + 1, 95),
          }));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          setAnalysisProgress(p => ({...p, percent: 100}));
          setTimeout(() => {
            setAnalysisProgress({loading: false, message: '', percent: 0});
            
            const mockResult = {
              analysis_id: Math.floor(Math.random() * 1000) + 1,
              fatigue_level: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
              neural_network_score: Math.random(),
              analysis_date: formatDate(new Date().toISOString()),
              from_code: lastFlight?.from_code,
              to_code: lastFlight?.to_code,
              video_path: lastFlight?.video_path
            };
            
            setAnalysisResult(mockResult);
            if (onSuccess) onSuccess(mockResult);
            
            toast({
              title: "Демо-режим",
              description: "API недоступно по адресу " + API_BASE_URL + ". Запустите Flask сервер на порту 5000.",
              variant: "default"
            });
          }, 500);
        }, 2000);
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
    recordedBlob,
    analysisProgress,
    submitRecording,
    analyzeFlight,
    saveToHistory,
    formatDate
  };
};

