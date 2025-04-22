
import { toast as baseToast } from "./use-toast";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

// Default toast duration in milliseconds
const DEFAULT_DURATION = 5000;

export const toast = {
  // Base toast function
  ...baseToast,
  
  // Standard toast
  default(message: string, title?: string, duration = DEFAULT_DURATION) {
    return baseToast({
      title,
      description: message,
      duration,
      variant: "default",
    });
  },
  
  // Success toast
  success(message: string, title?: string, duration = DEFAULT_DURATION) {
    return baseToast({
      title: title || "Успешно",
      description: message,
      duration,
      variant: "success",
    });
  },
  
  // Error toast
  error(message: string, title?: string, duration = DEFAULT_DURATION) {
    return baseToast({
      title: title || "Ошибка",
      description: message,
      duration,
      variant: "destructive",
    });
  },
  
  // Warning toast
  warning(message: string, title?: string, duration = DEFAULT_DURATION) {
    return baseToast({
      title: title || "Предупреждение",
      description: message,
      duration,
      variant: "warning",
    });
  },
  
  // Info toast
  info(message: string, title?: string, duration = DEFAULT_DURATION) {
    return baseToast({
      title: title || "Информация",
      description: message,
      duration,
      variant: "info",
    });
  },
};

export { useToast } from "./use-toast";
