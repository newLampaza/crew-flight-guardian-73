
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart as LineChartIcon,
  Activity,
  BarChart,
  Camera,
  AlertCircle,
  CheckCircle,
  Battery,
  Star,
  Play,
  Volume2,
  Maximize2,
  MoreVertical,
  X
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
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Sample data for charts
const weeklyFatigueData = [
  { day: "Пн", fatigue: 45 },
  { day: "Вт", fatigue: 62 },
  { day: "Ср", fatigue: 65 },
  { day: "Чт", fatigue: 70 },
  { day: "Пт", fatigue: 68 },
  { day: "Сб", fatigue: 65 },
  { day: "Вс", fatigue: 60 }
];

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
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [systemRating, setSystemRating] = useState(3);
  const [analysisId] = useState("#96");
  const [accuracyPercent] = useState(56);
  const [fatigueLevel] = useState("Medium");
  
  const startRealTimeAnalysis = () => {
    setIsRealTimeAnalysisActive(true);
    
    // Simulate analysis completion after 5 seconds
    setTimeout(() => {
      setIsRealTimeAnalysisActive(false);
      setShowResultsDialog(true);
      
      toast({
        title: "Анализ завершен",
        description: "Анализ усталости в реальном времени завершен",
      });
    }, 5000);
  };
  
  const handleSystemRating = (rating: number) => {
    setSystemRating(rating);
  };
  
  const handleSubmitRating = () => {
    toast({
      title: "Оценка отправлена",
      description: "Благодарим за оценку системы",
    });
    setShowResultsDialog(false);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Анализ усталости</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="transition-all duration-300 transform hover:scale-105">
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
                className="justify-start h-auto py-4 transition-all duration-300 hover:bg-accent"
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
                className="justify-start h-auto py-4 transition-all duration-300 hover:bg-accent"
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
                <div className="w-full">
                  <div className="text-center mb-4 text-sm font-medium">Анализ видеопотока нейросетью</div>
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Загрузка модели...</span>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "100%" }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Анализ видео...</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "65%" }}></div>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <div className="relative w-full max-w-sm h-32 bg-muted rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                          <div className="text-xs text-muted-foreground">00:08 / 00:15</div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => {}}>Отмена</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Analysis Results Dialog */}
        <AlertDialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex justify-between items-center">
                <span>Результаты анализа</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowResultsDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ID анализа:</span>
                <span className="font-bold">{analysisId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Уровень усталости:</span>
                <span className="font-bold text-amber-500">{fatigueLevel}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Точность модели:</span>
                <div className="relative h-16 w-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="2"></circle>
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      className="stroke-blue-500" 
                      strokeWidth="2" 
                      strokeDasharray={`${100} 100`}
                      strokeDashoffset={100 - accuracyPercent}
                      transform="rotate(-90 18 18)"
                    ></circle>
                    <text x="18" y="18" dominantBaseline="middle" textAnchor="middle" className="text-lg font-bold">
                      {accuracyPercent}%
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Оценка системы:</span>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => handleSystemRating(star)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= systemRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="w-full">
                <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src="/lovable-uploads/c12cc756-223f-4842-bb4e-64f07f9e3843.png" 
                    alt="Анализ видео" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white/80">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="text-xs bg-black/60 text-white px-2 py-1 rounded-md">00:00 / 00:02</div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white/80">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white/80">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white/80">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <AlertDialogFooter className="gap-2">
              <Button onClick={handleSubmitRating}>Отправить оценку</Button>
              <Button variant="outline" onClick={() => setShowResultsDialog(false)}>
                Закрыть
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 hover-card transition-transform duration-300">
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
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="mb-4 w-full sm:w-auto justify-start">
                <TabsTrigger value="weekly" className="transition-all">Неделя</TabsTrigger>
                <TabsTrigger value="monthly" className="transition-all">Месяц</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weeklyFatigueData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="fatigue" 
                        name="Общая усталость" 
                        stroke="#0ea5e9" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly">
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
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="hover-card transition-transform duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-primary" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="h-36 w-36 rounded-full flex items-center justify-center relative overflow-hidden"
                >
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      className="stroke-muted" 
                      strokeWidth="4"
                    ></circle>
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      className="stroke-amber-500" 
                      strokeWidth="4" 
                      strokeDasharray="100"
                      strokeDashoffset="35"
                      transform="rotate(-90 18 18)"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
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
          
          <Card className="hover-card transition-transform duration-300">
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
                    <Bar 
                      dataKey="fatigue" 
                      name="Уровень усталости" 
                      fill="hsl(var(--primary))" 
                      animationDuration={1000}
                    />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FatigueAnalysisPage;
