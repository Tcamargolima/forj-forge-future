import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles } from "lucide-react";

interface PackageLockedProps {
  requiredPackage: string;
  packageName: string;
  courseTitle: string;
  description?: string;
  onUpgrade?: () => void;
}

export const PackageLocked = ({
  requiredPackage,
  packageName,
  courseTitle,
  description,
  onUpgrade,
}: PackageLockedProps) => {
  return (
    <Card className="rounded-2xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Conteúdo Bloqueado
            </CardTitle>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Este curso requer o pacote <Badge className="ml-1 inline-flex">{packageName}</Badge>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Desbloqueie "{courseTitle}"
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {description || `Adquira o pacote ${packageName} para acessar este curso e muito mais.`}
          </p>
        </div>
        <Button
          onClick={onUpgrade}
          className="w-full rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Adquirir Pacote {packageName}
        </Button>
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          Já possui este pacote? Contate o suporte.
        </p>
      </CardContent>
    </Card>
  );
};
