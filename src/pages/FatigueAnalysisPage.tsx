
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Scale
} from "lucide-react";

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

const FatigueAnalysisPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Анализ завершен",
        description: "Обновлены показатели усталости",
      });
    }, 3000);
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

      {/* Диалог анализа */}
      <Dialog open={isAnalyzing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выполняется анализ</DialogTitle>
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
