-- Seed para a tabela course_packages (ligação curso-pacote)
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', '65f3445a-6c01-42f1-89b9-b60d69a1af02') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', '0962f9e4-c5a5-4b42-aa7d-192fa06126aa') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', '2edd8fd0-8c4a-4d8e-9d79-fbc5f2972550') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', 'cce57935-9067-4529-8522-62ea9f291eb1') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', 'f5acf08e-7c3a-4f41-b82d-6fc08bd8160d') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', 'd5faca89-270c-4a4a-b525-b58d6069527a') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('start', '3cd250e8-ec5e-48d5-a2b6-560e547ec83c') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('advanced', '5bbe778e-3edc-4712-9315-d0a10a4595a8') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('advanced', '8d4ba4a8-541c-42d9-8957-784ac0bbae11') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('premium', 'ece563ba-9cf4-41e5-9250-f82536f27b4c') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('premium', 'cd3ed5ac-b4f2-42fa-8b87-692b2695664f') ON CONFLICT (package_code, course_id) DO NOTHING;
INSERT INTO public.course_packages (package_code, course_id) VALUES ('premium', '6097ab71-d549-4a47-953f-8ad5d6f6230a') ON CONFLICT (package_code, course_id) DO NOTHING;
