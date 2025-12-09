import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Material = {
  title: string;
  url: string;
  size: string;
};

const CourseLesson = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [previousLesson, setPreviousLesson] = useState<any>(null);
  const [materials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
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
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Check if completed
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("is_completed")
        .eq("talent_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      setIsCompleted(progressData?.is_completed || false);

      // Fetch next and previous lessons
      const { data: allLessons } = await supabase
        .from("course_lessons")
        .select("id, title, order_index")
        .eq("course_id", courseId)
        .eq("is_active", true)
        .order("order_index");

      if (allLessons) {
        const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
        if (currentIndex > 0) {
          setPreviousLesson(allLessons[currentIndex - 1]);
        }
        if (currentIndex < allLessons.length - 1) {
          setNextLesson(allLessons[currentIndex + 1]);
        }
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Erro ao carregar aula",
        description: "Não foi possível carregar os dados da aula.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create or update lesson progress
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .upsert({
          talent_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (progressError) throw progressError;

      setIsCompleted(true);

      // Recalculate course progress
      const { data: allLessons } = await supabase
        .from("course_lessons")
        .select("id")
        .eq("course_id", courseId)
        .eq("is_active", true);

      const { data: completedLessons } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("talent_id", user.id)
        .eq("course_id", courseId)
        .eq("is_completed", true);

      const totalLessons = allLessons?.length || 0;
      const completed = completedLessons?.length || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

      // Update talent_courses
      const { data: existingProgress } = await supabase
        .from("talent_courses")
        .select("id")
        .eq("talent_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existingProgress) {
        await supabase
          .from("talent_courses")
          .update({
            progress_percentage: progressPercentage,
            status: progressPercentage === 100 ? "completed" : "in_progress",
            completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
          })
          .eq("id", existingProgress.id);
      } else {
        await supabase.from("talent_courses").insert({
          talent_id: user.id,
          course_id: courseId,
          progress_percentage: progressPercentage,
          status: progressPercentage === 100 ? "completed" : "in_progress",
          started_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Aula concluída! 🎉",
        description: "Seu progresso foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a aula como concluída.",
        variant: "destructive",
      });
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/courses/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const handlePreviousLesson = () => {
    if (previousLesson) {
      navigate(`/courses/${courseId}/lesson/${previousLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display mb-2">Aula não encontrada</h3>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>Voltar para o Curso</Button>
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
              <Button variant="ghost" size="icon" onClick={() => navigate(`/courses/${courseId}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">{course.title}</p>
                <h1 className="text-xl font-display">{lesson.title}</h1>
              </div>
            </div>
            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Concluída
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  poster="https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800"
                >
                  <source src={lesson.video_url} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            </Card>

            {/* Lesson Info */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-2xl mb-2">{lesson.title}</CardTitle>
                    <p className="text-muted-foreground">{lesson.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isCompleted ? (
                  <Button onClick={handleMarkComplete} className="w-full rounded-full" size="lg">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Concluída
                  </Button>
                ) : (
                  <div className="text-center p-4 rounded-2xl bg-green-500/10">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-green-700">Aula concluída!</p>
                    <p className="text-sm text-green-600">Continue para a próxima aula</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={!previousLesson}
                    className="flex-1 rounded-full"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleNextLesson}
                    disabled={!nextLesson}
                    className="flex-1 rounded-full"
                  >
                    Próxima
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                {nextLesson && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Próxima: {nextLesson.title}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Materials */}
          <div>
            <Card className="border-none shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Materiais de Apoio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-background rounded-xl">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{material.title}</p>
                            <p className="text-xs text-muted-foreground">{material.size}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            toast({
                              title: "Download iniciado",
                              description: `Baixando ${material.title}`,
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum material disponível para esta aula
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseLesson;
