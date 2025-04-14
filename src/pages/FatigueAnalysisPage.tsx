
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  LineChart as LineChartIcon,
  Activity,
  BarChart,
  Camera,
  AlertCircle,
  CheckCircle,
  Battery,
  Star,
  Loader,
  Zap,
  BrainCircuit,
  Scan
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
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  { name: "Короткие", fatigue: 45, fill: "#38bdf8" },
  { name: "Средние", fatigue: 60, fill: "#0ea5e9" },
  { name: "Дальние", fatigue: 75, fill: "#0369a1" }
];

const statusBreakdown = [
  { name: "Нормальный", value: 60, color: "hsl(var(--status-good))" },
  { name: "Повышенный", value: 25, color: "hsl(var(--status-warning))" },
  { name: "Критический", value: 15, color: "hsl(var(--status-danger))" }
];

const FatigueAnalysisPage = () => {
  const [isRealTimeAnalysisActive, setIsRealTimeAnalysisActive] = useState(false);
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
        variant: "success"
      });
      
      // Show results dialog
      setShowResultDialog(true);
    }, 3000);
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

  const getFatigueStatusBg = (level: number) => {
    if (level < 50) return "var(--status-good)";
    if (level < 70) return "var(--status-warning)";
    return "var(--status-danger)";
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
                  <ChartContainer 
                    className="h-full" 
                    config={{
                      fatigue: {
                        theme: {
                          light: "#0ea5e9",
                          dark: "#38bdf8"
                        }
                      }
                    }}
                  >
                    <AreaChart
                      data={monthlyFatigueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-fatigue)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-fatigue)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="fatigue" 
                        name="Усталость" 
                        stroke="var(--color-fatigue)" 
                        fillOpacity={1} 
                        fill="url(#colorFatigue)" 
                        strokeWidth={2}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ChartContainer>
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
                  className="h-36 w-36 rounded-full flex items-center justify-center relative transition-all duration-500 overflow-hidden"
                  style={{
                    background: `conic-gradient(hsl(var(--status-warning)) 65%, #f3f4f6 0)`
                  }}
                >
                  <div className="h-32 w-32 rounded-full bg-background flex items-center justify-center flex-col">
                    <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold">65%</span>
                      <span className="text-xs text-muted-foreground">Усталость</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4 mt-2">
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
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart
                    data={flightTypeData}
                    margin={{ top: 15, right: 10, left: 0, bottom: 10 }}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.4} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar 
                      dataKey="fatigue" 
                      name="Уровень усталости" 
                      radius={[4, 4, 0, 0]}
                    >
                      {flightTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Распределение статусов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return percent > 0.15 ? (
                          <text
                            x={x}
                            y={y}
                            fill="#ffffff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Распределение']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      align="center" 
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
            <div className="py-10 flex flex-col items-center justify-center space-y-8">
              <div className="relative w-40 h-40">
                <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-30"></div>
                <div className="absolute inset-0 rounded-full border-8 border-primary border-opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-8 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                
                <div className="absolute inset-0 flex items-center justify-center flex-col space-y-2">
                  <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
                  <Scan className="h-8 w-8 text-primary/70" />
                </div>
              </div>
              
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold">Анализ видео...</h2>
                <p className="text-muted-foreground">
                  Нейросеть анализирует признаки усталости
                </p>
                
                <div className="flex items-center justify-center space-x-1 pt-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
              
              <Alert variant="info" className="bg-blue-50/50 border-blue-100">
                <AlertTitle className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Обработка данных
                </AlertTitle>
                <AlertDescription>
                  Алгоритм нейросети анализирует более 30 признаков усталости, включая мимику, движения глаз и положение головы.
                </AlertDescription>
              </Alert>
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
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#f3f4f6" 
                          strokeWidth="10"
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke={`hsl(${getFatigueStatusBg(analysisResult.level)})`}
                          strokeWidth="10" 
                          strokeDasharray={`${analysisResult.level * 2.83} 283`}
                          strokeDashoffset="0" 
                          strokeLinecap="round" 
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-1000 ease-out"
                        />
                        <text 
                          x="50" 
                          y="45" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className={`${getFatigueStatusColor(analysisResult.level)} text-3xl font-bold`}
                          style={{ fontSize: '18px' }}
                        >
                          {analysisResult.level}%
                        </text>
                        <text 
                          x="50" 
                          y="60" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className="text-xs text-muted-foreground"
                          style={{ fontSize: '10px' }}
                        >
                          Усталость
                        </text>
                      </svg>
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
