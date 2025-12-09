import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface ProgressTrackerProps {
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  currentLessonIndex: number;
  lessons: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
}

export const ProgressTracker = ({
  courseTitle,
  totalLessons,
  completedLessons,
  currentLessonIndex,
  lessons,
}: ProgressTrackerProps) => {
  const progressPercentage = (completedLessons / totalLessons) * 100;
  const isCoursecompleted = completedLessons === totalLessons;

  return (
    <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{courseTitle}</CardTitle>
          {isCoursecompleted && (
            <Badge className="bg-green-500/10 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Lesson List */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Aulas ({completedLessons}/{totalLessons})</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  index === currentLessonIndex
                    ? "bg-blue-500/10 border-l-2 border-blue-500"
                    : lesson.isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {lesson.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
                <span className="flex-1 line-clamp-1">{lesson.title}</span>
                {index === currentLessonIndex && (
                  <Badge variant="outline" className="text-xs">
                    Atual
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion Message */}
        {isCoursecompleted && (
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <p className="text-sm text-green-700 font-semibold">
              Parabéns! Você completou este curso. 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
