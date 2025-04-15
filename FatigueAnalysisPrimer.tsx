import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Modal, Button, notification, Alert, Progress, Spin  } from 'antd';
import { VideoCameraOutlined, HistoryOutlined, StarFilled, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import './FatigueAnalysis.css';
import { useNavigate } from 'react-router-dom';

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




export const FatigueAnalysis = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [analysisMode, setAnalysisMode] = useState<'realtime' | 'flight' | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [historyData, setHistoryData] = useState<AnalysisResult[]>([]);
  const [lastFlight, setLastFlight] = useState<Flight | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
  const STAR_LABELS = [
    'Очень плохо',
    'Плохо',
    'Удовлетворительно',
    'Хорошо',
    'Отлично'
  ];
  
  const [analysisProgress, setAnalysisProgress] = useState({
    loading: false,
    message: '',
    percent: 0,
  });
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [historyRes, flightRes] = await Promise.all([
          axios.get('/api/fatigue/history'),
          axios.get('/api/flights/last-completed')
        ]);
        
        setHistoryData((historyRes.data || []).map((item: AnalysisResult) => ({
          ...item,
          analysis_date: formatDate(item.analysis_date)
        })));
        
        setLastFlight(flightRes.data || {});
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/login');
        } else {
          notification.error({ 
            message: 'Ошибка загрузки данных',
            description: (error as Error).message?.toString() || 'Неизвестная ошибка'
          });
        }
      }
    };
    
    loadData();
  }, [navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const options = { 
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 2500000
      };

      mediaRecorder.current = new MediaRecorder(stream, options);
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        submitRecording(blob);
        chunks.current = [];
      };

      mediaRecorder.current.start(100);
      setRecording(true);

      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.stop();
        }
      }, 30000);

    } catch (error) {
      setCameraError('Для анализа требуется доступ к камере');
      notification.error({
        message: 'Ошибка доступа к камере',
        description: (error as Error).message?.toString() || 'Неизвестная ошибка'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
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



      const response = await axios.post('/api/fatigue/analyze', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setAnalysisProgress(p => ({
            ...p,
            percent: 40 + Math.floor(percent * 0.4),
          }));
        },
      });

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
  
      // Окончание анализа
      setTimeout(() => {
        clearInterval(interval);
        setAnalysisProgress(p => ({...p, percent: 100}));
        setTimeout(() => {
          setAnalysisProgress({loading: false, message: '', percent: 0});
          setAnalysisResult({
            ...response.data,
            video_path: response.data?.video_path?.toLowerCase() || '',
            resolution: response.data?.resolution || '640x480',
            fps: response.data?.fps || 15
          });
          setHistoryData(prev => [response.data, ...prev]);
        }, 500);
      }, 2000);

      
    } catch (error) {
      let errorMessage = 'Неизвестная ошибка';
      setAnalysisProgress({loading: false, message: '', percent: 0});
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error?.toString() || 
                      error.response?.data?.technical_details?.toString() || 
                      'Ошибка сервера';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      notification.error({
        message: 'Ошибка анализа',
        description: errorMessage
      });
    }
  };

  const analyzeFlight = async () => {

    try {

      setAnalysisProgress({
        loading: true,
        message: 'Обработка видео...',
        percent: 20,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      setAnalysisProgress(p => ({...p, percent: 40, message: 'Загрузка на сервер...'}));

      await new Promise(resolve => setTimeout(resolve, 500));

      const formData = new FormData();
      formData.append('flight_id', lastFlight?.flight_id?.toString() || '');
      
      const response = await axios.post('/api/fatigue/analyze-flight', formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setAnalysisProgress(p => ({
            ...p,
            percent: 40 + Math.floor(percent * 0.4),
          }));
        },
      });

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
          setAnalysisResult({
            ...response.data,
            analysis_date: formatDate(response.data?.analysis_date)
          });
          
          setHistoryData(prev => [response.data, ...prev]);
        }, 500);
      }, 2000);

    } catch (error) {
      let errorMessage = 'Неизвестная ошибка';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate('/login');
          return;
        }
        errorMessage = error.response?.data?.error?.toString() || 'Ошибка сервера';
      }

      notification.error({
        message: 'Ошибка анализа рейса',
        description: errorMessage
      });
    }
  };

  const submitFeedback = async () => {
    if (!analysisResult?.analysis_id) {
      notification.error({ 
        message: 'Ошибка',
        description: 'Не выбран анализ для оценки'
      });
      return;
    }
    
    try {
      await axios.post('/api/fatigue/feedback', {
        analysis_id: analysisResult.analysis_id,
        score: feedbackScore
      });
      
      notification.success({ message: 'Отзыв сохранен' });
      setAnalysisResult(null);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      } else {
        notification.error({ 
          message: 'Ошибка отправки отзыва',
          description: (error as Error).message?.toString() || 'Неизвестная ошибка'
        });
      }
    }
  };

  const getProgressStatus = (score?: number) => {
    const value = score || 0;
    if (value > 0.7) return 'exception';
    if (value > 0.4) return 'active';
    return 'success';
  };

  return (
    <div className="fatigue-container">
      <div className="analysis-controls">
        <Button
          type="primary"
          icon={<VideoCameraOutlined />}
          onClick={() => setAnalysisMode('realtime')}
          size="large"
        >
          Анализ усталости
          {recording && <span className="recording-indicator">● Запись</span>}
        </Button>

        <div className="history-chart">
          <h3>История анализов</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <Line
                type="monotone"
                dataKey="neural_network_score"
                stroke="#1890ff"
                strokeWidth={2}
              />
              <XAxis
                dataKey="analysis_date"
                tickFormatter={(date) => date || 'N/A'}
                reversed={true}
              />
              <YAxis 
                domain={[0, 1]} 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
              />
              <Tooltip
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Усталость']}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Modal
        title="Выберите тип анализа"
        open={!!analysisMode}
        onCancel={() => setAnalysisMode(null)}
        footer={null}
        width={600}
      >
        <div className="mode-selector">
          <div className={`mode-option ${analysisMode === 'realtime' ? 'active' : ''}`}>
            <VideoCameraOutlined className="option-icon" />
            <h3>Реальный анализ</h3>
            {recording ? (
              <Button danger onClick={stopRecording}>
                Остановить запись
              </Button>
            ) : (
              <Button onClick={startRecording}>
                {analysisResult ? 'Повторить запись' : 'Начать запись (30 сек)'}
              </Button>
            )}
            {analysisMode === 'realtime' && (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="video-preview" 
                style={{ display: recording ? 'block' : 'none' }}
              />
            )}
            {cameraError && <Alert message={cameraError} type="error" />}
          </div>

          <div className={`mode-option ${analysisMode === 'flight' ? 'active' : ''}`}>
            <HistoryOutlined className="option-icon" />
            <h3>Анализ последнего рейса</h3>
            {lastFlight && (
              <p>
                {lastFlight.from_code || 'N/A'} → {lastFlight.to_code || 'N/A'} (
                {formatDate(lastFlight.departure_time)})
              </p>
            )}
            <Button 
              onClick={analyzeFlight}
              disabled={!lastFlight?.video_path}
            >
              Проанализировать
            </Button>
          </div>
        </div>
        {analysisProgress.loading && (
          <div className="analysis-overlay">
            <div className="analysis-progress">
              <Spin indicator={antIcon} />
              <div className="progress-text">
                <h3>{analysisProgress.message}</h3>
                <Progress
                  percent={analysisProgress.percent}
                  status="active"
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                  showInfo={false}
                />
                <p>{analysisProgress.percent}% завершено</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      <Modal
        title="Результаты анализа"
        open={!!analysisResult}
        onCancel={() => setAnalysisResult(null)}
        footer={[
          <Button key="feedback" onClick={submitFeedback}>
            Отправить оценку
          </Button>,
          <Button key="close" onClick={() => setAnalysisResult(null)}>
            Закрыть
          </Button>
        ]}
      >
        {analysisResult && (
          <div className="results">
            <div className="result-item">
              <span>ID анализа:</span>
              <strong>#{analysisResult.analysis_id || 'неизвестно'}</strong>
            </div>
            
            <div className="result-item">
              <span>Уровень усталости:</span>
              <strong className={`status-${analysisResult.fatigue_level?.toLowerCase() || 'unknown'}`}>
                {analysisResult.fatigue_level || 'Нет данных'}
              </strong>
            </div>

            <div className="result-item">
              <span>Точность модели:</span>
              <Progress 
                type="circle" 
                percent={Math.round(
                  Math.min(Math.max(analysisResult.neural_network_score || 0, 0), 1) * 100
                )}
                width={80}
                status={getProgressStatus(analysisResult.neural_network_score)}
              />
            </div>

            <div className="result-item">
              <span>Оценка системы:</span>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star}
                    className="star-wrapper"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setFeedbackScore(star)}
                  >
                    <StarFilled
                      className={`
                        ${star <= (hoveredStar || feedbackScore) ? 'text-yellow-400' : 'text-gray-300'}
                        transition-colors
                      `}
                    />
                    <div className="star-tooltip">
                      {STAR_LABELS[star - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {analysisResult.video_path && (
              <div className="video-review">
                <video 
                  controls 
                  src={`/api/videos/${analysisResult.video_path}`}
                  className="video-preview"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
