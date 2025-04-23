
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestCardProps {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon?: React.ReactNode;
  lastResult?: {
    status: string;
    score: number;
    date: string;
    inCooldown?: boolean;
    cooldownEnd?: string;
  } | null;
  mode?: 'default' | 'compact';
  onStartTest: (id: string) => void;
  onViewResults?: (id: string) => void;
  showResultsButton?: boolean;
}

export const TestCard: React.FC<TestCardProps> = ({
  id,
  name,
  description,
  duration,
  icon = <Brain className="h-5 w-5" />,
  lastResult,
  mode = 'default',
  onStartTest,
  onViewResults,
  showResultsButton = true,
}) => {
  const isInCooldown = lastResult?.inCooldown ?? false;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden",
      mode === 'compact' ? 'border-l-4' : '',
      lastResult && `border-l-4 ${
        lastResult.status === 'passed' ? 'border-l-green-500' :
        lastResult.status === 'warning' ? 'border-l-yellow-500' :
        'border-l-red-500'
      }`
    )}>
      <CardHeader className={mode === 'compact' ? 'p-4' : undefined}>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{name}</span>
          {lastResult && (
            <Badge className={cn("ml-auto", getStatusColor(lastResult.status))}>
              {lastResult.score}%
            </Badge>
          )}
        </CardTitle>
        {mode !== 'compact' && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent className={mode === 'compact' ? 'p-4 pt-0' : undefined}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>{duration}</span>
        </div>
        
        {isInCooldown && lastResult?.cooldownEnd && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700">
              Перерыв между попытками: 1 минута
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className={cn(
        "flex gap-2 flex-wrap",
        mode === 'compact' ? 'p-4 pt-0' : undefined
      )}>
        <Button
          variant="outline"
          onClick={() => onStartTest(id)}
          disabled={isInCooldown}
        >
          Начать тест
        </Button>
        
        {showResultsButton && onViewResults && lastResult && (
          <Button
            variant="ghost"
            onClick={() => onViewResults(id)}
          >
            Подробнее
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
