import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Users, 
  Calendar, 
  Briefcase, 
  Building2,
  FileText,
  Bell,
  BookOpen,
  GraduationCap
} from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    talents: 0,
    events: 0,
    jobs: 0,
    brands: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchStats();
  }, []);

  const checkAdminAndFetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área",
          variant: "destructive",
        });
        navigate("/talent-hub");
        return;
      }

      setIsAdmin(true);
      await fetchStats();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [talents, events, jobs, brands] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("timeline_events").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("brands").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      talents: talents.count || 0,
      events: events.count || 0,
      jobs: jobs.count || 0,
      brands: brands.count || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { 
      icon: Users, 
      label: "Profissionais", 
      description: "Gerenciar perfis e informações",
      path: "/admin/talents",
      count: stats.talents
    },
    { 
      icon: Calendar, 
      label: "Jornada", 
      description: "Criar e gerenciar eventos",
      path: "/admin/journey",
      count: stats.events
    },
    { 
      icon: Briefcase, 
      label: "Jobs", 
      description: "Trabalhos e oportunidades",
      path: "/admin/jobs",
      count: stats.jobs
    },
    { 
      icon: Building2, 
      label: "Marcas", 
      description: "Gerenciar marcas e clientes",
      path: "/admin/brands",
      count: stats.brands
    },
    { 
      icon: FileText, 
      label: "Documentos", 
      description: "Upload e gestão de arquivos",
      badge: "Em breve"
    },
    { 
      icon: Bell, 
      label: "Avisos", 
      description: "Enviar comunicados",
      badge: "Em breve"
    },
    { 
      icon: BookOpen, 
      label: "Cursos", 
      description: "Gerenciar cursos e formação",
      path: "/admin/courses"
    },
    { 
      icon: GraduationCap, 
      label: "Relatórios de Formação", 
      description: "Acompanhar progresso dos talentos",
      badge: "Em breve"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/talent-hub")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-display tracking-wider">PAINEL ADMINISTRATIVO</h1>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-display mb-2">Gerenciamento do Talent Hub</h2>
          <p className="text-muted-foreground">
            Acesse as ferramentas de administração para gerenciar talentos, jobs e comunicação
          </p>
        </div>

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
                  {item.badge && (
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && !item.badge && (
                    <span className="text-2xl font-bold text-primary">
                      {item.count}
                    </span>
                  )}
                </div>
                <CardTitle className="font-display">{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {item.badge ? "Funcionalidade em desenvolvimento" : "Clique para acessar"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
