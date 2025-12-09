-- Seed para a tabela training_levels
INSERT INTO public.training_levels (id, name, short_name, order_index) VALUES ('d5526344-c9ce-4688-b418-95ea84bd7e6e', 'Nível 1 - Fundamentos', 'FUNDAMENTOS', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.training_levels (id, name, short_name, order_index) VALUES ('e5dcff61-1c9e-4336-b70d-2db7ceacbeac', 'Nível 2 - Desenvolvimento', 'DESENVOLVIMENTO', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.training_levels (id, name, short_name, order_index) VALUES ('8a9bdffd-cbff-4e15-bd29-a9f493337d3d', 'Nível 3 - Profissionalização', 'PROFISSIONALIZAÇÃO', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.training_levels (id, name, short_name, order_index) VALUES ('5cd4c27c-5c30-4ed6-ab0f-dcb4617b5367', 'Nível 4 - Alto Desempenho', 'ALTO DESEMPENHO', 4) ON CONFLICT (id) DO NOTHING;
