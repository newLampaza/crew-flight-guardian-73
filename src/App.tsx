
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import SchedulePage from "@/pages/SchedulePage";
import CognitiveTestsPage from "@/pages/CognitiveTestsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

// Placeholder pages - these would be implemented fully in a complete app
import FeedbackPage from "@/pages/FeedbackPage";
import TrainingPage from "@/pages/TrainingPage";
import FatigueAnalysisPage from "@/pages/FatigueAnalysisPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes with DashboardLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/schedule" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SchedulePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/cognitive-tests" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CognitiveTestsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FeedbackPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/training" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TrainingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/fatigue-analysis" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FatigueAnalysisPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Redirect to login if not found or not authorized */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
