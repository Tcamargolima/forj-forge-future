import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  FileText,
  ExternalLink,
  Download
} from "lucide-react";

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchDocuments();
  }, []);

  const checkAuthAndFetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await fetchDocuments(session.user.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("talent_id", userId)
      .eq("visible_to_talent", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return;
    }

    setDocuments(data || []);
  };

  const getDocumentTypeLabel = (type: string | null) => {
    if (!type) return "Documento";
    
    const labels: Record<string, string> = {
      contract: "Contrato",
      agreement: "Acordo",
      release: "Release",
      invoice: "Fatura",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string | null) => {
    const colors: Record<string, string> = {
      contract: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      agreement: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      release: "bg-green-500/10 text-green-500 border-green-500/20",
      invoice: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type || "other"] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/talent-hub")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-display tracking-wider">DOCUMENTOS</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Acesse seus contratos, releases e outros documentos importantes
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não tem documentos disponíveis
                  </p>
                </CardContent>
              </Card>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{doc.title}</h3>
                            <Badge className={`mt-1 ${getDocumentTypeColor(doc.document_type)}`}>
                              {getDocumentTypeLabel(doc.document_type)}
                            </Badge>
                          </div>
                          {doc.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir
                              </a>
                            </Button>
                          )}
                        </div>

                        {doc.description && (
                          <p className="text-sm text-muted-foreground">
                            {doc.description}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Adicionado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
