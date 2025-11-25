import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, Languages, Activity } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/talent-hub")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-display tracking-wider">MEU PERFIL</h1>
            <div className="w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={profile?.profile_photo} />
                  <AvatarFallback className="text-3xl font-display">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h2 className="text-3xl font-display mb-2">{profile?.full_name}</h2>
                    <Badge className={getStatusColor(profile?.status || "active")}>
                      {getStatusLabel(profile?.status || "active")}
                    </Badge>
                  </div>

                  {profile?.bio && (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                    {user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.birth_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data de Nascimento</div>
                      <div className="text-base">
                        {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                )}

                {(profile?.city || profile?.state) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Localização</div>
                      <div className="text-base">
                        {[profile?.city, profile?.state].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {profile?.entry_date && (
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data de Entrada</div>
                      <div className="text-base">
                        {new Date(profile.entry_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                )}

                {profile?.languages && (
                  <div className="flex items-start gap-3">
                    <Languages className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Idiomas</div>
                      <div className="text-base">{profile.languages}</div>
                    </div>
                  </div>
                )}
              </div>

              {profile?.english_level && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Nível de Inglês</div>
                    <Badge variant="outline">{profile.english_level}</Badge>
                  </div>
                </>
              )}

              {profile?.physical_attributes && Object.keys(profile.physical_attributes).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-3">Atributos Físicos</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(profile.physical_attributes).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                          <div className="text-sm font-medium">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Banner */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Para atualizar suas informações, entre em contato com a administração da agência.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
