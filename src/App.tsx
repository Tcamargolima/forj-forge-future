import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TalentHub from "./pages/TalentHub";
import Profile from "./pages/Profile";
import Journey from "./pages/Journey";
import TrainingJourney from "./pages/TrainingJourney";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLesson from "./pages/CourseLesson";
import Jobs from "./pages/Jobs";
import Documents from "./pages/Documents";
import Notices from "./pages/Notices";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TalentsManagement from "./pages/admin/TalentsManagement";
import TalentDetail from "./pages/admin/TalentDetail";
import JourneyManagement from "./pages/admin/JourneyManagement";
import BrandsManagement from "./pages/admin/BrandsManagement";
import JobsManagement from "./pages/admin/JobsManagement";
import CoursesManagement from "./pages/admin/CoursesManagement";
import CourseLessonsManagement from "./pages/admin/CourseLessonsManagement";
import PackagesManagement from "./pages/admin/PackagesManagement";
import LeadsManagement from "./pages/admin/LeadsManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/talent-hub" element={<TalentHub />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/training-journey" element={<TrainingJourney />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lesson/:lessonId" element={<CourseLesson />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/talents" element={<TalentsManagement />} />
          <Route path="/admin/talents/:id" element={<TalentDetail />} />
          <Route path="/admin/journey" element={<JourneyManagement />} />
          <Route path="/admin/brands" element={<BrandsManagement />} />
          <Route path="/admin/jobs" element={<JobsManagement />} />
          <Route path="/admin/courses" element={<CoursesManagement />} />
          <Route path="/admin/courses/:courseId/lessons" element={<CourseLessonsManagement />} />
          <Route path="/admin/packages" element={<PackagesManagement />} />
          <Route path="/admin/leads" element={<LeadsManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
