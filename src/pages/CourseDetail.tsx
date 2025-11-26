import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Clock, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TalentHubLayout from "@/components/TalentHubLayout";

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
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [levelName, setLevelName] = useState<string>("");

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
      
      setUser(user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      // Fetch course with level
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(`
          *,
          training_levels (
            name,
            short_name
          )
        `)
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);
      
      if (courseData.training_levels) {
        setLevelName(courseData.training_levels.short_name || courseData.training_levels.name);
      }

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
      <TalentHubLayout userName={profile?.full_name || user?.email}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando curso...</p>
          </div>
        </div>
      </TalentHubLayout>
    );
  }

  if (!course) {
    return (
      <TalentHubLayout userName={profile?.full_name || user?.email}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Curso não encontrado
            </h3>
            <Button onClick={() => navigate("/courses")}>Voltar para Cursos</Button>
          </div>
        </div>
      </TalentHubLayout>
    );
  }

  return (
    <TalentHubLayout userName={profile?.full_name || user?.email}>
      {/* Breadcrumb / Level indicator */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/courses")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Cursos
        </Button>
        {levelName && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Você está em: <span className="font-semibold">{levelName}</span> da sua formação
          </p>
        )}
      </div>
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
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
          <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50 sticky top-24">
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
      <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
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
    </TalentHubLayout>
  );
};

export default CourseDetail;
