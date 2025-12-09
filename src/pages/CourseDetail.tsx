import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2, Clock, BookOpen, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TalentHubLayout from "@/components/TalentHubLayout";
import { usePackageAccess, PACKAGES, getPackageUpgrade } from "@/hooks/usePackageAccess";

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
  const [requiredPackage, setRequiredPackage] = useState<string | null>(null);
  const { talentPackage, hasAccessToCourse, loading: packageLoading } = usePackageAccess();

  const isLocked = id ? !hasAccessToCourse(id) : true;

  useEffect(() => {
    if (id && !packageLoading) {
      loadCourseData();
    }
  }, [id, packageLoading]);

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
            short_name,
            order_index
          )
        `)
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);
      
      if (courseData.training_levels) {
        setLevelName(courseData.training_levels.short_name || courseData.training_levels.name);
      }

      // Get required package for this course
      const { data: coursePackages } = await supabase
        .from("course_packages")
        .select("package_code")
        .eq("course_id", id);

      if (coursePackages && coursePackages.length > 0) {
        const packageOrder = ["start", "advanced", "premium"];
        const sortedPackages = coursePackages.map(p => p.package_code).sort(
          (a, b) => packageOrder.indexOf(a) - packageOrder.indexOf(b)
        );
        setRequiredPackage(sortedPackages[0]);
      }

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", id)
        .eq("is_active", true)
        .order("order_index");

      if (lessonsError) throw lessonsError;

      // Check which lessons are completed (only if user has access)
      let completedIds = new Set<string>();
      if (!isLocked) {
        const { data: completedData } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("talent_id", user.id)
          .eq("course_id", id)
          .eq("is_completed", true);

        completedIds = new Set((completedData || []).map((l) => l.lesson_id));
      }

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

      // Update or create talent_courses record (only if not locked)
      if (!isLocked && progressPercentage > 0) {
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
        } else {
          await supabase.from("talent_courses").insert({
            talent_id: user.id,
            course_id: id,
            progress_percentage: progressPercentage,
            status: progressPercentage === 100 ? "completed" : "in_progress",
            started_at: new Date().toISOString(),
          });
        }
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
    if (isLocked) return;
    navigate(`/courses/${id}/lesson/${lessonId}`);
  };

  if (loading || packageLoading) {
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

      {/* Locked Course Banner */}
      {isLocked && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-500/20 rounded-2xl">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1 text-lg">
                  Este curso faz parte do pacote {PACKAGES[requiredPackage || "start"]?.name}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-3">
                  Atualize seu acesso para desbloquear este curso e todos os recursos do pacote.
                </p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {PACKAGES[requiredPackage || "start"]?.price}
                  </Badge>
                  <Button size="sm" className="rounded-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Adquirir Pacote
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card className={`rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden ${isLocked ? "opacity-75" : ""}`}>
            <div className="relative h-96">
              <img
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800"}
                alt={course.title}
                className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`}
              />
              {isLocked && (
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <div className="bg-background/90 backdrop-blur-sm rounded-full p-4">
                    <Lock className="h-8 w-8 text-slate-600" />
                  </div>
                </div>
              )}
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
              <CardTitle className="font-display">
                {isLocked ? "Conteúdo Bloqueado" : "Seu Progresso"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isLocked ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-4">
                  <Lock className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Adquira o pacote {PACKAGES[requiredPackage || "start"]?.name} para acessar este curso
                  </p>
                  <Button className="w-full rounded-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Desbloquear por {PACKAGES[requiredPackage || "start"]?.price}
                  </Button>
                </div>
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
                className={`flex items-center justify-between p-4 rounded-2xl transition-colors group ${
                  isLocked
                    ? "bg-muted/30 cursor-not-allowed opacity-60"
                    : "bg-muted/50 hover:bg-muted cursor-pointer"
                }`}
                onClick={() => handleStartLesson(lesson.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isLocked
                        ? "bg-slate-500/20 text-slate-500"
                        : lesson.is_completed
                        ? "bg-green-500/20 text-green-700"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : lesson.is_completed ? (
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
                {!isLocked && (
                  <Button
                    size="sm"
                    variant={lesson.is_completed ? "outline" : "default"}
                    className="flex-shrink-0"
                  >
                    {lesson.is_completed ? "Revisar" : "Assistir"}
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                )}
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
