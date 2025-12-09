import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, GripVertical, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Lesson = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  material_url: string;
  order_index: number;
  is_active: boolean;
};

const CourseLessonsManagement = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    material_url: "",
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    checkAdmin();
    loadData();
  }, [courseId]);

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
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as aulas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title) {
        toast({
          title: "Campo obrigatório",
          description: "Preencha o título da aula.",
          variant: "destructive",
        });
        return;
      }

      const lessonData = {
        ...formData,
        course_id: courseId,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) throw error;

        toast({
          title: "Aula atualizada",
          description: "As alterações foram salvas.",
        });
      } else {
        // Set order_index to be the next in sequence
        const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) : 0;
        lessonData.order_index = maxOrder + 1;

        const { error } = await supabase
          .from("course_lessons")
          .insert(lessonData);

        if (error) throw error;

        toast({
          title: "Aula criada",
          description: "A nova aula foi adicionada.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a aula.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;

    try {
      const { error } = await supabase
        .from("course_lessons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Aula excluída",
        description: "A aula foi removida.",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a aula.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      material_url: lesson.material_url || "",
      order_index: lesson.order_index,
      is_active: lesson.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({
      title: "",
      description: "",
      video_url: "",
      material_url: "",
      order_index: 0,
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/courses")} className="mb-4">
            ← Voltar aos Cursos
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {course?.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gerencie as aulas deste curso
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Aula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingLesson ? "Editar Aula" : "Nova Aula"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da aula
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nome da aula"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da aula"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="video_url">URL do Vídeo</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="material_url">URL do Material (opcional)</Label>
                    <Input
                      id="material_url"
                      value={formData.material_url}
                      onChange={(e) => setFormData({ ...formData, material_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Aula ativa</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingLesson ? "Salvar Alterações" : "Criar Aula"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lesson.is_active ? (
                          <Badge className="bg-green-500/10 text-green-700">Ativa</Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.video_url && (
                        <Badge variant="secondary" className="text-xs">
                          <Play className="mr-1 h-3 w-3" />
                          Vídeo
                        </Badge>
                      )}
                      {lesson.material_url && (
                        <Badge variant="secondary" className="text-xs">
                          Material
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(lesson)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-16">
            <Play className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Nenhuma aula cadastrada
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Comece criando a primeira aula do curso
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLessonsManagement;
