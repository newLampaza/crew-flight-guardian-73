
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Star, Clock, AlertCircle } from "lucide-react";
import { StarRating } from "@/components/fatigue-analysis/StarRating";
import { useFeedback } from "@/hooks/useFeedback";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useFlights } from "@/hooks/useFlights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FeedbackPage = () => {
  const [feedbackText, setFeedbackText] = useState("");
  const [flightRating, setFlightRating] = useState(0);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  const { feedbackHistory, isLoading, submitFeedback } = useFeedback();
  const { data: flights = [], isLoading: flightsLoading } = useFlights();

  // Check if feedback already exists for this flight
  const hasExistingFeedback = (flightId: number) => {
    return feedbackHistory.some(feedback => 
      feedback.entityId === flightId && feedback.type === 'flight'
    );
  };

  // Используем первый доступный рейс по умолчанию
  useEffect(() => {
    if (flights?.length > 0 && !selectedFlightId) {
      // Find first flight without feedback
      const availableFlight = flights.find(flight => !hasExistingFeedback(flight.flight_id));
      setSelectedFlightId(availableFlight ? availableFlight.flight_id : flights[0].flight_id);
    }
  }, [flights, feedbackHistory]);

  const currentFlight = flights?.find(f => f.flight_id === selectedFlightId);
  const flightInfo = currentFlight 
    ? `${currentFlight.from_code} - ${currentFlight.to_code}`
    : "Загрузка...";
  
  // Check if the currently selected flight already has feedback
  const currentFlightHasFeedback = selectedFlightId ? hasExistingFeedback(selectedFlightId) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText || flightRating === 0 || !selectedFlightId) {
      return;
    }
    
    submitFeedback({
      entityType: "flight",
      entityId: selectedFlightId,
      rating: flightRating,
      comments: feedbackText
    });
    
    setFeedbackText("");
    setFlightRating(0);
  };

  const getFeedbackStatusColor = (rating: number) => {
    if (rating >= 4) return "bg-status-good text-white";
    if (rating >= 3) return "bg-status-warning text-white";
    return "bg-status-error text-white";
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Отзыв о полете
              </CardTitle>
              <CardDescription className="space-y-4">
                {!flightsLoading && flights.length > 0 ? (
                  <Select
                    value={selectedFlightId?.toString() || ""}
                    onValueChange={(value) => setSelectedFlightId(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите рейс" />
                    </SelectTrigger>
                    <SelectContent>
                      {flights.map((flight) => (
                        <SelectItem 
                          key={flight.flight_id} 
                          value={flight.flight_id.toString()}
                          disabled={hasExistingFeedback(flight.flight_id)}
                        >
                          {flight.from_code} - {flight.to_code} {hasExistingFeedback(flight.flight_id) ? "(отзыв отправлен)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>{flightInfo}</div>
                )}
              </CardDescription>
            </CardHeader>
            
            {currentFlightHasFeedback && (
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Отзыв уже существует</AlertTitle>
                  <AlertDescription>
                    Вы уже оставили отзыв для этого рейса. Пожалуйста, выберите другой рейс.
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Общая оценка полета</Label>
                  <StarRating
                    currentRating={flightRating}
                    onRatingChange={setFlightRating}
                  />
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
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!feedbackText || flightRating === 0 || currentFlightHasFeedback}
                >
                  Отправить отзыв
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 animate-fade-in">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="space-y-4">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : feedbackHistory.length > 0 ? (
            feedbackHistory.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <CardTitle className="text-xl">
                      {feedback.entityInfo}
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
                    <Clock className="h-3 w-3" />
                    {format(new Date(feedback.date), "d MMMM yyyy", { locale: ru })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{feedback.comments}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/50 rounded-lg">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">История отзывов пуста</h3>
              <p className="text-muted-foreground">
                У вас пока нет отправленных отзывов
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackPage;
