import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import { Loader2 } from "lucide-react";

// Lazy-load admin pages for performance
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminRegister = lazy(() => import("./pages/AdminRegister"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminParties = lazy(() => import("./pages/AdminParties"));
const AdminCheques = lazy(() => import("./pages/AdminCheques"));
const AdminReminders = lazy(() => import("./pages/AdminReminders"));
const AdminForgotPassword = lazy(() => import("./pages/AdminForgotPassword"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/parties" element={<AdminParties />} />
            <Route path="/admin/cheques" element={<AdminCheques />} />
            <Route path="/admin/reminders" element={<AdminReminders />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
