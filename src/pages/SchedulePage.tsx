
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  PlaneTakeoff, 
  PlaneLanding
} from "lucide-react";

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
              <span>{flight.departure.airport}</span>
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
              <span>{flight.arrival.airport}</span>
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

const SchedulePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Расписание полетов</h1>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span>Апрель 2025</span>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Предстоящие рейсы</TabsTrigger>
          <TabsTrigger value="past">Прошедшие рейсы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
