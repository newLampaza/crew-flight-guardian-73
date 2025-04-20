
import { Navigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAdmin, isMedical, isPilot } = useAuth();
  
  // Redirect based on user role
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  
  if (isMedical()) {
    return <Navigate to="/medical" replace />;
  }
  
  if (isPilot()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback for undefined roles
  return <Navigate to="/login" replace />;
};

export default Index;
