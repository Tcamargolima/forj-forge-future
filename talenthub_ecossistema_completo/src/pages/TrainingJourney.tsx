import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock, BookOpen, Target, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TalentHubLayout from "@/components/TalentHubLayout";
import { usePackageAccess, PACKAGES } from "@/hooks/usePackageAccess";

type TrainingLevel = {
  id: string;
  code: string;
  name: string;
  short_name: string;
  order_index: number;
  description: string;
  courseCount: number;
  accessibleCourseCount: number;
  lockedCourseCount: number;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
};

type CourseWithAccess = {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  progress: number;
  status: string;
  isLocked: boolean;
  requiredPackage: string | null;
};

const TrainingJourney = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [levelCourses, setLevelCourses] = useState<CourseWithAccess[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { talentPackage, accessibleCourseIds, loading: packageLoading } = usePackageAccess();

  useEffect(() => {
    if (!packageLoading) {
      loadTrainingLevels();
    }
  }, [packageLoading, accessibleCourseIds]);

  const loadTrainingLevels = async () => {
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
          const courseIds = courses?.map(c => c.id) || [];
          
          // Count accessible vs locked courses
          const accessibleCourseCount = courseIds.filter(id => accessibleCourseIds.has(id)).length;
          const lockedCourseCount = courseCount - accessibleCourseCount;

          // Get talent progress for accessible courses only
          let avgProgress = 0;
          let status: "not_started" | "in_progress" | "completed" = "not_started";

          if (accessibleCourseCount > 0) {
            const accessibleIds = courseIds.filter(id => accessibleCourseIds.has(id));
            const { data: progressData } = await supabase
              .from("talent_courses")
              .select("progress_percentage, status")
              .eq("talent_id", user.id)
              .in("course_id", accessibleIds);

            if (progressData && progressData.length > 0) {
              avgProgress =
                progressData.reduce((sum, p) => sum + p.progress_percentage, 0) /
                accessibleCourseCount;
              
              const allCompleted = progressData.length === accessibleCourseCount && 
                progressData.every((p) => p.status === "completed");
              const someStarted = progressData.some((p) => p.status !== "not_started");

              status = allCompleted ? "completed" : someStarted ? "in_progress" : "not_started";
            }
          }

          return {
            ...level,
            courseCount,
            accessibleCourseCount,
            lockedCourseCount,
            progress: Math.round(avgProgress),
            status,
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

      // Get course packages
      const courseIds = courses?.map(c => c.id) || [];
      const { data: coursePackages } = await supabase
        .from("course_packages")
        .select("course_id, package_code")
        .in("course_id", courseIds);

      const coursePackageMap = new Map<string, string[]>();
      (coursePackages || []).forEach(cp => {
        if (!coursePackageMap.has(cp.course_id)) {
          coursePackageMap.set(cp.course_id, []);
        }
        coursePackageMap.get(cp.course_id)!.push(cp.package_code);
      });

      const coursesWithAccess: CourseWithAccess[] = (courses || []).map(course => {
        const isLocked = !accessibleCourseIds.has(course.id);
        const packages = coursePackageMap.get(course.id) || [];
        const packageOrder = ["start", "advanced", "premium"];
        const sortedPackages = packages.sort(
          (a, b) => packageOrder.indexOf(a) - packageOrder.indexOf(b)
        );

        return {
          id: course.id,
          title: course.title,
          description: course.description || "",
          thumbnail_url: course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=400",
          progress: course.talent_courses?.[0]?.progress_percentage || 0,
          status: course.talent_courses?.[0]?.status || "not_started",
          isLocked,
          requiredPackage: sortedPackages[0] || null,
        };
      });

      setLevelCourses(coursesWithAccess);
      setSelectedLevel(levelId);
    } catch (error) {
      console.error("Error loading level courses:", error);
    }
  };

  const getStatusBadge = (level: TrainingLevel) => {
    if (level.accessibleCourseCount === 0 && level.courseCount > 0) {
      return (
        <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20">
          <Lock className="mr-1 h-3 w-3" />
          Bloqueado
        </Badge>
      );
    }
    switch (level.status) {
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
            Não Iniciado
          </Badge>
        );
    }
  };

  if (loading || packageLoading) {
    return (
      <TalentHubLayout userName={profile?.full_name || user?.email}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando sua jornada...</p>
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
            Minha Formação
          </h1>
          {talentPackage && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1 h-3 w-3" />
              {PACKAGES[talentPackage]?.name}
            </Badge>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Sua jornada até o topo
        </p>
      </div>

      {/* Hero Section */}
      <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50 mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Programa de Formação
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
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
            className={`rounded-2xl border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 cursor-pointer hover:shadow-xl ${
              selectedLevel === level.id ? "ring-2 ring-primary" : ""
            } ${
              level.status === "completed"
                ? "bg-green-500/5"
                : level.status === "in_progress"
                ? "bg-blue-500/5"
                : level.accessibleCourseCount === 0 && level.courseCount > 0
                ? "bg-slate-500/5 opacity-75"
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
                        : level.accessibleCourseCount === 0 && level.courseCount > 0
                        ? "bg-slate-500/20 text-slate-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {level.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : level.accessibleCourseCount === 0 && level.courseCount > 0 ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="font-display text-xl mb-2">{level.name}</CardTitle>
                    <CardDescription className="mb-3">{level.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {level.accessibleCourseCount} curso{level.accessibleCourseCount !== 1 ? "s" : ""} liberado{level.accessibleCourseCount !== 1 ? "s" : ""}
                      </span>
                      {level.lockedCourseCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Lock className="h-4 w-4" />
                          {level.lockedCourseCount} bloqueado{level.lockedCourseCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span>{level.progress}% concluído</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(level)}
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
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Cursos do {levels.find((l) => l.id === selectedLevel)?.short_name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levelCourses.map((course) => (
              <Card
                key={course.id}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden ${
                  course.isLocked ? "opacity-75" : ""
                }`}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      course.isLocked ? "grayscale" : "group-hover:scale-105"
                    }`}
                  />
                  {course.isLocked && (
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                      <div className="bg-background/90 backdrop-blur-sm rounded-full p-3">
                        <Lock className="h-6 w-6 text-slate-600" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {course.isLocked ? (
                      <Badge className="bg-slate-500/80 text-white">
                        <Lock className="mr-1 h-3 w-3" />
                        {PACKAGES[course.requiredPackage || "start"]?.name}
                      </Badge>
                    ) : course.status === "completed" ? (
                      <Badge className="bg-green-500/10 text-green-700">Concluído</Badge>
                    ) : course.status === "in_progress" ? (
                      <Badge className="bg-blue-500/10 text-blue-700">Em Andamento</Badge>
                    ) : null}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="font-display text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.isLocked ? (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Disponível no pacote {PACKAGES[course.requiredPackage || "start"]?.name}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Selected Level */}
      {selectedLevel && levelCourses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum curso disponível
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Os cursos deste nível estarão disponíveis em breve ✨
          </p>
        </div>
      )}
    </TalentHubLayout>
  );
};

export default TrainingJourney;
