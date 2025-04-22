
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface TestProgressProps {
  current: number;
  total: number;
}

const TestProgress: React.FC<TestProgressProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Прогресс теста</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default TestProgress;
