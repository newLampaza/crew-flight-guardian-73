
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Feedback, FeedbackSubmission } from "@/types/feedback";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_API = "/api/feedback";

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

  const { data: feedbackHistory = [], isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      console.log("Fetching feedback from:", FEEDBACK_API);
      try {
        const { data } = await api.get<Feedback[]>(FEEDBACK_API);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
      }
    }
  });

  const submitFeedback = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      console.log("Submitting feedback:", feedback);
      console.log("POST request to:", FEEDBACK_API);
      
      try {
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
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Feedback submitted successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      
      // Only show toast for manual submissions (with comments)
      if (data.comments && data.comments.trim() !== "") {
        toast({
          title: "Отзыв отправлен",
          description: "Спасибо за ваш отзыв!"
        });
      } else {
        console.log("Auto-feedback submitted silently for flight:", data.entity_id);
      }
    },
    onError: (error: any) => {
      console.error("Error submitting feedback:", error);
      
      if (error.response?.status === 409) {
        // Don't show toast for automatic submissions
        if (error.config?.data && JSON.parse(error.config.data).comments !== "") {
          toast({
            title: "Отзыв уже существует",
            description: "Вы уже оставили отзыв для этого объекта",
            variant: "default"
          });
        }
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
