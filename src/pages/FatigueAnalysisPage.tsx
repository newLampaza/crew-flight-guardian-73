
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  LineChart as LineChartIcon,
  Activity,
  BarChart,
  Camera,
  AlertCircle,
  CheckCircle,
  Battery,
  ThumbsUp,
  ThumbsDown,
  Star,
  Loader
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for charts
const monthlyFatigueData = [
  { date: "1 апр", fatigue: 45 },
  { date: "4 апр", fatigue: 50 },
  { date: "7 апр", fatigue: 55 },
  { date: "10 апр", fatigue: 60 },
  { date: "13 апр", fatigue: 65 },
  { date: "16 апр", fatigue: 60 },
  { date: "19 апр", fatigue: 55 },
  { date: "22 апр", fatigue: 50 },
  { date: "25 апр", fatigue: 55 },
  { date: "28 апр", fatigue: 62 },
  { date: "30 апр", fatigue: 68 }
];

const flightTypeData = [
  { name: "Короткие", fatigue: 45 },
  { name: "Средние", fatigue: 60 },
  { name: "Дальние", fatigue: 75 }
];

const FatigueAnalysisPage = () => {
  const [isRealTimeAnalysisActive, setIsRealTimeAnalysisActive] = useState(false);
  const [aiRating, setAiRating] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    id: "A-22042025-1492",
    level: 65,
    accuracy: 92,
    rating: 0
  });
  const isMobile = useIsMobile();
  
  const startRealTimeAnalysis = () => {
    setIsRealTimeAnalysisActive(true);
    
    // Simulate analysis completion after 3 seconds
    setTimeout(() => {
      setIsRealTimeAnalysisActive(false);
      
      toast({
        title: "Анализ завершен",
        description: "Анализ усталости в реальном времени завершен",
      });
      
      // Show results dialog
      setShowResultDialog(true);
    }, 3000);
  };
  
  const handleAiFeedback = (rating: string) => {
    setAiRating(rating);
    
    toast({
      title: "Оценка записана",
      description: "Спасибо за вашу оценку алгоритма",
    });
  };
  
  const handleStarRating = (rating: number) => {
    setAnalysisResult(prev => ({
      ...prev,
      rating
    }));
  };
  
  const getFatigueStatusColor = (level: number) => {
    if (level < 50) return "text-status-good";
    if (level < 70) return "text-status-warning";
    return "text-status-danger";
  };
  
  return (
    <div className="space-y-6 transition-all duration-300 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold tracking-tight">Анализ усталости</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="transition-all duration-300 hover:scale-105 w-full sm:w-auto">
              Начать анализ
              <Activity className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Анализ усталости</DialogTitle>
              <DialogDescription>
                Выберите тип анализа усталости для проведения
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4 transition-all duration-200 hover:bg-accent/20"
                onClick={startRealTimeAnalysis}
                disabled={isRealTimeAnalysisActive}
              >
                <div className="flex items-start">
                  <Camera className="h-10 w-10 mr-4 text-primary" />
                  <div className="text-left">
                    <h3 className="font-medium">Анализ в реальном времени</h3>
                    <p className="text-sm text-muted-foreground">
                      Использует камеру для анализа признаков усталости на лице
                    </p>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4 transition-all duration-200 hover:bg-accent/20"
              >
                <div className="flex items-start">
                  <BarChart className="h-10 w-10 mr-4 text-primary" />
                  <div className="text-left">
                    <h3 className="font-medium">Анализ завершенного полета</h3>
                    <p className="text-sm text-muted-foreground">
                      Анализирует данные последнего завершенного полета
                    </p>
                  </div>
                </div>
              </Button>
            </div>
            <DialogFooter>
              {isRealTimeAnalysisActive ? (
                <div className="flex items-center space-x-2 text-sm">
                  <Loader className="h-4 w-4 animate-spin text-primary" />
                  <span>Выполняется анализ...</span>
                </div>
              ) : (
                <Button variant="outline" onClick={() => {}}>Отмена</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Динамика усталости
            </CardTitle>
            <CardDescription>
              Изменение показателей усталости со временем
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly">
              <TabsList className="mb-4">
                <TabsTrigger value="monthly">Месяц</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monthly" className="animate-fade-in">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyFatigueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="fatigue" 
                        name="Общая усталость" 
                        stroke="#0ea5e9" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-primary" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="h-36 w-36 rounded-full flex items-center justify-center relative transition-all duration-500"
                  style={{
                    background: `conic-gradient(hsl(var(--status-warning)) 65%, #f3f4f6 0)`
                  }}
                >
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">65%</span>
                    <span className="text-xs text-muted-foreground">Усталость</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-center">
                  <div className="text-sm font-medium">Предупреждения</div>
                  <div className="flex items-center justify-center mt-2">
                    <AlertCircle className="h-5 w-5 text-status-warning" />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium">Статус</div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-status-warning/10 px-2 py-1 text-xs font-medium text-status-warning">
                    Требует внимания
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium">Пригодность</div>
                  <div className="flex items-center justify-center mt-2">
                    <CheckCircle className="h-5 w-5 text-status-good" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Усталость по типам полетов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={flightTypeData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="fatigue" name="Уровень усталости" fill="hsl(var(--primary))" />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Оценка алгоритма</CardTitle>
              <CardDescription>
                Помогите улучшить алгоритм анализа усталости
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Оцените точность анализа вашей усталости:
              </p>
              
              <RadioGroup value={aiRating || ""} className="flex">
                <div className="flex items-center space-x-2 mr-4">
                  <RadioGroupItem 
                    value="accurate" 
                    id="r1" 
                    onClick={() => handleAiFeedback("accurate")}
                  />
                  <Label htmlFor="r1" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Точно
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="inaccurate" 
                    id="r2" 
                    onClick={() => handleAiFeedback("inaccurate")}
                  />
                  <Label htmlFor="r2" className="flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Неточно
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Модальное окно с результатами анализа и индикатором загрузки */}
      <AlertDialog open={isRealTimeAnalysisActive || showResultDialog} onOpenChange={(open) => {
        if (!open && !isRealTimeAnalysisActive) setShowResultDialog(false);
      }}>
        <AlertDialogContent className="max-w-md">
          {isRealTimeAnalysisActive ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-center">Анализ видео...</h2>
              <p className="text-center text-muted-foreground">
                Пожалуйста, подождите. Нейросеть анализирует признаки усталости
              </p>
            </div>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-xl">Результаты анализа усталости</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Анализ успешно завершен
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-6 space-y-6">
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-sm font-medium text-muted-foreground">ID:</span>
                    <span>{analysisResult.id}</span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center">
                    <div 
                      className="h-32 w-32 rounded-full flex items-center justify-center relative transition-all duration-500"
                      style={{
                        background: `conic-gradient(hsl(var(--${analysisResult.level < 50 ? 'status-good' : analysisResult.level < 70 ? 'status-warning' : 'status-danger'})) ${analysisResult.level}%, #f3f4f6 0)`
                      }}
                    >
                      <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center flex-col">
                        <span className={`text-2xl font-bold ${getFatigueStatusColor(analysisResult.level)}`}>
                          {analysisResult.level}%
                        </span>
                        <span className="text-xs text-muted-foreground">Усталость</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-sm font-medium text-muted-foreground">Точность:</span>
                    <span className="text-status-good">{analysisResult.accuracy}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-center text-sm font-medium">Пожалуйста, оцените точность анализа:</p>
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarRating(star)}
                        className="focus:outline-none transition-colors duration-200"
                      >
                        <Star
                          className={`h-6 w-6 sm:h-8 sm:w-8 ${
                            analysisResult.rating >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          } transition-colors duration-200 hover:fill-yellow-400 hover:text-yellow-400`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <AlertDialogFooter className="flex-col space-y-2 sm:space-y-0">
                <div className="order-2 sm:order-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Отправить отзыв
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Отзыв отправлен</h4>
                        <p className="text-sm text-muted-foreground">
                          Спасибо за ваш отзыв! Он поможет улучшить алгоритм анализа усталости.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <AlertDialogAction className="order-1 sm:order-2">OK</AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FatigueAnalysisPage;
