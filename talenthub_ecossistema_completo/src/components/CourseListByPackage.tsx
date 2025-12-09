import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  isLocked: boolean;
}

interface CourseListByPackageProps {
  packageCode: string;
  packageName: string;
  courses: Course[];
  emptyMessage?: string;
}

export const CourseListByPackage = ({
  packageCode,
  packageName,
  courses,
  emptyMessage,
}: CourseListByPackageProps) => {
  const navigate = useNavigate();

  if (courses.length === 0) {
    return (
      <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>{packageName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {emptyMessage || "Nenhum curso disponível neste pacote."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {packageName}
          <Badge variant="outline">{courses.length} cursos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-start justify-between p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {course.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {course.totalLessons} aulas
                  </Badge>
                  {course.isLocked && (
                    <Badge className="bg-slate-500/10 text-slate-600 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Bloqueado
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg ml-2"
                onClick={() => navigate(`/courses/${course.id}`)}
                disabled={course.isLocked}
              >
                Acessar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
