
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface TestProgressProps {
  timeLimit: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  timeLimit,
  onTimeUp,
  isPaused = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, onTimeUp, isPaused]);

  useEffect(() => {
    setProgress((timeRemaining / timeLimit) * 100);
  }, [timeRemaining, timeLimit]);

  // Форматирование времени в мм:сс
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Оставшееся время:</span>
        <span className={timeRemaining < 30 ? "text-red-500 font-bold" : ""}>{formatTime(timeRemaining)}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
