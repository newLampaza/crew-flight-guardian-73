
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Feedback, FeedbackSubmission } from "@/types/feedback";
import { useToast } from "@/hooks/use-toast";

// The API endpoint matches the backend route in routes.py
const FEEDBACK_API = "/api/feedback";

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching feedback history
  const { data: feedbackHistory = [], isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      console.log("Fetching feedback from:", FEEDBACK_API);
      try {
        const { data } = await axios.get<Feedback[]>(FEEDBACK_API);
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
      const { data } = await axios.post(FEEDBACK_API, feedback);
      return data;
    },
    onSuccess: () => {
      // Invalidate the feedback query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв!"
      });
    },
    onError: (error: any) => {
      console.error("Error submitting feedback:", error);
      
      toast({
        title: "Ошибка отправки",
        description: error.response?.data?.error || "Произошла ошибка при отправке отзыва",
        variant: "destructive"
      });
    }
  });

  return {
    feedbackHistory: Array.isArray(feedbackHistory) ? feedbackHistory : [],
    isLoading,
    error,
    submitFeedback: submitFeedback.mutate
  };
}
