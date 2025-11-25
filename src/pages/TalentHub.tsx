import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, User as UserIcon, Calendar, Briefcase, FileText, Bell, BookOpen, Target } from "lucide-react";

const TalentHub = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else {
          // Defer profile fetching with setTimeout
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
        setLoading(false);
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;
      setIsAdmin(!!roleData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Até logo!",
        description: "Você saiu do sistema",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { icon: UserIcon, label: "Meu Perfil", description: "Visualize seus dados pessoais", path: "/profile" },
    { icon: Calendar, label: "Jornada", description: "Acompanhe sua trajetória", path: "/journey" },
    { icon: Target, label: "Minha Formação", description: "Programa de capacitação", path: "/training-journey" },
    { icon: BookOpen, label: "Cursos", description: "Plataforma de aprendizado", path: "/courses" },
    { icon: Briefcase, label: "Jobs", description: "Trabalhos e oportunidades", path: "/jobs" },
    { icon: FileText, label: "Documentos", description: "Contratos e materiais", path: "/documents" },
    { icon: Bell, label: "Avisos", description: "Mensagens da agência", path: "/notices" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-wider">TALENT HUB</h1>
              {isAdmin && (
                <span className="text-xs text-primary font-medium">ADMIN</span>
              )}
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display mb-2">
            Bem-vindo(a), {profile?.full_name || user?.email}!
          </h2>
          <p className="text-muted-foreground">
            Gerencie sua carreira e acompanhe todas as suas oportunidades
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card 
              key={item.label} 
              className={`hover:shadow-lg transition-shadow group ${item.path ? 'cursor-pointer' : ''}`}
              onClick={() => item.path && navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <item.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="font-display">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Clique para acessar
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <Card className="bg-primary/5 border-primary/20 mt-8">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <span className="text-primary">⚡</span> Acesso Administrativo
              </CardTitle>
              <CardDescription>
                Você tem permissões de administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/admin")} className="w-full">
                Acessar Painel Administrativo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary capitalize">
                {profile?.status || "Ativo"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data de Entrada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.entry_date 
                  ? new Date(profile.entry_date).toLocaleDateString('pt-BR')
                  : "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? "Administrador" : "Profissional"}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TalentHub;
