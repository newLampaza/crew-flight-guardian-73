
import React from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface Flight {
  flight_id?: number;
  from_code?: string;
  to_code?: string;
  departure_time?: string;
  video_path?: string;
}

interface FlightAnalyzerProps {
  lastFlight: Flight | null;
  onAnalyzeFlight: () => void;
  formatDate: (dateString?: string) => string;
}

export const FlightAnalyzer: React.FC<FlightAnalyzerProps> = ({
  lastFlight,
  onAnalyzeFlight,
  formatDate
}) => {
  return (
    <div className="p-6 border rounded-lg transition-all duration-200 border-border">
      <div className="flex items-center gap-3 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Анализ последнего рейса</h3>
      </div>
      
      {lastFlight && (
        <div className="mb-4 text-muted-foreground">
          <p>{lastFlight.from_code || 'N/A'} → {lastFlight.to_code || 'N/A'}</p>
          <p className="text-sm">({formatDate(lastFlight.departure_time)})</p>
        </div>
      )}
      
      <Button 
        onClick={onAnalyzeFlight}
        disabled={!lastFlight?.video_path}
        className="w-full"
      >
        Проанализировать
      </Button>
    </div>
  );
};
