
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Feedback, FeedbackSubmission } from "@/types/feedback";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_API = "/api/feedback";

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedbackHistory = [], isLoading } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data } = await axios.get<Feedback[]>(FEEDBACK_API);
      return data;
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
    feedbackHistory,
    isLoading,
    submitFeedback: submitFeedback.mutate
  };
}
