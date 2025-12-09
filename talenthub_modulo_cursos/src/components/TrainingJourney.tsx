import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface TrainingLevel {
  id: string;
  name: string;
  short_name: string;
  order_index: number;
}

interface TrainingJourneyProps {
  levels: TrainingLevel[];
  currentLevel?: string;
  completedLevels: string[];
}

export const TrainingJourney = ({
  levels,
  currentLevel,
  completedLevels,
}: TrainingJourneyProps) => {
  const sortedLevels = [...levels].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle>Sua Jornada de Aprendizado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLevels.map((level, index) => {
            const isCompleted = completedLevels.includes(level.id);
            const isCurrent = currentLevel === level.id;
            const isNext = !isCompleted && !isCurrent && index === completedLevels.length;

            return (
              <div key={level.id} className="flex items-start gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  ) : isCurrent ? (
                    <div className="p-2 bg-blue-500/10 rounded-full animate-pulse">
                      <Circle className="h-6 w-6 text-blue-600 fill-blue-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-500/10 rounded-full">
                      <Circle className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  {index < sortedLevels.length - 1 && (
                    <div className={`w-1 h-8 my-2 ${isCompleted ? "bg-green-500" : "bg-slate-300"}`} />
                  )}
                </div>

                {/* Level Info */}
                <div className="flex-1 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {level.name}
                    </h4>
                    {isCompleted && (
                      <Badge className="bg-green-500/10 text-green-700 text-xs">
                        Concluído
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="bg-blue-500/10 text-blue-700 text-xs">
                        Em Progresso
                      </Badge>
                    )}
                    {isNext && (
                      <Badge variant="outline" className="text-xs">
                        Próximo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{level.short_name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
