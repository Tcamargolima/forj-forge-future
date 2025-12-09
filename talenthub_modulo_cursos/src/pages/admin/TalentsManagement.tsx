import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Search,
  Plus,
  Edit,
  Calendar
} from "lucide-react";

const TalentsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchTalents();
  }, []);

  const checkAdminAndFetchTalents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        navigate("/talent-hub");
        return;
      }

      await fetchTalents();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTalents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching talents:", error);
      return;
    }

    setTalents(data || []);
  };

  const filteredTalents = talents.filter((talent) =>
    talent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      evaluation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      terminated: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.active;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      paused: "Em Pausa",
      evaluation: "Em Avaliação",
      terminated: "Encerrado",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-display tracking-wider">PROFISSIONAIS</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Actions Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, cidade ou status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Profissional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Talents List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTalents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum profissional encontrado" : "Nenhum profissional cadastrado"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTalents.map((talent) => (
                <Card key={talent.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={talent.profile_photo} />
                        <AvatarFallback className="text-lg">
                          {talent.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{talent.full_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(talent.status)}>
                                {getStatusLabel(talent.status)}
                              </Badge>
                              {talent.city && (
                                <span className="text-sm text-muted-foreground">
                                  {talent.city}{talent.state && `, ${talent.state}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/talents/${talent.id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </div>

                        {talent.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {talent.bio}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {talent.entry_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Entrada: {new Date(talent.entry_date).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                          {talent.phone && (
                            <span>{talent.phone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Stats Footer */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Total de {filteredTalents.length} profissionai{filteredTalents.length !== 1 ? 's' : ''} 
                {searchTerm && " encontrado(s)"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TalentsManagement;
