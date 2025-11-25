import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  User, 
  Target, 
  Briefcase, 
  Building2, 
  FileText, 
  Bell, 
  BookOpen, 
  GraduationCap,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TalentHubLayoutProps {
  children: ReactNode;
  userName?: string;
  isAdmin?: boolean;
}

const TalentHubLayout = ({ children, userName, isAdmin }: TalentHubLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/talent-hub" },
    { icon: User, label: "Meu Perfil", path: "/profile" },
    { icon: Target, label: "Minha Jornada", path: "/journey" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Building2, label: "Marcas", path: "/talent-hub", disabled: true },
    { icon: FileText, label: "Documentos", path: "/documents" },
    { icon: Bell, label: "Avisos", path: "/notices" },
    { icon: BookOpen, label: "Cursos", path: "/courses" },
    { icon: GraduationCap, label: "Minha Formação", path: "/training-journey" },
  ];

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-r border-slate-200/50 dark:border-slate-700/50 z-40
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-display tracking-wider text-slate-900 dark:text-slate-100">
              TALENT HUB
            </h1>
            {isAdmin && (
              <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full inline-block mt-2">
                ADMIN
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {userName || "Usuário"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Profissional
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (!item.disabled) {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${active 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                    ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-white' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                      Em breve
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Panel Link */}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              ⚡ Painel Admin
            </button>
          )}

          {/* Sign Out */}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TalentHubLayout;
