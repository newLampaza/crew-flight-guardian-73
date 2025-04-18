
import React from 'react';
import { Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  loading: boolean;
  message: string;
  percent: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ 
  loading, 
  message, 
  percent 
}) => {
  if (!loading) return null;
  
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-background/80 backdrop-blur p-8 rounded-2xl shadow-lg min-w-[300px] text-center border border-border/50">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-lg">{message}</h3>
          <Progress value={percent} className="h-2 mt-3" />
          <p className="mt-2 text-muted-foreground">{percent}% завершено</p>
        </div>
      </div>
    </div>
  );
};
