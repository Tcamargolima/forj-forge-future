import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, BookOpen, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level_id: string;
  thumbnail_url: string;
  is_active: boolean;
  training_levels?: {
    name: string;
    short_name: string;
  };
};

type TrainingLevel = {
  id: string;
  name: string;
  short_name: string;
};

const CoursesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level_id: "",
    thumbnail_url: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      navigate("/talent-hub");
    }
  };

  const loadData = async () => {
    try {
      // Load courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          training_levels (
            name,
            short_name
          )
        `)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Load levels
      const { data: levelsData, error: levelsError } = await supabase
        .from("training_levels")
        .select("*")
        .order("order_index");

      if (levelsError) throw levelsError;
      setLevels(levelsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os cursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.level_id) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha título e nível.",
          variant: "destructive",
        });
        return;
      }

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(formData)
          .eq("id", editingCourse.id);

        if (error) throw error;

        toast({
          title: "Curso atualizado",
          description: "As alterações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from("courses")
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Curso criado",
          description: "O novo curso foi adicionado.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o curso.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Curso excluído",
        description: "O curso foi removido.",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o curso.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      category: course.category || "",
      level_id: course.level_id || "",
      thumbnail_url: course.thumbnail_url || "",
      is_active: course.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      level_id: "",
      thumbnail_url: "",
      is_active: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Gerenciar Cursos
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Crie e gerencie cursos do programa de formação
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Novo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? "Editar Curso" : "Novo Curso"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do curso
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome do curso"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do curso"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Ex: Técnico, Comportamental"
                      />
                    </div>

                    <div>
                      <Label htmlFor="level">Nível *</Label>
                      <Select
                        value={formData.level_id}
                        onValueChange={(value) => setFormData({ ...formData, level_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.id} value={level.id}>
                              {level.short_name || level.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="thumbnail">URL da Imagem</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Curso ativo</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingCourse ? "Salvar Alterações" : "Criar Curso"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total de Cursos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c) => c.is_active).length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{levels.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Níveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="rounded-2xl border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=400"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {course.is_active ? (
                    <Badge className="bg-green-500/10 text-green-700">Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/10">Inativo</Badge>
                  )}
                </div>
                {course.training_levels && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {course.training_levels.short_name}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Aulas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Nenhum curso cadastrado
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Comece criando seu primeiro curso
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesManagement;
