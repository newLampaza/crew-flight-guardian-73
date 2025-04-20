
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import FatigueAnalysisPage from "@/pages/FatigueAnalysisPage";
import SchedulePage from "@/pages/SchedulePage";
import CognitiveTestsPage from "@/pages/CognitiveTestsPage";
import TrainingPage from "@/pages/TrainingPage";
import FeedbackPage from "@/pages/FeedbackPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import ForbiddenPage from "@/pages/ForbiddenPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import AdminHome from "./pages/AdminHome";
import MedicalHome from "./pages/MedicalHome";
import Index from "./pages/Index";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem={true} storageKey="fatigue-guard-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="/" element={<Index />} />
            
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fatigue-analysis" element={<FatigueAnalysisPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/cognitive-tests" element={<CognitiveTestsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              <Route 
                path="/admin" 
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AdminHome />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/medical" 
                element={
                  <RoleProtectedRoute allowedRoles={["medical"]}>
                    <MedicalHome />
                  </RoleProtectedRoute>
                } 
              />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
