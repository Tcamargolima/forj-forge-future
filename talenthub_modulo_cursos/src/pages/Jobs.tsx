import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  FileText
} from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchJobs();
  }, []);

  const checkAuthAndFetchJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await fetchJobs(session.user.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (userId: string) => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        brands:brand_id (name, segment)
      `)
      .eq("talent_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return;
    }

    setJobs(data || []);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      analysis: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      option: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || colors.sent;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: "Enviado",
      analysis: "Em Análise",
      approved: "Aprovado",
      rejected: "Rejeitado",
      option: "Opção",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
        <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar aos Jobs
              </Button>
              <h1 className="text-2xl font-display tracking-wider">DETALHES DO JOB</h1>
              <div className="w-32" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-2xl">{selectedJob.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getStatusColor(selectedJob.status)}>
                        {getStatusLabel(selectedJob.status)}
                      </Badge>
                      {selectedJob.job_type && (
                        <Badge variant="outline">{selectedJob.job_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedJob.brands && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Marca</h3>
                    </div>
                    <p className="text-lg">{selectedJob.brands.name}</p>
                    {selectedJob.brands.segment && (
                      <p className="text-sm text-muted-foreground">{selectedJob.brands.segment}</p>
                    )}
                  </div>
                )}

                {selectedJob.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Descrição</h3>
                    </div>
                    <p className="text-muted-foreground">{selectedJob.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {selectedJob.fee && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cachê</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(selectedJob.fee)}
                      </p>
                    </div>
                  )}

                  {(selectedJob.location_city || selectedJob.location_country) && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Local</span>
                      </div>
                      <p className="text-lg">
                        {[selectedJob.location_city, selectedJob.location_country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {selectedJob.studio && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Estúdio</span>
                      </div>
                      <p className="text-lg">{selectedJob.studio}</p>
                    </div>
                  )}

                  {selectedJob.sent_date && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Data de Envio</span>
                      </div>
                      <p className="text-lg">
                        {new Date(selectedJob.sent_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
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
            <h1 className="text-2xl font-display tracking-wider">MEUS JOBS</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Trabalhos e Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe todos os seus trabalhos, desde envios até campanhas concluídas
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não tem jobs registrados
                  </p>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge className={getStatusColor(job.status)}>
                              {getStatusLabel(job.status)}
                            </Badge>
                            {job.job_type && (
                              <Badge variant="outline">{job.job_type}</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {job.brands && (
                            <div>
                              <span className="text-muted-foreground">Marca:</span>{" "}
                              <span className="font-medium">{job.brands.name}</span>
                            </div>
                          )}
                          {job.fee && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(job.fee)}
                              </span>
                            </div>
                          )}
                          {(job.location_city || job.location_country) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {[job.location_city, job.location_country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          {job.sent_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(job.sent_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        )}
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

export default Jobs;
