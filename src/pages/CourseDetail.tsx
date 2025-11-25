import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Lesson = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: boolean;
};

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", id)
        .eq("is_active", true)
        .order("order_index");

      if (lessonsError) throw lessonsError;

      // Check which lessons are completed
      const { data: completedData } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("talent_id", user.id)
        .eq("course_id", id)
        .eq("is_completed", true);

      const completedIds = new Set((completedData || []).map((l) => l.lesson_id));

      const lessonsWithProgress = (lessonsData || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || "",
        order_index: lesson.order_index,
        is_completed: completedIds.has(lesson.id),
      }));

      setLessons(lessonsWithProgress);

      // Calculate progress
      const totalLessons = lessonsWithProgress.length;
      const completed = lessonsWithProgress.filter((l) => l.is_completed).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
      setProgress(progressPercentage);

      // Update or create talent_courses record
      const { data: existingProgress } = await supabase
        .from("talent_courses")
        .select("id")
        .eq("talent_id", user.id)
        .eq("course_id", id)
        .maybeSingle();

      if (existingProgress) {
        await supabase
          .from("talent_courses")
          .update({
            progress_percentage: progressPercentage,
            status: progressPercentage === 100 ? "completed" : progressPercentage > 0 ? "in_progress" : "not_started",
            started_at: progressPercentage > 0 ? new Date().toISOString() : null,
            completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
          })
          .eq("id", existingProgress.id);
      } else if (progressPercentage > 0) {
        await supabase.from("talent_courses").insert({
          talent_id: user.id,
          course_id: id,
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? "completed" : "in_progress",
          started_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Erro ao carregar curso",
        description: "Não foi possível carregar os dados do curso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/courses/${id}/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display mb-2">Curso não encontrado</h3>
          <Button onClick={() => navigate("/courses")}>Voltar para Cursos</Button>
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
              <Button variant="ghost" size="icon" onClick={() => navigate("/courses")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display tracking-wider">{course.title}</h1>
                <p className="text-sm text-muted-foreground">{course.category}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="relative h-96">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-display text-3xl">{course.title}</CardTitle>
                <CardDescription className="text-base">{course.description}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div>
            <Card className="border-none shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="font-display">Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <span className="text-2xl font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aulas concluídas</span>
                    <span className="font-medium">
                      {lessons.filter((l) => l.is_completed).length} de {lessons.length}
                    </span>
                  </div>
                </div>

                {progress === 100 && (
                  <Badge className="w-full justify-center py-2 bg-green-500/10 text-green-700 hover:bg-green-500/20">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Curso Concluído
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lessons List */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Aulas do Curso</CardTitle>
            <CardDescription>
              {lessons.length} aula{lessons.length !== 1 ? "s" : ""} disponíve{lessons.length !== 1 ? "is" : "l"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                  onClick={() => handleStartLesson(lesson.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        lesson.is_completed
                          ? "bg-green-500/20 text-green-700"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {lesson.is_completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-display">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={lesson.is_completed ? "outline" : "default"}
                    className="flex-shrink-0"
                  >
                    {lesson.is_completed ? "Revisar" : "Assistir"}
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {lessons.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  As aulas deste curso estarão disponíveis em breve ✨
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CourseDetail;
