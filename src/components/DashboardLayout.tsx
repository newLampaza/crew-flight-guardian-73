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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-sidebar`}
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

        <nav className="mt-6 px-4 space-y-1">
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
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
