
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Feedback, FeedbackSubmission } from "@/types/feedback";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_API = "/api/feedback";

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedbackHistory = [], isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
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

  const submitFeedback = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      const { data } = await axios.post(FEEDBACK_API, feedback);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за ваш отзыв!"
      });
    },
    onError: (error: any) => {
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
