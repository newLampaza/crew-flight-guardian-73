import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  AreaChart,
  PieChart,
  Pie,
  Cell
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
  HistoryIcon,
  Star,
  X
} from "lucide-react";

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

const FatigueAnalysisPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'realtime' | 'flight' | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [cameraError, setCameraError] = useState('');
  const [recording, setRecording] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [lastFlight, setLastFlight] = useState<Flight | null>({
    flight_id: 1,
    from_code: "SVO",
    to_code: "LED",
    departure_time: "2023-04-15T10:30:00",
    video_path: "/path/to/video.mp4"
  });
  
  const [analysisProgress, setAnalysisProgress] = useState({
    loading: false,
    message: '',
    percent: 0,
  });
  
  const starLabels = [
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

  const startAnalysis = () => {
    setAnalysisMode('realtime');
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

      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      setCameraError('Для анализа требуется доступ к камере');
      toast({
        title: "Ошибка доступа к камере",
        description: (error as Error).message?.toString() || 'Неизвестная ошибка',
        variant: "destructive",
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

      setAnalysisProgress(p => ({...p, percent: 60}));
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
            analysis_id: Math.floor(Math.random() * 1000),
            fatigue_level: Math.random() > 0.5 ? "Высокий" : "Средний",
            neural_network_score: 0.65 + (Math.random() * 0.2 - 0.1),
            analysis_date: new Date().toISOString(),
            video_path: "sample_video.mp4",
            resolution: "640x480",
            fps: 30
          });
          
        }, 500);
      }, 2000);
    } catch (error) {
      setAnalysisProgress({loading: false, message: '', percent: 0});
      toast({
        title: "Ошибка анализа",
        description: (error as Error).message || 'Неизвестная ошибка',
        variant: "destructive",
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
            analysis_id: Math.floor(Math.random() * 1000),
            fatigue_level: "Средний",
            neural_network_score: 0.55,
            analysis_date: new Date().toISOString(),
            from_code: lastFlight?.from_code,
            to_code: lastFlight?.to_code
          });
          
        }, 500);
      }, 2000);

    } catch (error) {
      setAnalysisProgress({loading: false, message: '', percent: 0});
      toast({
        title: "Ошибка анализа рейса",
        description: (error as Error).message || 'Неизвестная ошибка',
        variant: "destructive",
      });
    }
  };

  const submitFeedback = async () => {
    if (!analysisResult?.analysis_id) {
      toast({
        title: "Ошибка",
        description: "Не выбран анализ для оценки",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Успешно",
        description: "Отзыв сохранен",
      });
      setAnalysisResult(null);
      
    } catch (error) {
      toast({
        title: "Ошибка отправки отзыва",
        description: (error as Error).message || 'Неизвестная ошибка',
        variant: "destructive",
      });
    }
  };

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
    if (value > 0.7) return "bg-rose-500";
    if (value > 0.4) return "bg-amber-500";
    return "bg-emerald-500";
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
          onClick={startAnalysis} 
          disabled={isAnalyzing}
          variant="gradient"
          className="relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform scale-0 rounded-full bg-white/10 group-hover:scale-100 group-hover:opacity-50"></span>
          {isAnalyzing ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-pulse" />
              Анализ...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-5 w-5" />
              Начать анализ
            </>
          )}
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
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Повышенная усталость</h4>
                    <p className="text-sm text-muted-foreground">
                      Рекомендуется сделать перерыв 15-20 минут перед следующим полетом
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <Coffee className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Режим отдыха</h4>
                    <p className="text-sm text-muted-foreground">
                      Запланируйте полноценный 8-часовой сон в ближайшие сутки
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={analysisMode !== null} onOpenChange={(open) => !open && setAnalysisMode(null)}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Выберите тип анализа</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Выберите метод для оценки вашего текущего состояния
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className={`border rounded-xl bg-card hover:bg-accent/5 transition-colors ${analysisMode === 'realtime' ? 'ring-2 ring-primary' : ''} overflow-hidden`}>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-500/10">
                    <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-lg">Реальный анализ</h3>
                </div>
                <p className="text-sm text-muted-foreground pb-3">
                  Анализ в режиме реального времени с использованием камеры
                </p>
              </div>
              
              <div className="p-4">
                {recording ? (
                  <Button 
                    variant="destructive" 
                    onClick={stopRecording} 
                    className="w-full mb-3"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Остановить запись
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording} 
                    variant="gradient"
                    className="w-full mb-3"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {analysisResult ? 'Повторить запись' : 'Начать запись (30 сек)'}
                  </Button>
                )}
                
                {analysisMode === 'realtime' && (
                  <div className="relative h-48 bg-muted/20 dark:bg-muted/10 rounded-lg overflow-hidden">
                    {recording ? (
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                            <span className="w-2 h-2 mr-1 rounded-full bg-rose-500 animate-pulse"></span>
                            REC
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Нажмите "Начать запись"</p>
                      </div>
                    )}
                  </div>
                )}
                
                {cameraError && (
                  <div className="p-3 mt-3 text-sm bg-destructive/10 text-destructive rounded-md">
                    {cameraError}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`border rounded-xl bg-card hover:bg-accent/5 transition-colors ${analysisMode === 'flight' ? 'ring-2 ring-primary' : ''} overflow-hidden`}>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-500/10">
                    <HistoryIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium text-lg">Анализ последнего рейса</h3>
                </div>
                <p className="text-sm text-muted-foreground pb-3">
                  Анализ на основе данных вашего последнего полета
                </p>
              </div>
              
              <div className="p-4">
                {lastFlight && (
                  <div className="p-3 mb-3 bg-muted/20 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Маршрут:</span>
                      <span className="text-sm font-semibold">{lastFlight.from_code} → {lastFlight.to_code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Время вылета:</span>
                      <span className="text-sm">{formatDate(lastFlight.departure_time)}</span>
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={analyzeFlight}
                  disabled={!lastFlight?.flight_id}
                  variant="gradient" 
                  className="w-full"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Проанализировать
                </Button>
              </div>
            </div>
          </div>
          
          {analysisProgress.loading && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{analysisProgress.message}</span>
                <span className="text-sm font-mono">{analysisProgress.percent}%</span>
              </div>
              <Progress 
                value={analysisProgress.percent} 
                className="h-2"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!analysisResult} onOpenChange={(open) => !open && setAnalysisResult(null)}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Результаты анализа</DialogTitle>
            <DialogDescription>
              Анализ #{analysisResult?.analysis_id || 'неизвестно'} от {formatDate(analysisResult?.analysis_date)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-card/50">
                <span className="text-sm text-muted-foreground mb-1">Уровень усталости</span>
                <span className={`text-2xl font-bold ${
                  analysisResult?.fatigue_level === 'Высокий' ? 'text-rose-500' : 
                  analysisResult?.fatigue_level === 'Средний' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {analysisResult?.fatigue_level || 'Нет данных'}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-card/50">
                <span className="text-sm text-muted-foreground mb-1">Точность модели</span>
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
                      strokeDasharray={226}
                      strokeDashoffset={226 - (226 * (analysisResult?.neural_network_score || 0))}
                      className={getProgressStatus(analysisResult?.neural_network_score)}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-lg font-bold">
                      {Math.round((analysisResult?.neural_network_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-5 bg-card/50">
              <h4 className="font-medium mb-4 text-center">Оценка анализа</h4>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star}
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setFeedbackScore(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-all duration-300 ${
                        star <= (hoveredStar || feedbackScore) 
                          ? 'fill-yellow-400 text-yellow-400 scale-110' 
                          : 'text-gray-300'
                      }`}
                    />
                    <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium bg-background border shadow-md px-3 py-1.5 rounded">
                      {starLabels[star - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {analysisResult?.video_path && (
              <div className="border rounded-lg p-5 bg-card/50">
                <h4 className="font-medium mb-3">Видеозапись</h4>
                <div className="aspect-video bg-muted rounded-md">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Видео недоступно в демо-режиме</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Разрешение: {analysisResult.resolution}</span>
                  <span>FPS: {analysisResult.fps}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button variant="outline" onClick={() => setAnalysisResult(null)}>Закрыть</Button>
              <Button variant="gradient" onClick={submitFeedback}>Отправить оценку</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAnalyzing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Выполняется анализ</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <Brain className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
            </div>
            <p className="mt-4 text-sm text-center text-muted-foreground">
              Анализ биометрических показателей<br />и уровня усталости
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FatigueAnalysisPage;
