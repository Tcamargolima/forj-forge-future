import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  totalLessons: number;
  completedLessons: number;
  isLocked: boolean;
  requiredPackage?: string;
  levelName?: string;
}

export const CourseCard = ({
  id,
  title,
  description,
  thumbnail_url,
  progress,
  status,
  totalLessons,
  completedLessons,
  isLocked,
  requiredPackage,
  levelName,
}: CourseCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700";
      case "in_progress":
        return "bg-blue-500/10 text-blue-700";
      default:
        return "bg-slate-500/10 text-slate-600";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "in_progress":
        return "Em Andamento";
      default:
        return "Não Iniciado";
    }
  };

  return (
    <Card className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border-slate-200/50 dark:border-slate-700/50">
      {/* Thumbnail */}
      <div className="w-full h-40 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
        <img
          src={thumbnail_url}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          {isLocked ? (
            <Lock className="h-8 w-8 text-white/60" />
          ) : (
            <Play className="h-8 w-8 text-white/60" />
          )}
        </div>
      </div>

      {/* Content */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
            {levelName && (
              <CardDescription className="text-xs mt-1">{levelName}</CardDescription>
            )}
          </div>
          {isLocked && (
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              {requiredPackage || "Bloqueado"}
            </Badge>
          )}
        </div>
        <Badge className={`w-fit text-xs ${getStatusColor()}`}>
          {getStatusLabel()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {!isLocked && (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedLessons} de {totalLessons} aulas concluídas
              </p>
            </div>
          </>
        )}

        {/* CTA Button */}
        <Button
          onClick={() => navigate(`/courses/${id}`)}
          className="w-full rounded-lg"
          variant={isLocked ? "outline" : "default"}
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Desbloqueado com {requiredPackage}
            </>
          ) : status === "completed" ? (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Revisar Curso
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {status === "in_progress" ? "Continuar" : "Iniciar"} Curso
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
