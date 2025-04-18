
import React from 'react';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface AnalysisResultProps {
  analysisResult: {
    analysis_id?: number;
    fatigue_level?: string;
    neural_network_score?: number;
    analysis_date?: string;
    video_path?: string;
    from_code?: string;
    to_code?: string;
  };
  feedbackScore: number;
  setFeedbackScore: (score: number) => void;
  onClose: () => void;
  onSubmitFeedback: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysisResult,
  feedbackScore,
  setFeedbackScore,
  onClose,
  onSubmitFeedback
}) => {
  const getFatigueLevel = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Нет данных';
    }
  };
  
  const getFatigueLevelClass = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <span className="text-muted-foreground">ID анализа:</span>
        <strong>#{analysisResult.analysis_id || 'неизвестно'}</strong>
      </div>
      
      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <span className="text-muted-foreground">Уровень усталости:</span>
        <strong className={getFatigueLevelClass(analysisResult.fatigue_level)}>
          {getFatigueLevel(analysisResult.fatigue_level)}
        </strong>
      </div>

      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <span className="text-muted-foreground">Точность модели:</span>
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={226.1946}
              strokeDashoffset={226.1946 - (226.1946 * (analysisResult.neural_network_score || 0))}
              className={cn(
                'transition-all duration-1000',
                (analysisResult.neural_network_score || 0) > 0.7 ? 'text-rose-500' : 
                (analysisResult.neural_network_score || 0) > 0.4 ? 'text-amber-500' : 
                'text-emerald-500'
              )}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-lg font-bold">
              {Math.round((analysisResult.neural_network_score || 0) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <span className="text-muted-foreground">Оценка системы:</span>
        <StarRating currentRating={feedbackScore} onRatingChange={setFeedbackScore} />
      </div>

      {analysisResult.video_path && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Запись:</h4>
          <video 
            controls 
            src={analysisResult.video_path}
            className="w-full rounded-md bg-black aspect-video"
          />
        </div>
      )}

      <div className="flex justify-end mt-6 gap-2">
        <Button variant="outline" onClick={onClose}>
          Закрыть
        </Button>
        <Button onClick={onSubmitFeedback}>
          Отправить оценку
        </Button>
      </div>
    </div>
  );
};
