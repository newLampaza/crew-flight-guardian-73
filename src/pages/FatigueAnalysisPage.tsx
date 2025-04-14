
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  LineChart as LineChartIcon,
  Activity,
  BarChart,
  Camera,
  AlertCircle,
  CheckCircle,
  Battery,
  ThumbsUp,
  ThumbsDown
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

// Sample data for charts
const weeklyFatigueData = [
  { day: "Пн", physical: 58, mental: 52, emotional: 45 },
  { day: "Вт", physical: 62, mental: 58, emotional: 50 },
  { day: "Ср", physical: 65, mental: 60, emotional: 55 },
  { day: "Чт", physical: 70, mental: 65, emotional: 60 },
  { day: "Пт", physical: 68, mental: 63, emotional: 58 },
  { day: "Сб", physical: 65, mental: 60, emotional: 55 },
  { day: "Вс", physical: 60, mental: 55, emotional: 50 }
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
  const [aiRating, setAiRating] = useState<string | null>(null);
  
  const startRealTimeAnalysis = () => {
    setIsRealTimeAnalysisActive(true);
    
    // Simulate analysis completion after 3 seconds
    setTimeout(() => {
      setIsRealTimeAnalysisActive(false);
      
      toast({
        title: "Анализ завершен",
        description: "Анализ усталости в реальном времени завершен",
      });
    }, 3000);
  };
  
  const handleAiFeedback = (rating: string) => {
    setAiRating(rating);
    
    toast({
      title: "Оценка записана",
      description: "Спасибо за вашу оценку алгоритма",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Анализ усталости</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Начать анализ
              <Activity className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Анализ усталости</DialogTitle>
              <DialogDescription>
                Выберите тип анализа усталости для проведения
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto py-4"
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
                className="justify-start h-auto py-4"
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
                  <span className="h-4 w-4 animate-pulse-slow bg-primary rounded-full"></span>
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
        <Card className="md:col-span-2">
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
            <Tabs defaultValue="weekly">
              <TabsList className="mb-4">
                <TabsTrigger value="weekly">Неделя</TabsTrigger>
                <TabsTrigger value="monthly">Месяц</TabsTrigger>
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
                        dataKey="physical" 
                        name="Физическая" 
                        stroke="#0ea5e9" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mental" 
                        name="Умственная" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emotional" 
                        name="Эмоциональная" 
                        stroke="#f97316" 
                        strokeWidth={2} 
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
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-primary" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="h-36 w-36 rounded-full flex items-center justify-center relative"
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
          
          <Card>
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
          
          <Card>
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
    </div>
  );
};

export default FatigueAnalysisPage;
