
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ForbiddenPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
            <Shield className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">Доступ запрещен</h1>
        
        <p className="text-muted-foreground">
          У вас недостаточно прав для доступа к этой странице.
          {user && (
            <span className="block mt-2">
              Ваша роль: <span className="font-semibold">{user.position}</span>
            </span>
          )}
        </p>
        
        <div className="pt-4">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home size={18} />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
