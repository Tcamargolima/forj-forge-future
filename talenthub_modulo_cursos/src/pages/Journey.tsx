import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Calendar,
  UserPlus,
  Camera,
  Send,
  FileCheck,
  CheckCircle,
  Megaphone,
  GraduationCap,
  MessageSquare,
  Circle
} from "lucide-react";

const Journey = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchEvents();
  }, [filter]);

  const checkAuthAndFetchEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await fetchEvents(session.user.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a jornada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (userId: string) => {
    let query = supabase
      .from("timeline_events")
      .select("*")
      .eq("talent_id", userId)
      .order("event_date", { ascending: false });

    if (filter !== "all") {
      query = query.eq("event_type", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  };

  const getEventIcon = (type: string) => {
    const icons: Record<string, any> = {
      registration: UserPlus,
      book: Camera,
      submission: Send,
      test: FileCheck,
      approval: CheckCircle,
      campaign: Megaphone,
      training: GraduationCap,
      feedback: MessageSquare,
      other: Circle,
    };
    return icons[type] || Circle;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      registration: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      book: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      submission: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      test: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      approval: "bg-green-500/10 text-green-500 border-green-500/20",
      campaign: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      training: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      feedback: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type] || colors.other;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      registration: "Cadastro",
      book: "Book",
      submission: "Envio",
      test: "Teste",
      approval: "Aprovação",
      campaign: "Campanha",
      training: "Treinamento",
      feedback: "Feedback",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const eventTypes = [
    { value: "all", label: "Todos" },
    { value: "registration", label: "Cadastro" },
    { value: "book", label: "Book" },
    { value: "submission", label: "Envio" },
    { value: "test", label: "Teste" },
    { value: "approval", label: "Aprovação" },
    { value: "campaign", label: "Campanha" },
    { value: "training", label: "Treinamento" },
    { value: "feedback", label: "Feedback" },
  ];

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
            <Button variant="ghost" onClick={() => navigate("/talent-hub")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-display tracking-wider">MINHA JORNADA</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Filtrar Eventos</CardTitle>
              <CardDescription>Selecione o tipo de evento que deseja visualizar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={filter === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhum evento encontrado. Sua jornada será registrada aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              events.map((event, index) => {
                const Icon = getEventIcon(event.event_type);
                return (
                  <Card key={event.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                    {index !== events.length - 1 && (
                      <div className="absolute left-10 top-20 bottom-0 w-0.5 bg-border -translate-y-full group-last:hidden" />
                    )}
                    
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event.event_type)}`}>
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">{event.title}</h3>
                              <Badge className={`mt-1 ${getEventColor(event.event_type)}`}>
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.event_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journey;
