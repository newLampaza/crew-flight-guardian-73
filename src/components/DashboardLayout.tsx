
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PlaneTakeoff,
  LayoutDashboard,
  Calendar,
  Brain,
  MessageSquare,
  BookOpen,
  LineChart,
  Settings,
  Menu,
  X
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { 
      name: "Главная", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      path: "/" 
    },
    { 
      name: "Расписание полетов", 
      icon: <Calendar className="h-5 w-5" />, 
      path: "/schedule" 
    },
    { 
      name: "Когнитивные тесты", 
      icon: <Brain className="h-5 w-5" />, 
      path: "/cognitive-tests" 
    },
    { 
      name: "Отзывы", 
      icon: <MessageSquare className="h-5 w-5" />, 
      path: "/feedback" 
    },
    { 
      name: "Учебные материалы", 
      icon: <BookOpen className="h-5 w-5" />, 
      path: "/training" 
    },
    { 
      name: "Анализ усталости", 
      icon: <LineChart className="h-5 w-5" />, 
      path: "/fatigue-analysis" 
    },
    { 
      name: "Настройки", 
      icon: <Settings className="h-5 w-5" />, 
      path: "/settings" 
    }
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 text-white">
            <PlaneTakeoff className="h-6 w-6" />
            <span className="text-lg font-bold">FatigueGuard</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white lg:hidden" 
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          <div className="flex flex-col items-center p-4 bg-sidebar-accent rounded-lg text-white">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-sidebar-primary text-white">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm opacity-80">{user?.position}</p>
              <p className="text-xs opacity-60">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-md py-2 px-3 transition-colors ${
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              {/* Any header content can go here */}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
