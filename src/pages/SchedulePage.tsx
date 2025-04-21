import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  PlaneTakeoff, 
  PlaneLanding,
  ArrowLeft,
  ArrowRight,
  List,
  LayoutList,
} from "lucide-react";
import "../components/ui/schedule-view.css";
import { useFlights, FlightApi } from "@/hooks/useFlights";
import { useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface Airport {
  airport: string;
  time: string;
  terminal: string;
}

interface Flight {
  id: number | string;
  flightNumber: string;
  departure: Airport;
  arrival: Airport;
  duration: string;
  aircraft: string;
  status: "active" | "upcoming" | "completed" | string;
  conditions?: string;
  crew?: string;
}

const getStatus = (flight: FlightApi): Flight["status"] => {
  const now = new Date();
  const dep = new Date(flight.departure_time);
  const arr = new Date(flight.arrival_time);
  if (dep <= now && arr > now) return "active";
  if (dep > now) return "upcoming";
  if (arr < now) return "completed";
  return "";
};

const getDurationString = (start: string, end: string): string => {
  const d1 = new Date(start); const d2 = new Date(end);
  const totalMin = Math.floor((d2.getTime() - d1.getTime()) / 60000);
  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hr > 0 ? `${hr}ч ` : ""}${min}м`;
};

const prepareFlights = (flights: FlightApi[] | undefined): Flight[] => {
  if (!flights || !Array.isArray(flights)) {
    return [];
  }
  
  return flights.map(f => ({
    id: f.flight_id,
    flightNumber: f.flight_id && f.flight_id.toString().startsWith("SU")
      ? f.flight_id.toString() : (f.crew_name ? `SU${String(f.flight_id).padStart(4, "0")}` : String(f.flight_id)),
    departure: {
      airport: `${f.from_city} (${f.from_code})`,
      time: f.departure_time,
      terminal: "-", // Можно доработать, если появятся терминалы в API
    },
    arrival: {
      airport: `${f.to_city} (${f.to_code})`,
      time: f.arrival_time,
      terminal: "-",
    },
    duration: getDurationString(f.departure_time, f.arrival_time),
    aircraft: f.aircraft,
    status: getStatus(f),
    conditions: f.conditions,
    crew: f.crew_name
  }));
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if formatting fails
  }
};

const formatDateShort = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

const formatWeekday = (date: Date) => {
  return format(date, 'EEEE', { locale: ru });
};

const formatDayMonth = (date: Date) => {
  return format(date, 'd MMMM', { locale: ru });
};

const FlightCard = ({ flight }: { flight: Flight }) => {
  return (
    <div className={`flight-item concise`}>
      <div className="flex justify-between items-center">
        <div className="flight-number">{flight.flightNumber}</div>
        <Badge
          variant={
            flight.status === "active" ? "default" :
            flight.status === "upcoming" ? "secondary" :
            "outline"
          }
          className="text-xs"
        >
          {flight.status === "active" ? "В полёте" :
           flight.status === "upcoming" ? "Планируется" :
           "Выполнен"}
        </Badge>
      </div>
      <div className="flight-time mt-1">{formatDateShort(flight.departure.time)} → {formatDateShort(flight.arrival.time)}</div>
      <div className="flight-route text-muted-foreground">
        {flight.departure.airport} → {flight.arrival.airport}
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { data, isLoading, error } = useFlights();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error("Ошибка загрузки расписания:", error);
      toast({ title: "Ошибка загрузки расписания", description: "Не удалось получить расписание рейсов.", variant: "destructive" });
    }
  }, [error, toast]);

  useEffect(() => {
    console.log("Данные полетов:", data);
  }, [data]);

  const allFlights = useMemo(() => prepareFlights(data), [data]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const flightsByStatus = useMemo(() => {
    const upcoming: Flight[] = [];
    const past: Flight[] = [];
    for (const f of allFlights) {
      if (f.status === "completed") past.push(f);
      else if (f.status === "active" || f.status === "upcoming") upcoming.push(f);
    }
    return { upcoming, past };
  }, [allFlights]);

  const groupFlightsByDay = (flights: Flight[]) => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map(day => {
      const flightsForDay = flights.filter(f => isSameDay(new Date(f.departure.time), day));
      return { date: day, flights: flightsForDay };
    });
  };

  const upcomingFlightsByDay = useMemo(
    () => groupFlightsByDay(flightsByStatus.upcoming),
    [flightsByStatus.upcoming, weekStart, weekEnd]
  );
  const pastFlightsByDay = useMemo(
    () => groupFlightsByDay(flightsByStatus.past),
    [flightsByStatus.past, weekStart, weekEnd]
  );

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setShowCalendar(false);
    }
  };

  return (
    <div className="space-y-6 schedule-container">
      <div className="schedule-header">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Расписание полетов</h1>
        <div className="flex items-center gap-2">
          <div className="month-navigation">
            <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="month-selector">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{format(currentDate, 'LLLL yyyy', { locale: ru })}</span>
                  <span className="sm:hidden">{format(currentDate, 'LLL', { locale: ru })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={handleDateSelect}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Предстоящие рейсы</TabsTrigger>
          <TabsTrigger value="past">Прошедшие рейсы</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="week-view">
            {isLoading ? (
              <div className="text-center w-full py-8">Загрузка...</div>
            ) : upcomingFlightsByDay.map((day, index) => (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="text-sm font-bold">{formatWeekday(day.date)}</div>
                  <div className="text-xs text-muted-foreground">{formatDayMonth(day.date)}</div>
                </div>
                {day.flights.length > 0 ? (
                  <div className="space-y-2">
                    {day.flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Нет рейсов
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="week-view">
            {isLoading ? (
              <div className="text-center w-full py-8">Загрузка...</div>
            ) : pastFlightsByDay.map((day, index) => (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="text-sm font-bold">{formatWeekday(day.date)}</div>
                  <div className="text-xs text-muted-foreground">{formatDayMonth(day.date)}</div>
                </div>
                {day.flights.length > 0 ? (
                  <div className="space-y-2">
                    {day.flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Нет рейсов
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
