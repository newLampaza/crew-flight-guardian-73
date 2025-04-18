import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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

const STAR_LABELS = [
  'Очень плохо',
  'Плохо',
  'Удовлетворительно', 
  'Хорошо', 
  'Отлично'
];

const FeedbackPage = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [flightRating, setFlightRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText || flightRating === 0) {
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
    setFlightRating(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Отзывы о полетах</h1>
      
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="mb-4 w-full flex-wrap">
          <TabsTrigger value="submit" className="flex-1">Отправить отзыв</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">История отзывов</TabsTrigger>
        </TabsList>
        
        <TabsContent value="submit" className="space-y-4 animate-fade-in">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
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
                  <div className="flex justify-center space-x-1 sm:space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div 
                        key={star}
                        className="relative cursor-pointer transition-transform hover:scale-110 group"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                      >
                        <button
                          type="button"
                          onClick={() => setFlightRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 sm:h-10 sm:w-10 ${
                              star <= (hoveredStar || flightRating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300"
                            } transition-colors duration-200`}
                          />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
                          {STAR_LABELS[star - 1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <Label htmlFor="comment">Комментарий к полету</Label>
                    <Badge className="bg-status-warning text-white">
                      Уровень усталости: Средний (63%)
                    </Badge>
                  </div>
                  <Textarea
                    id="comment"
                    placeholder="Опишите особенности полета, любые нештатные ситуации или проблемы"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={5}
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 hover:scale-[1.02]"
                >
                  Отправить отзыв
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 animate-fade-in">
          {feedbackHistory.map((feedback) => (
            <Card key={feedback.id} className="hover-card transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start flex-wrap gap-2">
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
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span>{feedback.route}</span>
                  <span className="hidden sm:inline text-xs">•</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {feedback.date}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-left">{feedback.comment}</p>
                
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
