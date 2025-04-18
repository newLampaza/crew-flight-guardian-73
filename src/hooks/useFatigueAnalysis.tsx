
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

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

export const useFatigueAnalysis = (onSuccess?: (result: AnalysisResult) => void) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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

      // Имитация запроса к API в демонстрационных целях
      // В реальном приложении здесь был бы настоящий запрос к API
      // const response = await axios.post('/api/fatigue/analyze', formData);
      
      setAnalysisProgress({
        loading: true,
        message: 'Анализ нейросетью...',
        percent: 80,
      });
  
      // Имитация прогресса анализа
      const interval = setInterval(() => {
        setAnalysisProgress(p => ({
          ...p,
          percent: Math.min(p.percent + 1, 95),
        }));
      }, 100);
  
      // Окончание анализа (имитация)
      setTimeout(() => {
        clearInterval(interval);
        setAnalysisProgress(p => ({...p, percent: 100}));
        setTimeout(() => {
          setAnalysisProgress({loading: false, message: '', percent: 0});
          
          // Мок-данные результата анализа для демонстрации
          const mockResult = {
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            fatigue_level: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString()),
            video_path: '/videos/test.mp4'
          };
          
          setAnalysisResult(mockResult);
          if (onSuccess) onSuccess(mockResult);
          
        }, 500);
      }, 2000);
      
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
      setAnalysisProgress({
        loading: true,
        message: 'Обработка видео...',
        percent: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(p => ({...p, percent: 40, message: 'Загрузка на сервер...'}));

      await new Promise(resolve => setTimeout(resolve, 500));

      // Имитация запроса к API
      // В реальном приложении здесь был бы настоящий запрос к API
      // const response = await axios.post('/api/fatigue/analyze-flight', { flight_id: lastFlight?.flight_id });

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
          
          // Мок-данные результата анализа для демонстрации
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
          
        }, 500);
      }, 2000);

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
