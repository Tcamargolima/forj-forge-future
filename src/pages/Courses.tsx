import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TalentHubLayout from "@/components/TalentHubLayout";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  progress: number;
  status: string;
  totalLessons: number;
  completedLessons: number;
};

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      // Fetch all active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true);

      if (coursesError) throw coursesError;

      // For each course, get progress and lesson count
      const coursesWithProgress = await Promise.all(
        (coursesData || []).map(async (course) => {
          // Get total lessons
          const { data: lessons } = await supabase
            .from("course_lessons")
            .select("id")
            .eq("course_id", course.id)
            .eq("is_active", true);

          const totalLessons = lessons?.length || 0;

          // Get user progress
          const { data: progressData } = await supabase
            .from("talent_courses")
            .select("progress_percentage, status")
            .eq("talent_id", user.id)
            .eq("course_id", course.id)
            .maybeSingle();

          // Get completed lessons
          const { data: completedLessons } = await supabase
            .from("lesson_progress")
            .select("id")
            .eq("talent_id", user.id)
            .eq("course_id", course.id)
            .eq("is_completed", true);

          return {
            id: course.id,
            title: course.title,
            description: course.description || "",
            category: course.category || "Geral",
            thumbnail_url: course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=400",
            progress: progressData?.progress_percentage || 0,
            status: progressData?.status || "not_started",
            totalLessons,
            completedLessons: completedLessons?.length || 0,
          };
        })
      );

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Erro ao carregar cursos",
        description: "Não foi possível carregar os cursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === "all") return true;
    return course.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Concluído</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Em Andamento</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Não Iniciado</Badge>;
    }
  };

  if (loading) {
    return (
      <TalentHubLayout userName={profile?.full_name || user?.email}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando cursos...</p>
          </div>
        </div>
      </TalentHubLayout>
    );
  }

  return (
    <TalentHubLayout userName={profile?.full_name || user?.email}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Cursos
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sua jornada de aprendizado
        </p>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Cursos</p>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c) => c.status === "in_progress").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c) => c.status === "completed").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-2xl">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c) => c.status === "not_started").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Não Iniciados</p>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="rounded-full"
        >
          Todos
        </Button>
        <Button
          variant={filter === "in_progress" ? "default" : "outline"}
          onClick={() => setFilter("in_progress")}
          className="rounded-full"
        >
          Em Andamento
        </Button>
        <Button
          variant={filter === "not_started" ? "default" : "outline"}
          onClick={() => setFilter("not_started")}
          className="rounded-full"
        >
          Não Iniciados
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          className="rounded-full"
        >
          Concluídos
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">{getStatusBadge(course.status)}</div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {course.category}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {course.completedLessons} de {course.totalLessons} aulas
                  </span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {filter === "all"
              ? "Em breve novos cursos estarão disponíveis ✨"
              : "Você não tem cursos nesta categoria ainda."}
          </p>
        </div>
      )}
    </TalentHubLayout>
  );
};

export default Courses;
