
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  PlaneTakeoff, 
  PlaneLanding,
  ChevronDown,
  Filter
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define proper TypeScript interfaces for our data
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

// Sample data - would come from an API in a real app
const allFlights: Flight[] = [
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
  },
  {
    id: "6",
    flightNumber: "SU-1624",
    departure: {
      airport: "Москва (SVO)",
      time: "2025-04-18T09:15:00",
      terminal: "D"
    },
    arrival: {
      airport: "Сочи (AER)",
      time: "2025-04-18T11:45:00",
      terminal: "B"
    },
    duration: "2ч 30м",
    aircraft: "Boeing 737-800",
    status: "upcoming"
  },
  {
    id: "7",
    flightNumber: "SU-1625",
    departure: {
      airport: "Сочи (AER)",
      time: "2025-04-18T13:30:00",
      terminal: "B"
    },
    arrival: {
      airport: "Москва (SVO)",
      time: "2025-04-18T16:00:00",
      terminal: "D"
    },
    duration: "2ч 30м",
    aircraft: "Boeing 737-800",
    status: "upcoming"
  }
];

// Helper function to format date
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

// Helper to format just date (without time)
const formatDateOnly = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "d MMMM, EEEE", { locale: ru });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Flight card component with proper typing
const FlightCard = ({ flight }: { flight: Flight }) => {
  return (
    <Card className="mb-4 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              {flight.status === "completed" ? (
                <PlaneLanding className="h-6 w-6 text-primary" />
              ) : (
                <PlaneTakeoff className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{flight.flightNumber}</h3>
              <p className="text-sm text-muted-foreground">{flight.aircraft}</p>
            </div>
          </div>
          <Badge
            variant={
              flight.status === "active" ? "default" :
              flight.status === "upcoming" ? "secondary" :
              flight.status === "completed" ? "outline" : "outline"
            }
          >
            {flight.status === "active" ? "В полёте" :
             flight.status === "upcoming" ? "Предстоящий" :
             flight.status === "completed" ? "Выполнен" : flight.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <div>
            <div className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(flight.departure.time)}
            </div>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate max-w-[150px] inline-block">{flight.departure.airport}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.departure.airport}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Терминал {flight.departure.terminal}
            </div>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <div className="text-xs font-medium">{flight.duration}</div>
            <div className="w-24 h-[1px] bg-border my-2 relative">
              <div className="absolute top-1/2 left-0 w-2 h-2 -mt-1 rounded-full bg-primary"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 -mt-1 rounded-full bg-primary"></div>
            </div>
            <div className="text-xs text-muted-foreground">Прямой рейс</div>
          </div>
          
          <div className="text-right">
            <div className="font-medium flex items-center justify-end">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(flight.arrival.time)}
            </div>
            <div className="flex items-center justify-end mt-1">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate max-w-[150px] inline-block">{flight.arrival.airport}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{flight.arrival.airport}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Терминал {flight.arrival.terminal}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component to display flights grouped by day
const FlightsByDay = ({ flights }: { flights: Flight[] }) => {
  // Group flights by day
  const flightsByDay: Record<string, Flight[]> = {};
  
  flights.forEach(flight => {
    const departureDate = new Date(flight.departure.time);
    const dateKey = format(departureDate, 'yyyy-MM-dd');
    
    if (!flightsByDay[dateKey]) {
      flightsByDay[dateKey] = [];
    }
    
    flightsByDay[dateKey].push(flight);
  });
  
  // Sort dates
  const sortedDates = Object.keys(flightsByDay).sort();
  
  return (
    <div className="space-y-8">
      {sortedDates.map(dateKey => {
        const dayFlights = flightsByDay[dateKey];
        const formattedDate = formatDateOnly(dayFlights[0].departure.time);
        
        return (
          <div key={dateKey}>
            <div className="sticky top-0 bg-background py-2 mb-4 border-b">
              <h3 className="text-lg font-semibold text-primary">{formattedDate}</h3>
            </div>
            <div className="space-y-4">
              {dayFlights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          </div>
        );
      })}
      
      {sortedDates.length === 0 && (
        <div className="text-center py-8">
          <p>Нет рейсов для отображения</p>
        </div>
      )}
    </div>
  );
};

const SchedulePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [tabValue, setTabValue] = useState("upcoming");
  
  // Filter flights based on status and date
  const getFilteredFlights = () => {
    let statusFilter: string[];
    
    if (tabValue === "upcoming") {
      statusFilter = ["active", "upcoming"];
    } else {
      statusFilter = ["completed"];
    }
    
    let dateFilteredFlights = allFlights.filter(flight => {
      const departureDate = new Date(flight.departure.time);
      
      if (!date) return true;
      
      if (view === "day") {
        return isSameDay(departureDate, date);
      } else if (view === "week") {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return isWithinInterval(departureDate, { start: weekStart, end: weekEnd });
      } else if (view === "month") {
        return departureDate.getMonth() === date.getMonth() && 
               departureDate.getFullYear() === date.getFullYear();
      }
      
      return true;
    });
    
    return dateFilteredFlights.filter(flight => statusFilter.includes(flight.status));
  };
  
  const filteredFlights = getFilteredFlights();
  
  let dateDisplay = "";
  if (date) {
    if (view === "day") {
      dateDisplay = format(date, "d MMMM yyyy", { locale: ru });
    } else if (view === "week") {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      dateDisplay = `${format(weekStart, "d MMMM", { locale: ru })} - ${format(weekEnd, "d MMMM yyyy", { locale: ru })}`;
    } else if (view === "month") {
      dateDisplay = format(date, "LLLL yyyy", { locale: ru });
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Расписание полетов</h1>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-normal justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateDisplay || "Выберите дату"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          <Select value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Выберите вид" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">День</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Предстоящие рейсы</TabsTrigger>
          <TabsTrigger value="past">Прошедшие рейсы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <FlightsByDay flights={filteredFlights} />
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          <FlightsByDay flights={filteredFlights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
