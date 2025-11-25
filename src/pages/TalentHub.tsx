import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, FileText, Bell, BookOpen, Target, TrendingUp, Users, Calendar } from "lucide-react";
import TalentHubLayout from "@/components/TalentHubLayout";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsCards = [
    { icon: Briefcase, label: "Jobs Ativos", value: "3", color: "from-blue-500/10 to-blue-600/20" },
    { icon: Target, label: "Progresso Formação", value: "45%", color: "from-purple-500/10 to-purple-600/20" },
    { icon: BookOpen, label: "Cursos em Andamento", value: "2", color: "from-green-500/10 to-green-600/20" },
    { icon: Bell, label: "Novos Avisos", value: "1", color: "from-orange-500/10 to-orange-600/20" },
  ];

  const quickActions = [
    { icon: Target, label: "Ver Minha Formação", description: "Acompanhe seu desenvolvimento", path: "/training-journey" },
    { icon: BookOpen, label: "Continuar Cursos", description: "Retome seus estudos", path: "/courses" },
    { icon: Briefcase, label: "Ver Jobs", description: "Oportunidades disponíveis", path: "/jobs" },
    { icon: Calendar, label: "Minha Jornada", description: "Timeline da sua carreira", path: "/journey" },
  ];

  return (
    <TalentHubLayout userName={profile?.full_name || user?.email} isAdmin={isAdmin}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Olá, {profile?.full_name?.split(' ')[0] || 'Profissional'}! 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Bem-vindo(a) ao seu painel de gerenciamento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                  <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                {profile?.status || "Ativo"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Data de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {profile?.entry_date 
                ? new Date(profile.entry_date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : "—"}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tipo de Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isAdmin ? "Administrador" : "Profissional"}
            </div>
          </CardContent>
        </Card>
      </div>
    </TalentHubLayout>
  );
};

export default TalentHub;
