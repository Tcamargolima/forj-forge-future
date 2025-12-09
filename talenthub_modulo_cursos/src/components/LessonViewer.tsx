import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Play, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

interface LessonViewerProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
  videoUrl: string;
  pdfUrl?: string;
  description?: string;
  isCompleted: boolean;
  orderIndex: number;
  totalLessons: number;
  onMarkComplete?: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
}

export const LessonViewer = ({
  lessonId,
  courseId,
  lessonTitle,
  videoUrl,
  pdfUrl,
  description,
  isCompleted,
  orderIndex,
  totalLessons,
  onMarkComplete,
  onNavigate,
}: LessonViewerProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const canGoNext = orderIndex < totalLessons;
  const canGoPrev = orderIndex > 1;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card className="rounded-2xl overflow-hidden border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          >
            Seu navegador não suporta vídeos HTML5.
          </video>
          {!videoUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <Play className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-white/50">Vídeo não disponível</p>
            </div>
          )}
        </div>
      </Card>

      {/* Lesson Info */}
      <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  Aula {orderIndex} de {totalLessons}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500/10 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluída
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{lessonTitle}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {pdfUrl && (
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => window.open(pdfUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            )}
            {!isCompleted && (
              <Button
                className="rounded-lg"
                onClick={onMarkComplete}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setShowNotes(!showNotes)}
            >
              <FileText className="h-4 w-4 mr-2" />
              {showNotes ? "Ocultar" : "Minhas"} Notas
            </Button>
          </div>

          {/* Notes Section */}
          {showNotes && (
            <div className="border-t pt-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva suas notas aqui..."
                className="w-full h-32 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                As notas são salvas localmente no seu navegador.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-lg flex-1"
          disabled={!canGoPrev}
          onClick={() => onNavigate?.("prev")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Aula Anterior
        </Button>
        <Button
          variant="outline"
          className="rounded-lg flex-1"
          disabled={!canGoNext}
          onClick={() => onNavigate?.("next")}
        >
          Próxima Aula
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
