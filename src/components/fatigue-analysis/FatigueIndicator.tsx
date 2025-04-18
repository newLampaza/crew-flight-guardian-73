
import React from 'react';

interface IndicatorProps {
  id: number;
  name: string;
  value: number | string;
  status: "success" | "warning" | "error";
  icon: React.ElementType;
  change: string;
  details: string;
}

interface FatigueIndicatorProps {
  indicator: IndicatorProps;
}

export const FatigueIndicator: React.FC<FatigueIndicatorProps> = ({ indicator }) => {
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

  const Icon = indicator.icon;
  
  return (
    <div className="hover:shadow-lg transition-all duration-200">
      <div className="pt-6 px-6 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`${getStatusBg(indicator.status)} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${getStatusColor(indicator.status)}`} />
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
      </div>
    </div>
  );
};
