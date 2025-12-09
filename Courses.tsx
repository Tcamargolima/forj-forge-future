import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle2, Clock, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TalentHubLayout from "@/components/TalentHubLayout";
import { usePackageAccess, PACKAGES } from "@/hooks/usePackageAccess";

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
  levelId: string;
  levelName: string;
  isLocked: boolean;
  requiredPackage: string | null;
};

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { talentPackage, accessibleCourseIds, loading: packageLoading } = usePackageAccess();

  useEffect(() => {
    if (!packageLoading) {
      loadCourses();
    }
  }, [packageLoading, accessibleCourseIds]);

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

      // Fetch all active courses with level info
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          training_levels (
            id,
            name,
            short_name,
            order_index
          )
        `)
        .eq("is_active", true)
        .order("created_at");

      if (coursesError) throw coursesError;

      // Get course packages to determine required package for locked courses
      const { data: coursePackagesData } = await supabase
        .from("course_packages")
        .select("course_id, package_code");

      const coursePackageMap = new Map<string, string[]>();
      (coursePackagesData || []).forEach(cp => {
        if (!coursePackageMap.has(cp.course_id)) {
          coursePackageMap.set(cp.course_id, []);
        }
        coursePackageMap.get(cp.course_id)!.push(cp.package_code);
      });

      // For each course, get progress and lesson count
      const coursesWithProgress = await Promise.all(
        (coursesData || []).map(async (course) => {
          const isLocked = !accessibleCourseIds.has(course.id);
          
          // Find minimum required package
          const packages = coursePackageMap.get(course.id) || [];
          const packageOrder = ["start", "advanced", "premium"];
          const sortedPackages = packages.sort(
            (a, b) => packageOrder.indexOf(a) - packageOrder.indexOf(b)
          );
          const requiredPackage = sortedPackages[0] || null;

          // Get total lessons
          const { data: lessons } = await supabase
            .from("course_lessons")
            .select("id")
            .eq("course_id", course.id)
            .eq("is_active", true);

          const totalLessons = lessons?.length || 0;

          // Get user progress (only if not locked)
          let progress = 0;
          let status = "not_started";
          let completedLessonsCount = 0;

          if (!isLocked) {
            const { data: progressData } = await supabase
              .from("talent_courses")
              .select("progress_percentage, status")
              .eq("talent_id", user.id)
              .eq("course_id", course.id)
              .maybeSingle();

            const { data: completedLessons } = await supabase
              .from("lesson_progress")
              .select("id")
              .eq("talent_id", user.id)
              .eq("course_id", course.id)
              .eq("is_completed", true);

            progress = progressData?.progress_percentage || 0;
            status = progressData?.status || "not_started";
            completedLessonsCount = completedLessons?.length || 0;
          }

          return {
            id: course.id,
            title: course.title,
            description: course.description || "",
            category: course.category || "Geral",
            thumbnail_url: course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=400",
            progress,
            status,
            totalLessons,
            completedLessons: completedLessonsCount,
            levelId: course.training_levels?.id || "",
            levelName: course.training_levels?.short_name || course.training_levels?.name || "",
            isLocked,
            requiredPackage,
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
    if (filter === "locked") return course.isLocked;
    if (filter === "unlocked") return !course.isLocked;
    return course.status === filter;
  });

  // Group courses by category/level
  const unlockedCourses = filteredCourses.filter(c => !c.isLocked);
  const lockedCourses = filteredCourses.filter(c => c.isLocked);

  const getStatusBadge = (course: Course) => {
    if (course.isLocked) {
      return (
        <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">
          <Lock className="mr-1 h-3 w-3" />
          {PACKAGES[course.requiredPackage || "start"]?.name || "Bloqueado"}
        </Badge>
      );
    }
    switch (course.status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Concluído</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Em Andamento</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Não Iniciado</Badge>;
    }
  };

  const getPackageBadge = () => {
    if (!talentPackage) return null;
    const pkg = PACKAGES[talentPackage];
    return (
      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
        <Sparkles className="mr-1 h-3 w-3" />
        {pkg?.name}
      </Badge>
    );
  };

  if (loading || packageLoading) {
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Cursos
          </h1>
          {getPackageBadge()}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Programa de Preparação para Entrevista de Seleção
        </p>
      </div>

      {/* Package Info Card */}
      {!talentPackage && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-2xl">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Você ainda não possui um pacote
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Adquira um pacote para desbloquear os cursos de preparação para entrevista.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.filter(c => !c.isLocked).length}</p>
                <p className="text-sm text-muted-foreground">Cursos Liberados</p>
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
                  {courses.filter((c) => !c.isLocked && c.status === "in_progress").length}
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
              <div className="p-3 bg-slate-500/10 rounded-2xl">
                <Lock className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter((c) => c.isLocked).length}
                </p>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="rounded-full"
        >
          Todos
        </Button>
        <Button
          variant={filter === "unlocked" ? "default" : "outline"}
          onClick={() => setFilter("unlocked")}
          className="rounded-full"
        >
          Liberados
        </Button>
        <Button
          variant={filter === "in_progress" ? "default" : "outline"}
          onClick={() => setFilter("in_progress")}
          className="rounded-full"
        >
          Em Andamento
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
          className="rounded-full"
        >
          Concluídos
        </Button>
        <Button
          variant={filter === "locked" ? "default" : "outline"}
          onClick={() => setFilter("locked")}
          className="rounded-full"
        >
          Bloqueados
        </Button>
      </div>

      {/* Unlocked Courses Section */}
      {unlockedCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Sua preparação para entrevista
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">{getStatusBadge(course)}</div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {course.levelName || course.category}
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
        </div>
      )}

      {/* Locked Courses Section */}
      {lockedCourses.length > 0 && filter !== "unlocked" && filter !== "in_progress" && filter !== "completed" && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Recursos avançados
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Atualize seu pacote para desbloquear estes cursos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden opacity-75"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover grayscale"
                  />
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)