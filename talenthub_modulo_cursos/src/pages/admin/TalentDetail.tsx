import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  Calendar,
  UserPlus,
  Camera,
  Send,
  FileCheck,
  CheckCircle,
  Megaphone,
  GraduationCap,
  MessageSquare,
  Circle,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  birth_date: z.string().optional(),
  bio: z.string().optional(),
  languages: z.string().optional(),
  english_level: z.string().optional(),
  status: z.string(),
});

const eventSchema = z.object({
  eventType: z.string(),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  eventDate: z.string(),
});

const TalentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  
  const [eventFormData, setEventFormData] = useState({
    eventType: "",
    title: "",
    description: "",
    eventDate: new Date().toISOString().split('T')[0],
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchData();
  }, [id]);

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

      await Promise.all([fetchProfile(), fetchEvents()]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Erro",
        description: "Profissional não encontrado",
        variant: "destructive",
      });
      navigate("/admin/talents");
      return;
    }

    setProfile(data);
  };

  const fetchEvents = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("talent_id", id)
      .order("event_date", { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      profileSchema.parse(profile);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone || null,
          city: profile.city || null,
          state: profile.state || null,
          birth_date: profile.birth_date || null,
          bio: profile.bio || null,
          languages: profile.languages || null,
          english_level: profile.english_level || null,
          status: profile.status,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "As alterações foram salvas com sucesso",
      });
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
          description: "Não foi possível salvar as alterações",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEvent(true);

    try {
      eventSchema.parse(eventFormData);

      const { error } = await supabase
        .from("timeline_events")
        .insert({
          talent_id: id,
          event_type: eventFormData.eventType,
          title: eventFormData.title,
          description: eventFormData.description || null,
          event_date: new Date(eventFormData.eventDate).toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Evento criado!",
        description: "O evento foi adicionado à jornada",
      });

      setIsEventDialogOpen(false);
      setEventFormData({
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
      setSubmittingEvent(false);
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      evaluation: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      terminated: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-metal/10 to-carbon/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/admin/talents")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-display tracking-wider">EDITAR PROFISSIONAL</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profile.profile_photo} />
                  <AvatarFallback className="text-2xl font-display">
                    {profile.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-display mb-2">{profile.full_name}</h2>
                  <Badge className={getStatusColor(profile.status)}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="journey">Jornada</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={profile.city || ""}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={profile.state || ""}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={profile.birth_date || ""}
                        onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={profile.status}
                        onValueChange={(value) => setProfile({ ...profile, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="paused">Em Pausa</SelectItem>
                          <SelectItem value="evaluation">Em Avaliação</SelectItem>
                          <SelectItem value="terminated">Encerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Apresentação</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="languages">Idiomas</Label>
                      <Input
                        id="languages"
                        value={profile.languages || ""}
                        onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                        placeholder="Ex: Português, Inglês, Espanhol"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="english_level">Nível de Inglês</Label>
                      <Select
                        value={profile.english_level || ""}
                        onValueChange={(value) => setProfile({ ...profile, english_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                          <SelectItem value="fluent">Fluente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Journey Tab */}
            <TabsContent value="journey" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
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
                          Adicione um novo evento à jornada deste profissional
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventType">Tipo de Evento *</Label>
                          <Select
                            value={eventFormData.eventType}
                            onValueChange={(value) => setEventFormData({ ...eventFormData, eventType: value })}
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
                            value={eventFormData.title}
                            onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                            placeholder="Ex: Teste para campanha Nike"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={eventFormData.description}
                            onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                            placeholder="Detalhes adicionais..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Data do Evento *</Label>
                          <Input
                            id="eventDate"
                            type="date"
                            value={eventFormData.eventDate}
                            onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                            required
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsEventDialogOpen(false)}
                            disabled={submittingEvent}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" className="flex-1" disabled={submittingEvent}>
                            {submittingEvent ? (
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

              {/* Timeline */}
              <div className="space-y-4">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        Nenhum evento na jornada ainda
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => {
                    const Icon = getEventIcon(event.event_type);
                    return (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow">
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TalentDetail;
