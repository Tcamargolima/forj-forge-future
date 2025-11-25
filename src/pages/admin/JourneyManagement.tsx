import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Loader2, 
  Plus,
  Calendar
} from "lucide-react";
import { z } from "zod";

const eventSchema = z.object({
  talentId: z.string().uuid(),
  eventType: z.string(),
  title: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  eventDate: z.string(),
});

const JourneyManagement = () => {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    talentId: "",
    eventType: "",
    title: "",
    description: "",
    eventDate: new Date().toISOString().split('T')[0],
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
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

      await Promise.all([fetchTalents(), fetchEvents()]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTalents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, status")
      .eq("status", "active")
      .order("full_name");

    if (!error && data) {
      setTalents(data);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("timeline_events")
      .select(`
        *,
        profiles:talent_id (full_name)
      `)
      .order("event_date", { ascending: false })
      .limit(20);

    if (!error && data) {
      setEvents(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      eventSchema.parse(formData);

      const { error } = await supabase
        .from("timeline_events")
        .insert({
          talent_id: formData.talentId,
          event_type: formData.eventType,
          title: formData.title,
          description: formData.description || null,
          event_date: new Date(formData.eventDate).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado à jornada do profissional",
      });

      setIsDialogOpen(false);
      setFormData({
        talentId: "",
        eventType: "",
        title: "",
        description: "",
        eventDate: new Date().toISOString().split('T')[0],
      });
      
      await fetchEvents();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o evento",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const eventTypes = [
    { value: "registration", label: "Cadastro" },
    { value: "book", label: "Book" },
    { value: "submission", label: "Envio" },
    { value: "test", label: "Teste" },
    { value: "approval", label: "Aprovação" },
    { value: "campaign", label: "Campanha" },
    { value: "training", label: "Treinamento" },
    { value: "feedback", label: "Feedback" },
    { value: "other", label: "Outro" },
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
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-display tracking-wider">GERENCIAR JORNADA</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Create Event */}
          <Card>
            <CardContent className="pt-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Evento na Jornada</DialogTitle>
                    <DialogDescription>
                      Adicione um novo evento à jornada de um profissional
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="talentId">Profissional *</Label>
                      <Select
                        value={formData.talentId}
                        onValueChange={(value) => setFormData({ ...formData, talentId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {talents.map((talent) => (
                            <SelectItem key={talent.id} value={talent.id}>
                              {talent.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">Tipo de Evento *</Label>
                      <Select
                        value={formData.eventType}
                        onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Teste para campanha Nike"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalhes adicionais sobre o evento..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Data do Evento *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          "Criar Evento"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Eventos Recentes</h3>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum evento criado ainda
                  </p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.profiles?.full_name} • {new Date(event.event_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JourneyManagement;
