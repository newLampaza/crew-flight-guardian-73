
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
      try {
        const { data } = await api.get<Feedback[]>(FEEDBACK_API);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
      }
    }
  });

  // Helper function to check if feedback exists for a specific entity
  const hasFeedbackForEntity = (entityType: string, entityId: number) => {
    return Array.isArray(feedbackHistory) && feedbackHistory.some(
      feedback => feedback.type === entityType && feedback.entityId === entityId
    );
  };

  const submitFeedback = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      // For automatic submissions (empty comments), check if feedback already exists
      const isAutoSubmission = feedback.comments === "";
      if (isAutoSubmission) {
        // Check if feedback already exists for this entity
        if (hasFeedbackForEntity(feedback.entityType, feedback.entityId)) {
          // Return a mock successful response to avoid triggering the error handler
          return { 
            id: -1, 
            entity_type: feedback.entityType,
            entity_id: feedback.entityId,
            rating: feedback.rating,
            comments: feedback.comments,
            date: new Date().toISOString()
          };
        }
      }
      
      try {
        const requestData = {
          entity_type: feedback.entityType,
          entity_id: feedback.entityId,
          rating: feedback.rating,
          comments: feedback.comments
        };
        
        const response = await api.post(FEEDBACK_API, requestData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      // Only invalidate queries for real submissions (not mock responses from skipped auto-submissions)
      if (data.id !== -1) {
        queryClient.invalidateQueries({ queryKey: ["feedback"] });
      }
      
      // Only show toast for manual submissions (with comments)
      if (data.comments && data.comments.trim() !== "") {
        toast({
          title: "Отзыв отправлен",
          description: "Спасибо за ваш отзыв!"
        });
      }
    },
    onError: (error: any) => {
      // Handle 409 Conflict (feedback already exists)
      if (error.response?.status === 409) {
        // Check if this is an automatic submission (empty comments)
        const isAutoSubmission = error.config?.data ? 
          JSON.parse(error.config.data).comments === "" : false;
        
        if (!isAutoSubmission) {
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
    submitFeedback: submitFeedback.mutate,
    hasFeedbackForEntity
  };
}
