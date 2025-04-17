import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { toast } from "@/components/ui/use-toast";
import { 
  Brain, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  BatteryMedium,
  Timer,
  Eye,
  Coffee,
  LineChart as LineChartIcon,
  FlaskConical,
  Scale,
  Video,
  History,
  Star
} from "lucide-react";
import axios from "axios";

// Sample data
const monthlyFatigueData = [
  { date: "1 апр", усталость: 45, внимательность: 85, сон: 75 },
  { date: "4 апр", усталость: 50, внимательность: 80, сон: 70 },
  { date: "7 апр", усталость: 55, внимательность: 75, сон: 65 },
  { date: "10 апр", усталость: 60, внимательность: 70, сон: 60 },
  { date: "13 апр", усталость: 65, внимательность: 65, сон: 55 },
  { date: "16 апр", усталость: 60, внимательность: 70, сон: 65 },
  { date: "19 апр", усталость: 55, внимательность: 75, сон: 70 },
  { date: "22 апр", усталость: 50, внимательность: 80, сон: 75 },
  { date: "25 апр", усталость: 55, внимательность: 75, сон: 70 },
  { date: "28 апр", усталость: 62, внимательность: 68, сон: 65 },
  { date: "30 апр", усталость: 68, внимательность: 62, сон: 60 }
];

const indicators = [
  { 
    id: 1, 
    name: "Уровень усталости", 
    value: 65, 
    status: "warning",
    icon: BatteryMedium,
    change: "+5%",
    details: "Повышенный уровень усталости"
  },
  { 
    id: 2, 
    name: "Время бодрствования", 
    value: "14ч 30м", 
    status: "warning",
    icon: Timer,
    change: "+2ч",
    details: "Выше рекомендуемой нормы"
  },
  { 
    id: 3, 
    name: "Концентрация внимания", 
    value: 78, 
    status: "success",
    icon: Eye,
    change: "-2%",
    details: "В пределах нормы"
  },
  { 
    id: 4, 
    name: "Качество сна", 
    value: "6ч 15м", 
    status: "error",
    icon: Coffee,
    change: "-1ч 45м",
    details: "Ниже рекомендуемой нормы"
  }
];

// Sample history data
const sampleHistoryData = [
  { analysis_id: 1, neural_network_score: 0.65, analysis_date: "15 апр 2025, 14:30" },
  { analysis_id: 2, neural_network_score: 0.48, analysis_date: "12 апр 2025, 09:15" },
  { analysis_id: 3, neural_network_score: 0.72, analysis_date: "8 апр 2025, 18:22" },
  { analysis_id: 4, neural_network_score: 0.35, analysis_date: "5 апр 2025, 11:45" },
];

// Type definitions
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

const STAR_LABELS = [
  'Очень плохо',
  'Плохо',
  'Удовлетворительно',
  'Хорошо',
  'Отлично'
];

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

const FatigueAnalysisPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [analysisMode, setAnalysisMode] = useState<'realtime' | 'flight' | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [historyData, setHistoryData] = useState<AnalysisResult[]>(sampleHistoryData);
  const [lastFlight, setLastFlight] = useState<Flight | null>({
    flight_id: 1,
    from_code: "SVO",
    to_code: "LED",
    departure_time: "2025-04-15T14:30:00",
    video_path: "/videos/test.mp4"
  });
  const [cameraError, setCameraError] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  
  const [analysisProgress, setAnalysisProgress] = useState({
    loading: false,
    message: '',
    percent: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-emerald-500";
      case "warning": return "text-amber-500";
      case "error": return "text-rose-500";
      default: return "text-slate-500";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "success": return "bg-emerald-50 dark:bg-emerald-500/10";
      case "warning": return "bg-amber-50 dark:bg-amber-500/10";
      case "error": return "bg-rose-50 dark:bg-rose-500/10";
      default: return "bg-slate-50 dark:bg-slate-500/10";
    }
  };

  const getProgressStatus = (score?: number) => {
    const value = score || 0;
    if (value > 0.7) return "error";
    if (value > 0.4) return "warning";
    return "success";
  };

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

      // Автоматически прекращаем запись через 30 секунд
      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.stop();
        }
      }, 30000);

    } catch (error) {
      setCameraError('Для анализа требуется доступ к камере');
      toast({
        title: "Ошибка доступа к камере",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
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

      // Имитация запроса к API
      // В реальной ситуации это был бы настоящий запрос
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
          
          // Мок-данные результата анализа
          setAnalysisResult({
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            fatigue_level: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString()),
            video_path: '/videos/test.mp4'
          });
          
          // Добавляем анализ в историю
          setHistoryData(prev => [{
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString())
          }, ...prev]);
          
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

      // Имитация запроса к API
      // В реальной ситуации это был бы настоящий запрос
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
          
          // Мок-данные результата анализа
          setAnalysisResult({
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            fatigue_level: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString()),
            from_code: lastFlight?.from_code,
            to_code: lastFlight?.to_code,
            video_path: lastFlight?.video_path
          });
          
          // Добавляем анализ в историю
          setHistoryData(prev => [{
            analysis_id: Math.floor(Math.random() * 1000) + 1,
            neural_network_score: Math.random(),
            analysis_date: formatDate(new Date().toISOString())
          }, ...prev]);
          
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

  const submitFeedback = async () => {
    if (!analysisResult?.analysis_id) {
      toast({
        title: "Ошибка",
        description: "Не выбран анализ для оценки",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Имитация отправки отзыва
      // await axios.post('/api/fatigue/feedback', {
      //   analysis_id: analysisResult.analysis_id,
      //   score: feedbackScore
      // });
      
      toast({
        title: "Отзыв сохранен",
        description: `Спасибо за вашу оценку: ${feedbackScore} из 5`
      });
      setAnalysisResult(null);
      
    } catch (error) {
      toast({
        title: "Ошибка отправки отзыва",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Анализ усталости</h1>
          <p className="text-muted-foreground">
            Мониторинг состояния и оценка работоспособности
          </p>
        </div>

        <Button 
          onClick={() => setAnalysisMode('realtime')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Brain className="mr-2 h-4 w-4" />
          Начать анализ
          {recording && <span className="recording-indicator">● Запись</span>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicators.map((indicator) => (
          <Card key={indicator.id} className="hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`${getStatusBg(indicator.status)} p-3 rounded-lg`}>
                  <indicator.icon className={`h-6 w-6 ${getStatusColor(indicator.status)}`} />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm ${
                    indicator.change.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {indicator.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {indicator.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {typeof indicator.value === 'number' ? `${indicator.value}%` : indicator.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {indicator.details}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Динамика показателей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyFatigueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorУсталость" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorВнимательность" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorСон" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="усталость"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#colorУсталость)"
                  />
                  <Area
                    type="monotone"
                    dataKey="внимательность"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorВнимательность)"
                  />
                  <Area
                    type="monotone"
                    dataKey="сон"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorСон)"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={351.8583}
                      strokeDashoffset={351.8583 - (351.8583 * 65) / 100}
                      className="text-amber-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold">65%</span>
                    <span className="text-xs block text-muted-foreground">Усталость</span>
                  </div>
                </div>
                
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                      <span>Требует внимания</span>
                    </div>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>Обновлено 5 мин назад</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                История анализов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyData.slice(0, 3).map((item) => (
                  <div key={item.analysis_id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        (item.neural_network_score || 0) > 0.7 ? 'bg-rose-500' : 
                        (item.neural_network_score || 0) > 0.4 ? 'bg-amber-500' : 
                        'bg-emerald-500'
                      }`} />
                      <span className="text-sm">{item.analysis_date}</span>
                    </div>
                    <span className="font-medium">
                      {Math.round((item.neural_network_score || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно выбора типа анализа */}
      <Dialog open={analysisMode !== null} onOpenChange={() => setAnalysisMode(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold">Выберите тип анализа</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-2">
            <div className={`p-6 border rounded-lg transition-all duration-200 ${analysisMode === 'realtime' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Реальный анализ</h3>
              </div>
              
              {recording ? (
                <Button variant="destructive" onClick={stopRecording} className="w-full">
                  Остановить запись
                  {recording && <span className="ml-2 inline-block animate-pulse text-white">●</span>}
                </Button>
              ) : (
                <Button onClick={startRecording} className="w-full">
                  {analysisResult ? 'Повторить запись' : 'Начать запись (30 сек)'}
                </Button>
              )}
              
              {analysisMode === 'realtime' && (
                <div className="mt-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full rounded-md bg-black aspect-video"
                    style={{ display: recording ? 'block' : 'none' }}
                  />
                </div>
              )}
              
              {cameraError && (
                <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {cameraError}
                </div>
              )}
            </div>

            <div className={`p-6 border rounded-lg transition-all duration-200 ${analysisMode === 'flight' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <History className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Анализ последнего рейса</h3>
              </div>
              
              {lastFlight && (
                <div className="mb-4 text-muted-foreground">
                  <p>{lastFlight.from_code || 'N/A'} → {lastFlight.to_code || 'N/A'}</p>
                  <p className="text-sm">({formatDate(lastFlight.departure_time)})</p>
                </div>
              )}
              
              <Button 
                onClick={analyzeFlight}
                disabled={!lastFlight?.video_path}
                className="w-full"
              >
                Проанализировать
              </Button>
            </div>
          </div>
          
          {/* Analysis loading overlay - keep the same design as in the example */}
          {analysisProgress.loading && (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-[4px] z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[300px] text-center">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-lg">{analysisProgress.message}</h3>
                  <Progress value={analysisProgress.percent} className="h-2 mt-3" />
                  <p className="mt-2 text-muted-foreground">{analysisProgress.percent}% завершено</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results dialog - keep the existing design but adjust styling to better match example */}
      <Dialog open={analysisResult !== null} onOpenChange={(open) => !open && setAnalysisResult(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Результаты анализа</DialogTitle>
          </DialogHeader>
          
          {analysisResult && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-muted-foreground">ID анализа:</span>
                <strong>#{analysisResult.analysis_id || 'неизвестно'}</strong>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-muted-foreground">Уровень усталости:</span>
                <strong className={`
                  ${analysisResult.fatigue_level?.toLowerCase() === 'high' ? 'text-rose-500' : 
                    analysisResult.fatigue_level?.toLowerCase() === 'medium' ? 'text-amber-500' : 
                    'text-emerald-500'}
                `}>
                  {analysisResult.fatigue_level === 'High' ? 'Высокий' : 
                   analysisResult.fatigue_level === 'Medium' ? 'Средний' : 
                   analysisResult.fatigue_level === 'Low' ? 'Низкий' : 
                   'Нет данных'}
                </strong>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-muted-foreground">Точность модели:</span>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={226.1946}
                      strokeDashoffset={226.1946 - (226.1946 * (analysisResult.neural_network_score || 0))}
                      className={`
                        ${(analysisResult.neural_network_score || 0) > 0.7 ? 'text-rose-500' : 
                          (analysisResult.neural_network_score || 0) > 0.4 ? 'text-amber-500' : 
                          'text-emerald-500'} 
                        transition-all duration-1000
                      `}
                    />
                  </svg>
