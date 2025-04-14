
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  Search, 
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

// Sample training materials
const materials = [
  {
    id: "1",
    type: "document",
    title: "Управление усталостью в длительных полетах",
    description: "Руководство по методам борьбы с усталостью во время длительных рейсов",
    category: "Безопасность",
    dateAdded: "10 апреля 2025",
    duration: "30 минут",
    status: "completed"
  },
  {
    id: "2",
    type: "video",
    title: "Когнитивные функции и безопасность полетов",
    description: "Обучающее видео о влиянии когнитивных функций на принятие решений в полете",
    category: "Обучение",
    dateAdded: "8 апреля 2025",
    duration: "45 минут",
    status: "in-progress"
  },
  {
    id: "3",
    type: "document",
    title: "Стандартные операционные процедуры - обновление 2025",
    description: "Обновленный документ SOP с изменениями в протоколах безопасности",
    category: "Процедуры",
    dateAdded: "5 апреля 2025",
    duration: "60 минут",
    status: "not-started"
  },
  {
    id: "4",
    type: "video",
    title: "Техники отдыха и восстановления между рейсами",
    description: "Видеокурс по эффективным методам отдыха и восстановления для экипажа",
    category: "Здоровье",
    dateAdded: "1 апреля 2025",
    duration: "25 минут",
    status: "completed"
  },
  {
    id: "5",
    type: "document",
    title: "Психологические аспекты работы в экипаже",
    description: "Материалы по эффективной коммуникации и работе в команде",
    category: "Психология",
    dateAdded: "25 марта 2025",
    duration: "40 минут",
    status: "not-started"
  }
];

const MaterialCard = ({ material }: { material: any }) => {
  const openMaterial = () => {
    // In a real app, this would open the material
    console.log(`Opening material: ${material.title}`);
  };
  
  const statusText = {
    "completed": "Изучено",
    "in-progress": "В процессе",
    "not-started": "Не начато"
  };
  
  return (
    <Card key={material.id} className="mb-4 hover-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-2">
            {material.type === "document" ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : (
              <Video className="h-5 w-5 text-primary" />
            )}
            <span className="truncate">{material.title}</span>
          </CardTitle>
          
          <Badge
            variant={
              material.status === "completed" ? "default" :
              material.status === "in-progress" ? "secondary" :
              "outline"
            }
            className="whitespace-nowrap ml-2 min-w-[90px] text-center"
          >
            {statusText[material.status as keyof typeof statusText]}
          </Badge>
        </div>
        <CardDescription>{material.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">{material.duration}</span>
          </div>
          
          <Badge variant="outline">{material.category}</Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={openMaterial} className="flex-1">
            {material.type === "document" ? "Открыть документ" : "Смотреть видео"}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TrainingStatus = () => {
  const completed = 7;
  const total = 12;
  const progress = Math.round((completed / total) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс обучения</CardTitle>
        <CardDescription>Выполнено {completed} из {total} обязательных материалов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full bg-secondary rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-status-good mr-2" />
            <span>Готовность к полетам: 100%</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-status-warning mr-2" />
            <span>Скоро потребуется обновление сертификатов</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TrainingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Учебные материалы</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск учебных материалов..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map(material => (
              <MaterialCard key={material.id} material={material} />
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/50 rounded-lg">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Материалы не найдены</h3>
              <p className="text-muted-foreground">
                По вашему запросу не найдено учебных материалов
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <TrainingStatus />
          
          <Card>
            <CardHeader>
              <CardTitle>Рекомендуемые материалы</CardTitle>
              <CardDescription>На основе вашей должности и истории обучения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-3">
                <Button variant="ghost" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">Управление ресурсами экипажа</span>
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Video className="mr-2 h-4 w-4" />
                  <span className="truncate">Новые процедуры безопасности</span>
                </Button>
                <Button variant="ghost" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">Техники управления стрессом</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
