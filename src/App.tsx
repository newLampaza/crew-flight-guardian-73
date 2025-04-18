
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
import AdminDashboard from "@/pages/AdminDashboard";
import MedicalDashboard from "@/pages/MedicalDashboard";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="fatigue-guard-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fatigue-analysis" element={<FatigueAnalysisPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/cognitive-tests" element={<CognitiveTestsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Маршрут для администратора */}
              <Route 
                path="/admin" 
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Маршрут для медицинского работника */}
              <Route 
                path="/medical" 
                element={
                  <RoleProtectedRoute allowedRoles={["medical"]}>
                    <MedicalDashboard />
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
