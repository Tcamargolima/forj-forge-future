CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'talent'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign talent role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'talent');
  
  -- Create registration timeline event
  INSERT INTO public.timeline_events (talent_id, event_type, title, description)
  VALUES (
    NEW.id,
    'registration',
    'Cadastro realizado',
    'Bem-vindo(a) ao Talent Hub!'
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    segment text,
    description text,
    internal_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    video_url text,
    material_url text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    level_id uuid,
    thumbnail_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    document_type text,
    title text NOT NULL,
    description text,
    file_url text,
    visible_to_talent boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT documents_document_type_check CHECK ((document_type = ANY (ARRAY['contract'::text, 'manual'::text, 'authorization'::text, 'material'::text, 'release'::text, 'other'::text])))
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    brand_id uuid,
    title text NOT NULL,
    job_type text,
    status text DEFAULT 'sent'::text,
    sent_date timestamp with time zone,
    confirmation_date timestamp with time zone,
    completion_date timestamp with time zone,
    location_city text,
    location_country text,
    studio text,
    description text,
    fee numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT jobs_job_type_check CHECK ((job_type = ANY (ARRAY['campaign'::text, 'runway'::text, 'commercial'::text, 'editorial'::text, 'digital'::text, 'test'::text, 'other'::text]))),
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'analysis'::text, 'approved'::text, 'rejected'::text, 'option'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    course_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    profile_photo text,
    birth_date date,
    city text,
    state text,
    phone text,
    bio text,
    languages text,
    english_level text,
    physical_attributes jsonb,
    status text DEFAULT 'active'::text,
    entry_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'evaluation'::text, 'terminated'::text])))
);


--
-- Name: talent_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.talent_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    course_id uuid NOT NULL,
    status text DEFAULT 'not_started'::text,
    progress_percentage integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    talent_id uuid NOT NULL,
    event_type text NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone DEFAULT now(),
    job_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT timeline_events_event_type_check CHECK ((event_type = ANY (ARRAY['registration'::text, 'book'::text, 'submission'::text, 'test'::text, 'approval'::text, 'campaign'::text, 'training'::text, 'feedback'::text, 'other'::text])))
);


--
-- Name: training_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    short_name text,
    order_index integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: course_lessons course_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT course_lessons_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_talent_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_talent_id_lesson_id_key UNIQUE (talent_id, lesson_id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: talent_courses talent_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_courses
    ADD CONSTRAINT talent_courses_pkey PRIMARY KEY (id);


--
-- Name: talent_courses talent_courses_talent_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_courses
    ADD CONSTRAINT talent_courses_talent_id_course_id_key UNIQUE (talent_id, course_id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: training_levels training_levels_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_levels
    ADD CONSTRAINT training_levels_code_key UNIQUE (code);


--
-- Name: training_levels training_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_levels
    ADD CONSTRAINT training_levels_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: brands update_brands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: course_lessons update_course_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lesson_progress update_lesson_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: talent_courses update_talent_courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_talent_courses_updated_at BEFORE UPDATE ON public.talent_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: training_levels update_training_levels_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_training_levels_updated_at BEFORE UPDATE ON public.training_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: course_lessons course_lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT course_lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.training_levels(id) ON DELETE SET NULL;


--
-- Name: documents documents_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notices notices_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: talent_courses talent_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_courses
    ADD CONSTRAINT talent_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: talent_courses talent_courses_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.talent_courses
    ADD CONSTRAINT talent_courses_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: timeline_events timeline_events_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: timeline_events timeline_events_talent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles Admins can insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: jobs Admins can manage all jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all jobs" ON public.jobs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: brands Admins can manage brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage brands" ON public.brands USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can manage documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage documents" ON public.documents USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: notices Admins can manage notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage notices" ON public.notices USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: timeline_events Admins can manage timeline events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage timeline events" ON public.timeline_events USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update any profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: training_levels Anyone can view training levels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view training levels" ON public.training_levels FOR SELECT USING (true);


--
-- Name: brands Authenticated users can view brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view brands" ON public.brands FOR SELECT TO authenticated USING (true);


--
-- Name: talent_courses Only admins can delete course progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete course progress" ON public.talent_courses FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: courses Only admins can delete courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete courses" ON public.courses FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: lesson_progress Only admins can delete lesson progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete lesson progress" ON public.lesson_progress FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: courses Only admins can manage courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage courses" ON public.courses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: course_lessons Only admins can manage lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage lessons" ON public.course_lessons USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: training_levels Only admins can manage training levels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage training levels" ON public.training_levels USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: courses Only admins can update courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update courses" ON public.courses FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: talent_courses Talents can insert their own course progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can insert their own course progress" ON public.talent_courses FOR INSERT WITH CHECK (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: lesson_progress Talents can insert their own lesson progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can insert their own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: talent_courses Talents can update their own course progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can update their own course progress" ON public.talent_courses FOR UPDATE USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: lesson_progress Talents can update their own lesson progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can update their own lesson progress" ON public.lesson_progress FOR UPDATE USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: notices Talents can update their own notices (mark as read); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can update their own notices (mark as read)" ON public.notices FOR UPDATE USING ((auth.uid() = talent_id)) WITH CHECK ((auth.uid() = talent_id));


--
-- Name: talent_courses Talents can view their own course progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their own course progress" ON public.talent_courses FOR SELECT USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: jobs Talents can view their own jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their own jobs" ON public.jobs FOR SELECT USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: lesson_progress Talents can view their own lesson progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their own lesson progress" ON public.lesson_progress FOR SELECT USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: notices Talents can view their own notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their own notices" ON public.notices FOR SELECT USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: timeline_events Talents can view their own timeline; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their own timeline" ON public.timeline_events FOR SELECT USING (((auth.uid() = talent_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: documents Talents can view their visible documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Talents can view their visible documents" ON public.documents FOR SELECT USING ((((auth.uid() = talent_id) AND (visible_to_talent = true)) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: courses Users can view active courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active courses" ON public.courses FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: course_lessons Users can view active lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view active lessons" ON public.course_lessons FOR SELECT USING (((is_active = true) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (((auth.uid() = id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: course_lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: notices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: talent_courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.talent_courses ENABLE ROW LEVEL SECURITY;

--
-- Name: timeline_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

--
-- Name: training_levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.training_levels ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


