
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  PlaneTakeoff,
  Home,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Brain,
  FileBarChart,
  Server,
  UserCog,
  ClipboardCheck,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin, isMedical, isPilot } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const renderNavItems = () => {
    let navItems = [];
    
    if (isPilot()) {
      navItems = [
        { to: "/", icon: <Home className="h-5 w-5" />, label: "Главная" },
        { to: "/fatigue-analysis", icon: <Brain className="h-5 w-5" />, label: "Анализ усталости" },
        { to: "/schedule", icon: <Calendar className="h-5 w-5" />, label: "Расписание" },
        { to: "/cognitive-tests", icon: <Activity className="h-5 w-5" />, label: "Когнитивные тесты" },
        { to: "/training", icon: <FileText className="h-5 w-5" />, label: "Обучение" },
        { to: "/feedback", icon: <MessageSquare className="h-5 w-5" />, label: "Отзывы" },
        { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Настройки" }
      ];
    } else if (isAdmin()) {
      navItems = [
        { to: "/", icon: <Home className="h-5 w-5" />, label: "Главная" },
        { to: "/admin", icon: <Server className="h-5 w-5" />, label: "Панель администратора" },
        { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Настройки" }
      ];
    } else if (isMedical()) {
      navItems = [
        { to: "/", icon: <Home className="h-5 w-5" />, label: "Главная" },
        { to: "/medical", icon: <HeartPulse className="h-5 w-5" />, label: "Медицинская панель" },
        { to: "/settings", icon: <Settings className="h-5 w-5" />, label: "Настройки" }
      ];
    }

    return navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-sidebar-accent",
            isActive ? "bg-sidebar-accent" : "text-sidebar-foreground/70"
          )
        }
        onClick={() => isMobile && setIsSidebarOpen(false)}
      >
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    ));
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out text-sidebar-foreground",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {isMobile && (
          <button
            className="absolute -right-10 top-2 rounded-r-md border border-l-0 bg-sidebar p-2 text-sidebar-foreground"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2 border-b px-4 py-4">
          <PlaneTakeoff className="h-6 w-6 text-sidebar-foreground" />
          <span className="font-semibold tracking-tight">FatigueGuard</span>
        </div>
        <nav className="flex-1 overflow-auto p-4">
          <div className="space-y-1">{renderNavItems()}</div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-border/30">
                <AvatarImage 
                  src={user?.avatarUrl} 
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.position}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          isMobile ? "ml-0" : "ml-64"
        )}
      >
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
