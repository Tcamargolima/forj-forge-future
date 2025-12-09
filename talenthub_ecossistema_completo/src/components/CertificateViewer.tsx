import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Award } from "lucide-react";

interface CertificateViewerProps {
  certificateType: "course" | "level" | "final";
  recipientName: string;
  title: string;
  dateCompleted: string;
  issuerName?: string;
  totalHours?: number;
  certificateId?: string;
}

export const CertificateViewer = ({
  certificateType,
  recipientName,
  title,
  dateCompleted,
  issuerName = "Diretoria de Formação Forj",
  totalHours = 0,
  certificateId = "CERT-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
}: CertificateViewerProps) => {
  const getCertificateBadgeColor = () => {
    switch (certificateType) {
      case "course":
        return "bg-blue-500/10 text-blue-700";
      case "level":
        return "bg-purple-500/10 text-purple-700";
      case "final":
        return "bg-gold-500/10 text-gold-700";
      default:
        return "bg-slate-500/10 text-slate-700";
    }
  };

  const getCertificateLabel = () => {
    switch (certificateType) {
      case "course":
        return "Certificado de Curso";
      case "level":
        return "Certificado de Nível";
      case "final":
        return "Certificado Final de Formação";
      default:
        return "Certificado";
    }
  };

  return (
    <Card className="rounded-2xl overflow-hidden border-slate-200/50 dark:border-slate-700/50">
      {/* Certificate Preview (Simulated) */}
      <div className="w-full h-80 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 border-2 border-amber-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-amber-400 rounded-full opacity-20"></div>

        {/* Certificate Content */}
        <div className="text-center z-10 space-y-3">
          <Award className="h-12 w-12 text-amber-600 mx-auto" />
          <h2 className="text-2xl font-bold text-amber-900">{getCertificateLabel()}</h2>
          <p className="text-sm text-amber-800">Apresentado a</p>
          <p className="text-xl font-semibold text-amber-900">{recipientName}</p>
          <p className="text-sm text-amber-700">{title}</p>
          <p className="text-xs text-amber-600">ID: {certificateId}</p>
        </div>
      </div>

      {/* Certificate Details */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{getCertificateLabel()}</CardTitle>
            <Badge className={`w-fit text-xs mt-2 ${getCertificateBadgeColor()}`}>
              {certificateType === "final" ? "Premium" : certificateType === "level" ? "Nível" : "Curso"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Recipiente</p>
            <p className="font-semibold">{recipientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data de Conclusão</p>
            <p className="font-semibold">{new Date(dateCompleted).toLocaleDateString("pt-BR")}</p>
          </div>
          {totalHours > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Horas de Formação</p>
              <p className="font-semibold">{totalHours}h</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Emitido por</p>
            <p className="font-semibold">{issuerName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-lg"
            onClick={() => {
              const text = `Completei o ${title} no Talent Hub! 🎓 Certificado ID: ${certificateId}`;
              navigator.clipboard.writeText(text);
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {/* Verification Link */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Verifique este certificado em: <span className="font-mono text-blue-600">talent-hub.forj/verify/{certificateId}</span>
        </p>
      </CardContent>
    </Card>
  );
};
