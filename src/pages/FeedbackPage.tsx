
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown, Star, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Sample feedback data
const feedbackHistory = [
  {
    id: "1",
    flightNumber: "SU-1703",
    route: "Москва - Ростов-на-Дону",
    date: "12 апреля 2025",
    rating: 4,
    comment: "Полет прошел без происшествий. Экипаж работал слаженно. Незначительная турбулентность в середине маршрута.",
    fatigueLevel: "Низкий"
  },
  {
    id: "2",
    flightNumber: "SU-1704",
    route: "Ростов-на-Дону - Москва",
    date: "12 апреля 2025",
    rating: 3,
    comment: "Задержка вылета на 20 минут из-за погодных условий. Повышенная нагрузка при посадке в сложных метеоусловиях.",
    fatigueLevel: "Средний"
  },
  {
    id: "3",
    flightNumber: "SU-1532",
    route: "Москва - Казань",
    date: "9 апреля 2025",
    rating: 5,
    comment: "Отличные погодные условия, штатная работа всех систем. Перелет прошел гладко.",
    fatigueLevel: "Низкий"
  }
];

const FeedbackPage = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [satisfaction, setSatisfaction] = useState<"satisfied" | "neutral" | "dissatisfied" | null>(null);
  const [fatigueRating, setFatigueRating] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText || !satisfaction || !fatigueRating) {
      toast({
        title: "Ошибка отправки",
        description: "Пожалуйста, заполните все поля формы",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would submit to an API
    toast({
      title: "Отзыв отправлен",
      description: "Благодарим за ваш отзыв о полете",
    });
    
    // Reset form
    setFeedbackText("");
    setSatisfaction(null);
    setFatigueRating("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Отзывы о полетах</h1>
      
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="submit">Отправить отзыв</TabsTrigger>
          <TabsTrigger value="history">История отзывов</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Отзыв о текущем полете
              </CardTitle>
              <CardDescription>
                Рейс SU-1492, Москва - Санкт-Петербург, 15 апреля 2025
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Общая оценка полета</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={satisfaction === "satisfied" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSatisfaction("satisfied")}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Хорошо
                    </Button>
                    <Button
                      type="button"
                      variant={satisfaction === "neutral" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSatisfaction("neutral")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Нормально
                    </Button>
                    <Button
                      type="button"
                      variant={satisfaction === "dissatisfied" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSatisfaction("dissatisfied")}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Сложно
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Уровень усталости по окончании полета</Label>
                  <RadioGroup value={fatigueRating} onValueChange={setFatigueRating}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="r1" />
                      <Label htmlFor="r1">Низкий</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="r2" />
                      <Label htmlFor="r2">Средний</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="r3" />
                      <Label htmlFor="r3">Высокий</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-high" id="r4" />
                      <Label htmlFor="r4">Очень высокий</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comment">Комментарий к полету</Label>
                  <Textarea
                    id="comment"
                    placeholder="Опишите особенности полета, любые нештатные ситуации или проблемы"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Отправить отзыв</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {feedbackHistory.map((feedback) => (
            <Card key={feedback.id} className="hover-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">
                    {feedback.flightNumber}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>{feedback.route}</span>
                  <span className="text-xs">•</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {feedback.date}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{feedback.comment}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Уровень усталости:</span>
                  <Badge 
                    variant={
                      feedback.fatigueLevel === "Низкий" ? "outline" : 
                      feedback.fatigueLevel === "Средний" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {feedback.fatigueLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackPage;
