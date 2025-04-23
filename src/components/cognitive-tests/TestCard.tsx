import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, Calendar, BarChart, Timer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TestCardProps {
  id: string;
  name: string;
  description: string;
  duration: string;
  lastResult?: {
    status: string;
    score: number;
    date: string;
    errors: string[];
    inCooldown?: boolean;
    cooldownEnd?: string;
  };
  icon: React.ReactNode;
  onStartTest: (testId: string) => void;
  onViewResults: (testId: string) => void;
  mode?: 'compact' | 'full';
  showResultsButton?: boolean;
}

export const TestCard: React.FC<TestCardProps> = ({
  id,
  name,
  description,
  duration,
  lastResult,
  icon,
  onStartTest,
  onViewResults,
  mode = 'full',
  showResultsButton = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-status-good";
      case "warning": return "text-status-warning";
      case "failed": return "text-status-danger";
      default: return "text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "passed": return "Пройден";
      case "warning": return "Требуется повторный тест";
      case "failed": return "Не пройден";
      default: return "Нет данных";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle className="h-5 w-5 text-status-good" />;
      case "warning": return <Clock className="h-5 w-5 text-status-warning" />;
      case "failed": return <XCircle className="h-5 w-5 text-status-danger" />;
      default: return null;
    }
  };

  const formatCooldownTime = (cooldownEnd?: string) => {
    if (!cooldownEnd) return null;
    
    const cooldownDate = new Date(cooldownEnd);
    const now = new Date();
    
    if (cooldownDate <= now) return null;
    
    const diffMs = cooldownDate.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    return `${diffMinutes} мин.`;
  };

  const cooldownTime = lastResult?.cooldownEnd ? formatCooldownTime(lastResult.cooldownEnd) : null;

  if (mode === 'compact') {
    const isLocked = lastResult?.inCooldown === true && Boolean(cooldownTime);
    return (
      <div className="relative">
        <Card className={`hover-card transition-all duration-300 animate-fade-in ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {icon}
                {name}
              </CardTitle>
              {lastResult && (
                <Badge 
                  variant={
                    lastResult.status === "passed" ? "outline" : 
                    lastResult.status === "warning" ? "secondary" : 
                    "destructive"
                  }
                >
                  {getStatusText(lastResult.status)}
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Последнее прохождение: {lastResult?.date || 'Нет данных'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-2">
            {lastResult && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Результат:</span>
                  <span className="font-bold">{lastResult.score}%</span>
                </div>
                <Progress value={lastResult.score} className="h-2" />
              </div>
            )}
            
            {lastResult?.inCooldown === true && cooldownTime && (
              <div className="flex items-center justify-between text-amber-500">
                <span className="flex items-center text-sm">
                  <Timer className="h-4 w-4 mr-1" /> 
                  Перезарядка:
                </span>
                <span className="text-sm font-medium">{cooldownTime}</span>
              </div>
            )}
            
            {lastResult?.errors && lastResult.errors.length > 0 && (
              <Alert variant={lastResult.status === "warning" ? "warning" : "destructive"}>
                <AlertTitle>Обнаружены ошибки</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {lastResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button 
              onClick={() => onViewResults(id)}
              variant="outline"
              className="flex-1"
            >
              Подробнее
            </Button>
            <Button 
              onClick={() => onStartTest(id)}
              className="flex-1 transition-all duration-300 hover:scale-[1.02]"
              disabled={isLocked}
            >
              {isLocked ? "Недоступен" : "Пройти тест"}
            </Button>
          </CardFooter>
        </Card>
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 z-10 rounded-lg">
            <Timer className="h-6 w-6 text-amber-400 mb-1" />
            <span className="text-sm text-amber-200">Доступно через {cooldownTime}</span>
          </div>
        )}
      </div>
    );
  }

  const isLocked = lastResult?.inCooldown === true && Boolean(cooldownTime);
  return (
    <div className="relative">
      <Card className={`hover-card transition-all duration-300 animate-fade-in ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
        <CardHeader>
          <div className="flex items-start gap-2">
            <div className="mt-1 p-2 rounded-full bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Длительность:</span>
            <Badge variant="outline" className="font-medium">
              <Clock className="h-3 w-3 mr-1" /> {duration}
            </Badge>
          </div>
          {lastResult && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Последний результат:</span>
              <div className="flex items-center">
                {getStatusIcon(lastResult.status)}
                <span className={`ml-1 text-sm ${getStatusColor(lastResult.status)}`}>
                  {getStatusText(lastResult.status)}
                </span>
              </div>
            </div>
          )}
          {lastResult?.inCooldown === true && cooldownTime && (
            <div className="flex items-center justify-between mt-2 text-amber-500">
              <span className="flex items-center text-sm">
                <Timer className="h-4 w-4 mr-1" />
                Перезарядка:
              </span>
              <span className="text-sm font-medium">{cooldownTime}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-2 flex-wrap">
          {showResultsButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewResults(id)}
            >
              Результаты
            </Button>
          )}
          <Button 
            onClick={() => onStartTest(id)}
            size="sm"
            disabled={isLocked}
          >
            {isLocked ? "Недоступен" : "Начать тест"}
          </Button>
        </CardFooter>
      </Card>
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/70 z-10 rounded-lg">
          <Timer className="h-8 w-8 text-amber-400 mb-2" />
          <span className="text-base text-amber-200">Доступно через {cooldownTime}</span>
        </div>
      )}
    </div>
  );
};
