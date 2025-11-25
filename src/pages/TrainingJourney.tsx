import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Lock, BookOpen, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TrainingLevel = {
  id: string;
  code: string;
  name: string;
  short_name: string;
  order_index: number;
  description: string;
  courseCount: number;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
};

const TrainingJourney = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [levelCourses, setLevelCourses] = useState<any[]>([]);

  useEffect(() => {
    loadTrainingLevels();
  }, []);

  const loadTrainingLevels = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch training levels
      const { data: levelsData, error: levelsError } = await supabase
        .from("training_levels")
        .select("*")
        .order("order_index");

      if (levelsError) throw levelsError;

      // Fetch courses for each level
      const levelsWithProgress = await Promise.all(
        (levelsData || []).map(async (level) => {
          // Get courses for this level
          const { data: courses } = await supabase
            .from("courses")
            .select("id")
            .eq("level_id", level.id)
            .eq("is_active", true);

          const courseCount = courses?.length || 0;

          // Get talent progress for courses in this level
          if (courseCount > 0) {
            const courseIds = courses!.map((c) => c.id);
            const { data: progressData } = await supabase
              .from("talent_courses")
              .select("progress_percentage, status")
              .eq("talent_id", user.id)
              .in("course_id", courseIds);

            if (progressData && progressData.length > 0) {
              const avgProgress =
                progressData.reduce((sum, p) => sum + p.progress_percentage, 0) /
                progressData.length;
              
              const allCompleted = progressData.every((p) => p.status === "completed");
              const someStarted = progressData.some((p) => p.status !== "not_started");

              return {
                ...level,
                courseCount,
                progress: Math.round(avgProgress),
                status: (allCompleted ? "completed" : someStarted ? "in_progress" : "not_started") as "completed" | "in_progress" | "not_started",
              };
            }
          }

          return {
            ...level,
            courseCount,
            progress: 0,
            status: "not_started" as const,
          };
        })
      );

      setLevels(levelsWithProgress);
    } catch (error) {
      console.error("Error loading training levels:", error);
      toast({
        title: "Erro ao carregar níveis",
        description: "Não foi possível carregar os níveis de formação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLevelCourses = async (levelId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: courses, error } = await supabase
        .from("courses")
        .select(`
          *,
          talent_courses!left(progress_percentage, status)
        `)
        .eq("level_id", levelId)
        .eq("is_active", true);

      if (error) throw error;

      setLevelCourses(courses || []);
      setSelectedLevel(levelId);
    } catch (error) {
      console.error("Error loading level courses:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">
            Em Andamento
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Lock className="mr-1 h-3 w-3" />
            Não Iniciado
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sua jornada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/talent-hub")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display tracking-wider">MINHA FORMAÇÃO</h1>
                <p className="text-sm text-muted-foreground">Sua jornada até o topo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <Card className="border-none shadow-sm mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display mb-2">Programa de Formação</h2>
                <p className="text-muted-foreground">
                  6 níveis que vão te levar de New Face até Top Talent. Complete cada etapa para
                  desbloquear oportunidades exclusivas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4 mb-8">
          {levels.map((level, index) => (
            <Card
              key={level.id}
              className={`border-none shadow-sm transition-all duration-300 cursor-pointer hover:shadow-xl ${
                selectedLevel === level.id ? "ring-2 ring-primary" : ""
              } ${
                level.status === "completed"
                  ? "bg-green-500/5"
                  : level.status === "in_progress"
                  ? "bg-blue-500/5"
                  : ""
              }`}
              onClick={() => loadLevelCourses(level.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-display text-xl ${
                        level.status === "completed"
                          ? "bg-green-500/20 text-green-700"
                          : level.status === "in_progress"
                          ? "bg-blue-500/20 text-blue-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {level.status === "completed" ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-display text-xl mb-2">{level.name}</CardTitle>
                      <CardDescription className="mb-3">{level.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {level.courseCount} curso{level.courseCount !== 1 ? "s" : ""}
                        </span>
                        <span>{level.progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(level.status)}
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={level.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Level Courses */}
        {selectedLevel && levelCourses.length > 0 && (
          <div>
            <h3 className="text-xl font-display mb-4">
              Cursos do {levels.find((l) => l.id === selectedLevel)?.short_name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelCourses.map((course) => {
                const progress = course.talent_courses?.[0]?.progress_percentage || 0;
                const status = course.talent_courses?.[0]?.status || "not_started";

                return (
                  <Card
                    key={course.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-none overflow-hidden"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=400"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        {status === "completed" && (
                          <Badge className="bg-green-500/10 text-green-700">Concluído</Badge>
                        )}
                        {status === "in_progress" && (
                          <Badge className="bg-blue-500/10 text-blue-700">Em Andamento</Badge>
                        )}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State for Selected Level */}
        {selectedLevel && levelCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-display mb-2">Nenhum curso disponível</h3>
            <p className="text-muted-foreground">
              Os cursos deste nível estarão disponíveis em breve ✨
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingJourney;
