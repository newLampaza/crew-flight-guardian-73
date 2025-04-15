
import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Camera, Brain, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    level: string;
    score: number;
    percent: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setCameraError(null);
    setAnalysisProgress(0);
    setAnalysisPhase("Инициализация камеры");
    chunksRef.current = [];

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user"
        }
      });

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set up media recorder
      const options = { mimeType: 'video/webm; codecs=vp9' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        processVideoAnalysis(blob);
      };

      // Progress update - Camera initialized
      setAnalysisProgress(20);
      setAnalysisPhase("Запись видео");
      
      // Start recording
      mediaRecorderRef.current.start(100);

      // Record for 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      }, 10000);

    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Не удалось получить доступ к камере. Пожалуйста, убедитесь, что камера подключена и разрешения предоставлены.");
      setIsAnalyzing(false);
    }
  };

  const processVideoAnalysis = async (videoBlob: Blob) => {
    try {
      // Update progress
      setAnalysisProgress(40);
      setAnalysisPhase("Обработка видео");
      
      // Create form data
      const formData = new FormData();
      formData.append('video', videoBlob, `fatigue_analysis_${Date.now()}.webm`);

      // Simulate analysis progress
      setAnalysisProgress(60);
      setAnalysisPhase("Анализ нейросетью");
      
      // Simulate API call to neural network
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysisProgress(80);
      
      // In a real implementation, this would be an actual API call
      // const response = await fetch('/api/fatigue/analyze', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // Simulate response from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(100);
      setAnalysisPhase("Анализ завершен");
      
      // Mock result based on neural_network/predict.py expected output
      const mockResult = {
        level: Math.random() > 0.6 ? "Medium" : Math.random() > 0.5 ? "High" : "Low",
        score: Math.random().toFixed(2),
        percent: (Math.random() * 100).toFixed(1)
      };
      
      // Update state with analysis result
      setTimeout(() => {
        setAnalysisResult({
          level: mockResult.level,
          score: parseFloat(mockResult.score),
          percent: parseFloat(mockResult.percent)
        });
        setIsAnalyzing(false);
        
        toast({
          title: "Анализ завершен",
          description: `Уровень усталости: ${mockResult.level} (${mockResult.percent}%)`,
        });
      }, 500);
      
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisPhase("Ошибка анализа");
      setTimeout(() => {
        setIsAnalyzing(false);
        toast({
          title: "Ошибка",
          description: "Не удалось выполнить анализ усталости. Пожалуйста, попробуйте снова.",
          variant: "destructive",
        });
      }, 1000);
    }
  };

  // Format status level to Russian
  const formatLevel = (level: string) => {
    switch(level) {
      case "Low": return "Низкий";
      case "Medium": return "Средний";
      case "High": return "Высокий";
      default: return "Неизвестно";
    }
  };

  // Get status color based on fatigue level
  const getLevelColor = (level: string) => {
    switch(level) {
      case "Low": return "text-green-500";
      case "Medium": return "text-amber-500";
      case "High": return "text-rose-500";
      default: return "text-slate-500";
    }
  };

  // Get status background color
  const getLevelBgColor = (level: string) => {
    switch(level) {
      case "Low": return "bg-green-50";
      case "Medium": return "bg-amber-50";
      case "High": return "bg-rose-50";
      default: return "bg-slate-50";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Главная</h1>
            <p className="text-muted-foreground">
              Обзор состояния и показателей безопасности полетов
            </p>
          </div>
          
          <Button 
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isAnalyzing ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-pulse" />
                Анализ...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Анализ усталости
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Допуск к полету */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Допуск к полету
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
                      strokeDashoffset={351.8583 - (351.8583 * 70) / 100}
                      className="text-amber-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold">70%</span>
                    <span className="text-xs block text-muted-foreground">Готовность</span>
                  </div>
                </div>
                
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                      <span>Условный допуск</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Рекомендуется повторное прохождение когнитивных тестов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Последний анализ усталости */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Последний анализ усталости
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className={`rounded-full p-6 ${getLevelBgColor(analysisResult.level)}`}>
                    <span className={`text-3xl font-bold ${getLevelColor(analysisResult.level)}`}>
                      {analysisResult.percent}%
                    </span>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${getLevelColor(analysisResult.level)}`}>
                      {formatLevel(analysisResult.level)} уровень усталости
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Обновлено только что
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Нет данных анализа</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Нажмите "Анализ усталости" для начала
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional cards would go here */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle>Предстоящие рейсы</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Нет запланированных рейсов
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis dialog */}
        <Dialog open={isAnalyzing} onOpenChange={(open) => {
          if (!open && mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsAnalyzing(false);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{analysisPhase}</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-6 space-y-6">
              {cameraError ? (
                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-red-500">{cameraError}</p>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <Progress value={analysisProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {analysisProgress}% завершено
                    </p>
                  </div>
                  
                  {analysisProgress < 40 && (
                    <div className="w-full max-w-sm overflow-hidden rounded-lg">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline
                        className="w-full h-auto" 
                      />
                    </div>
                  )}
                  
                  {analysisProgress >= 40 && (
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      <Brain className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Index;
