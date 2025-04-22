
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Feedback, FeedbackSubmission } from "@/types/feedback";
import { useToast } from "@/hooks/use-toast";

// The API endpoint matches the backend route in routes.py
const FEEDBACK_API = "/api/feedback";

// Настройка axios для обработки CORS
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("fatigue-guard-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching feedback history
  const { data: feedbackHistory = [], isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      console.log("Fetching feedback from:", FEEDBACK_API);
      try {
        const { data } = await api.get<Feedback[]>(FEEDBACK_API);
        // Ensure we always return an array, even if the API returns something else
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
      }
    }
  });

  // Mutation for submitting new feedback
  const submitFeedback = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      console.log("Submitting feedback:", feedback);
      console.log("POST request to:", FEEDBACK_API);
      
      try {
        // Отправляем в формате, совместимом с бэкендом
        const requestData = {
          entity_type: feedback.entityType,
          entity_id: feedback.entityId,
          rating: feedback.rating,
          comments: feedback.comments
        };
        
        console.log("Sending formatted data:", requestData);
        const response = await api.post(FEEDBACK_API, requestData);
        console.log("Success response:", response.data);
        return response.data;
      } catch (error) {
        console.error("POST request failed with error:", error);
        // Re-throw the error so it's handled by onError
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Feedback submitted successfully:", data);
      // Invalidate the feedback query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв!"
      });
    },
    onError: (error: any) => {
      console.error("Error submitting feedback:", error);
      
      // Check if it's a 409 Conflict (feedback already exists)
      if (error.response?.status === 409) {
        toast({
          title: "Отзыв уже существует",
          description: "Вы уже оставили отзыв для этого объекта",
          variant: "warning"
        });
      } else {
        toast({
          title: "Ошибка отправки",
          description: error.response?.data?.error || "Произошла ошибка при отправке отзыва",
          variant: "destructive"
        });
      }
    }
  });

  return {
    feedbackHistory: Array.isArray(feedbackHistory) ? feedbackHistory : [],
    isLoading,
    error,
    submitFeedback: submitFeedback.mutate
  };
}
