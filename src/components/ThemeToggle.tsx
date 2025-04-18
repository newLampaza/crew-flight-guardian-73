
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // Ensure the theme is properly synced with the UI
  useEffect(() => {
    // Apply data-theme attribute to document for consistency
    document.documentElement.setAttribute('data-theme', theme || 'light');
  }, [theme]);

  // Use resolvedTheme for accurate detection of current theme
  const currentTheme = resolvedTheme || theme;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      title={`Переключить на ${currentTheme === "light" ? "тёмную" : "светлую"} тему`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}
