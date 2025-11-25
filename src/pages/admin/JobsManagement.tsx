import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Loader2, 
  Search,
  Plus,
  Edit,
  Calendar,
  DollarSign,
  MapPin
} from "lucide-react";
import { z } from "zod";

const jobSchema = z.object({
  talent_id: z.string().uuid(),
  brand_id: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  job_type: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  fee: z.number().optional(),
  location_city: z.string().optional(),
  location_country: z.string().optional(),
  studio: z.string().optional(),
});

const JobsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [talents, setTalents] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    talent_id: "",
    brand_id: "",
    title: "",
    job_type: "",
    description: "",
    status: "sent",
    fee: "",
    location_city: "",
    location_country: "",
    studio: "",
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

      await Promise.all([fetchJobs(), fetchTalents(), fetchBrands()]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        profiles:talent_id (full_name),
        brands:brand_id (name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
  };

  const fetchTalents = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("status", "active")
      .order("full_name");

    if (!error && data) {
      setTalents(data);
    }
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name")
      .order("name");

    if (!error && data) {
      setBrands(data);
    }
  };

  const handleOpenDialog = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        talent_id: job.talent_id,
        brand_id: job.brand_id || "",
        title: job.title,
        job_type: job.job_type || "",
        description: job.description || "",
        status: job.status,
        fee: job.fee ? String(job.fee) : "",
        location_city: job.location_city || "",
        location_country: job.location_country || "",
        studio: job.studio || "",
      });
    } else {
      setEditingJob(null);
      setFormData({
        talent_id: "",
        brand_id: "",
        title: "",
        job_type: "",
        description: "",
        status: "sent",
        fee: "",
        location_city: "",
        location_country: "",
        studio: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        talent_id: formData.talent_id,
        brand_id: formData.brand_id || null,
        title: formData.title,
        job_type: formData.job_type || null,
        description: formData.description || null,
        status: formData.status,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        location_city: formData.location_city || null,
        location_country: formData.location_country || null,
        studio: formData.studio || null,
      };

      jobSchema.parse({ ...data, fee: data.fee || undefined });

      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update(data)
          .eq("id", editingJob.id);

        if (error) throw error;

        toast({
          title: "Job atualizado!",
          description: "As alterações foram salvas",
        });
      } else {
        const { error } = await supabase
          .from("jobs")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Job criado!",
          description: "O job foi adicionado com sucesso",
        });
      }

      setIsDialogOpen(false);
      await fetchJobs();
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
          description: "Não foi possível salvar o job",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      analysis: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      option: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || colors.sent;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sent: "Enviado",
      analysis: "Em Análise",
      approved: "Aprovado",
      rejected: "Rejeitado",
      option: "Opção",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.brands?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-display tracking-wider">JOBS</h1>
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
                    placeholder="Buscar por título, talent ou marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Job
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum job encontrado" : "Nenhum job cadastrado"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className={getStatusColor(job.status)}>
                                {getStatusLabel(job.status)}
                              </Badge>
                              {job.job_type && (
                                <Badge variant="outline">{job.job_type}</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(job)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Talent:</span>{" "}
                            <span className="font-medium">{job.profiles?.full_name}</span>
                          </div>
                          {job.brands && (
                            <div>
                              <span className="text-muted-foreground">Marca:</span>{" "}
                              <span className="font-medium">{job.brands.name}</span>
                            </div>
                          )}
                          {job.fee && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(job.fee)}
                              </span>
                            </div>
                          )}
                          {(job.location_city || job.location_country) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {[job.location_city, job.location_country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Editar Job" : "Novo Job"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Atualize as informações do job" : "Adicione um novo job ao sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="talent_id">Talent *</Label>
                <Select
                  value={formData.talent_id}
                  onValueChange={(value) => setFormData({ ...formData, talent_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o talent" />
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
                <Label htmlFor="brand_id">Marca</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título do Job *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Campanha Nike Running 2024"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_type">Tipo</Label>
                <Input
                  id="job_type"
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                  placeholder="Ex: Fotografia, Vídeo, Evento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="analysis">Em Análise</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="option">Opção</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre o job..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Cachê (R$)</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_city">Cidade</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_country">País</Label>
                <Input
                  id="location_country"
                  value={formData.location_country}
                  onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  placeholder="Brasil"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio">Estúdio</Label>
              <Input
                id="studio"
                value={formData.studio}
                onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
                placeholder="Nome do estúdio ou produtora"
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
                    Salvando...
                  </>
                ) : (
                  editingJob ? "Atualizar" : "Criar Job"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsManagement;
