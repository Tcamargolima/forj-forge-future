import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Bell,
  CheckCircle2
} from "lucide-react";

const Notices = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchNotices();
  }, []);

  const checkAuthAndFetchNotices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await fetchNotices(session.user.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async (userId: string) => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("talent_id", userId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Error fetching notices:", error);
      return;
    }

    setNotices(data || []);
  };

  const markAsRead = async (noticeId: string) => {
    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_read: true })
        .eq("id", noticeId);

      if (error) throw error;

      setNotices(notices.map(notice => 
        notice.id === noticeId ? { ...notice, is_read: true } : notice
      ));
    } catch (error) {
      console.error("Error marking notice as read:", error);
    }
  };

  const unreadCount = notices.filter(n => !n.is_read).length;

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display tracking-wider">AVISOS</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} {unreadCount === 1 ? "novo" : "novos"}
                </Badge>
              )}
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Mensagens e comunicados importantes da agência
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {notices.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você não tem avisos no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              notices.map((notice) => (
                <Card 
                  key={notice.id} 
                  className={`hover:shadow-lg transition-shadow ${!notice.is_read ? 'border-primary/30' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        notice.is_read 
                          ? 'bg-muted' 
                          : 'bg-primary/10'
                      }`}>
                        <Bell className={`h-6 w-6 ${notice.is_read ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{notice.title}</h3>
                            {!notice.is_read && (
                              <Badge variant="default" className="mt-1">
                                Novo
                              </Badge>
                            )}
                          </div>
                          {!notice.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notice.id)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Marcar como lido
                            </Button>
                          )}
                        </div>

                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {notice.message}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(notice.sent_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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

export default Notices;
