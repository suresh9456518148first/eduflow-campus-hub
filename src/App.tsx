import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Collaboration from "./pages/Collaboration";
import Marketplace from "./pages/Marketplace";
import Complaints from "./pages/Complaints";
import Attendance from "./pages/Attendance";
import StudyVault from "./pages/StudyVault";
import Events from "./pages/Events";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/study-vault" element={<StudyVault />} />
            <Route path="/events" element={<Events />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
