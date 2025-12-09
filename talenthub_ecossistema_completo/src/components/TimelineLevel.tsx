import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Lock } from "lucide-react";

interface TimelineLevelProps {
  levelId: string;
  levelName: string;
  shortName: string;
  courseCount: number;
  completedCourses: number;
  isLocked: boolean;
  requiredPackage?: string;
  orderIndex: number;
}

export const TimelineLevel = ({
  levelId,
  levelName,
  shortName,
  courseCount,
  completedCourses,
  isLocked,
  requiredPackage,
  orderIndex,
}: TimelineLevelProps) => {
  const progressPercentage = courseCount > 0 ? (completedCourses / courseCount) * 100 : 0;
  const isCompleted = completedCourses === courseCount && courseCount > 0;

  return (
    <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Nível {orderIndex}
              </span>
              {isCompleted && (
                <Badge className="bg-green-500/10 text-green-700 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
              {isLocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  {requiredPackage}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{levelName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{shortName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Course Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cursos</span>
          <span className="font-semibold">
            {completedCourses} de {courseCount}
          </span>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2" />

        {/* Status Text */}
        <p className="text-xs text-muted-foreground text-center">
          {isCompleted
            ? "Parabéns! Você completou este nível."
            : `${completedCourses} de ${courseCount} cursos concluídos`}
        </p>
      </CardContent>
    </Card>
  );
};
