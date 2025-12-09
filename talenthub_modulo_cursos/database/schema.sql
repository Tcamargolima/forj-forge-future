
-- Tabela course_packages (Define quais cursos pertencem a qual pacote)
CREATE TABLE public.course_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code TEXT NOT NULL CHECK (package_code IN ('start', 'advanced', 'premium')),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (package_code, course_id)
);

-- Tabela talent_packages (Define o pacote adquirido por cada talento)
CREATE TABLE public.talent_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_code TEXT NOT NULL CHECK (package_code IN ('start', 'advanced', 'premium')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (talent_id)
);

-- Habilitar RLS
ALTER TABLE public.course_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_packages ENABLE ROW LEVEL SECURITY;

-- RLS para course_packages: qualquer autenticado pode ler, apenas admin pode gerenciar
CREATE POLICY "Authenticated users can view course packages"
ON public.course_packages FOR SELECT
USING (true);

-- Assumindo que a função has_role existe e funciona para verificar o papel 'admin'
CREATE POLICY "Only admins can manage course packages"
ON public.course_packages FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS para talent_packages: talentos veem o próprio, admin vê todos
CREATE POLICY "Talents can view their own package"
ON public.talent_packages FOR SELECT
USING ((auth.uid() = talent_id) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage talent packages"
ON public.talent_packages FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at em talent_packages (assumindo que a função update_updated_at_column existe)
CREATE TRIGGER update_talent_packages_updated_at
BEFORE UPDATE ON public.talent_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
