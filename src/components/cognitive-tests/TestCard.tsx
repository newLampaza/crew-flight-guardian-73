
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Brain, ActivitySquare, MousePointer } from "lucide-react";

interface TestCardProps {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  lastResult?: {
    status: 'passed' | 'warning' | 'failed';
    score: number;
    date: string;
    errors: string[];
  };
  onStartTest: (testId: string) => void;
  onViewResults: (testId: string) => void;
}

const TestCard: React.FC<TestCardProps> = ({
  id,
  name,
  description,
  duration,
  icon,
  lastResult,
  onStartTest,
  onViewResults,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "failed": return "text-red-500";
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

  return (
    <Card className="hover:shadow-md transition-all duration-300">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Последний результат:</span>
              <span className={`text-sm ${getStatusColor(lastResult.status)}`}>
                {getStatusText(lastResult.status)}
              </span>
            </div>
            <Progress value={lastResult.score} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewResults(id)}
        >
          Результаты
        </Button>
        <Button 
          size="sm"
          onClick={() => onStartTest(id)}
        >
          Начать тест
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestCard;
