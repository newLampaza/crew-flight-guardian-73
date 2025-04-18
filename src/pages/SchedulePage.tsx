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

interface Airport {
  airport: string;
  time: string;
  terminal: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  departure: Airport;
  arrival: Airport;
  duration: string;
  aircraft: string;
  status: "active" | "upcoming" | "completed" | string;
}

const upcomingFlights: Flight[] = [
  {
    id: "1",
    flightNumber: "SU-1492",
    departure: {
      airport: "Москва (SVO)",
      time: "2025-04-15T08:30:00",
      terminal: "D"
    },
    arrival: {
      airport: "Санкт-Петербург (LED)",
      time: "2025-04-15T10:50:00",
      terminal: "1"
    },
    duration: "2ч 20м",
    aircraft: "Airbus A320",
    status: "active"
  },
  {
    id: "2",
    flightNumber: "SU-1196",
    departure: {
      airport: "Санкт-Петербург (LED)",
      time: "2025-04-15T12:15:00",
      terminal: "1"
    },
    arrival: {
      airport: "Москва (SVO)",
      time: "2025-04-15T14:35:00",
      terminal: "D"
    },
    duration: "2ч 20м",
    aircraft: "Airbus A320",
    status: "upcoming"
  },
  {
    id: "3",
    flightNumber: "SU-1532",
    departure: {
      airport: "Москва (SVO)",
      time: "2025-04-16T07:45:00",
      terminal: "D"
    },
    arrival: {
      airport: "Казань (KZN)",
      time: "2025-04-16T09:30:00",
      terminal: "1"
    },
    duration: "1ч 45м",
    aircraft: "Airbus A320",
    status: "upcoming"
  },
  {
    id: "6",
    flightNumber: "SU-1533",
    departure: {
      airport: "Казань (KZN)",
      time: "2025-04-17T10:45:00",
      terminal: "1"
    },
    arrival: {
      airport: "Москва (SVO)",
      time: "2025-04-17T12:30:00",
      terminal: "D"
    },
    duration: "1ч 45м",
    aircraft: "Airbus A320",
    status: "upcoming"
  },
  {
    id: "7",
    flightNumber: "SU-1590",
    departure: {
      airport: "Москва (SVO)",
      time: "2025-04-18T13:00:00",
      terminal: "D"
    },
    arrival: {
      airport: "Сочи (AER)",
      time: "2025-04-18T15:30:00",
      terminal: "B"
    },
    duration: "2ч 30м",
    aircraft: "Boeing 737-800",
    status: "upcoming"
  },
  {
    id: "8",
    flightNumber: "SU-1591",
    departure: {
      airport: "Сочи (AER)",
      time: "2025-04-19T16:45:00",
      terminal: "B"
    },
    arrival: {
      airport: "Москва (SVO)",
      time: "2025-04-19T19:15:00",
      terminal: "D"
    },
    duration: "2ч 30м",
    aircraft: "Boeing 737-800",
    status: "upcoming"
  }
];

const pastFlights: Flight[] = [
  {
    id: "4",
    flightNumber: "SU-1703",
    departure: {
      airport: "Москва (SVO)",
      time: "2025-04-12T11:20:00",
      terminal: "D"
    },
    arrival: {
      airport: "Ростов-на-Дону (ROV)",
      time: "2025-04-12T13:40:00",
      terminal: "A"
    },
    duration: "2ч 20м",
    aircraft: "Boeing 737-800",
    status: "completed"
  },
  {
    id: "5",
    flightNumber: "SU-1704",
    departure: {
      airport: "Ростов-на-Дону (ROV)",
      time: "2025-04-12T15:30:00",
      terminal: "A"
    },
    arrival: {
      airport: "Москва (SVO)",
      time: "2025-04-12T17:50:00",
      terminal: "D"
    },
    duration: "2ч 20м",
    aircraft: "Boeing 737-800",
    status: "completed"
  }
];

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

// Group flights by day of the week
const groupFlightsByDay = (flights: Flight[], startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const flightsByDay = days.map(day => {
    const dayFlights = flights.filter(flight => {
      const departureDate = new Date(flight.departure.time);
      return isSameDay(departureDate, day);
    });
    
    return {
      date: day,
      flights: dayFlights
    };
  });
  
  return flightsByDay;
};

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Calculate week start and end dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as first day
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  // Group flights by day
  const upcomingFlightsByDay = groupFlightsByDay(upcomingFlights, weekStart, weekEnd);
  const pastFlightsByDay = groupFlightsByDay(pastFlights, weekStart, weekEnd);
  
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
            {upcomingFlightsByDay.map((day, index) => (
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
            {pastFlightsByDay.map((day, index) => (
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
