import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Loader2, 
  Search,
  Plus,
  Edit,
  Trash
} from "lucide-react";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  segment: z.string().optional(),
  description: z.string().optional(),
  internal_notes: z.string().optional(),
});

const BrandsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    segment: "",
    description: "",
    internal_notes: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndFetchBrands();
  }, []);

  const checkAdminAndFetchBrands = async () => {
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

      await fetchBrands();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (!error && data) {
      setBrands(data);
    }
  };

  const handleOpenDialog = (brand?: any) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        segment: brand.segment || "",
        description: brand.description || "",
        internal_notes: brand.internal_notes || "",
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        segment: "",
        description: "",
        internal_notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      brandSchema.parse(formData);

      if (editingBrand) {
        const { error } = await supabase
          .from("brands")
          .update({
            name: formData.name,
            segment: formData.segment || null,
            description: formData.description || null,
            internal_notes: formData.internal_notes || null,
          })
          .eq("id", editingBrand.id);

        if (error) throw error;

        toast({
          title: "Marca atualizada!",
          description: "As alterações foram salvas",
        });
      } else {
        const { error } = await supabase
          .from("brands")
          .insert({
            name: formData.name,
            segment: formData.segment || null,
            description: formData.description || null,
            internal_notes: formData.internal_notes || null,
          });

        if (error) throw error;

        toast({
          title: "Marca criada!",
          description: "A marca foi adicionada com sucesso",
        });
      }

      setIsDialogOpen(false);
      await fetchBrands();
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
          description: "Não foi possível salvar a marca",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta marca?")) return;

    try {
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Marca excluída",
        description: "A marca foi removida do sistema",
      });

      await fetchBrands();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a marca",
        variant: "destructive",
      });
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.segment?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl font-display tracking-wider">MARCAS</h1>
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
                    placeholder="Buscar por nome ou segmento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Marca
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBrands.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhuma marca encontrada" : "Nenhuma marca cadastrada"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBrands.map((brand) => (
                <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-display">{brand.name}</CardTitle>
                        {brand.segment && (
                          <p className="text-sm text-muted-foreground mt-1">{brand.segment}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {brand.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {brand.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBrand ? "Editar Marca" : "Nova Marca"}</DialogTitle>
            <DialogDescription>
              {editingBrand ? "Atualize as informações da marca" : "Adicione uma nova marca ao sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Marca *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Nike"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                placeholder="Ex: Esportes, Moda, Tecnologia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da marca..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Notas Internas</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                placeholder="Observações internas sobre a marca..."
                rows={2}
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
                  editingBrand ? "Atualizar" : "Criar Marca"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandsManagement;
