-- Copie e cole este código no SQL Editor do seu Supabase e clique em "Run"

-- 0. Habilitar a extensão necessária para gerar IDs únicos (UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Criar a tabela de Pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar a tabela de Consultas (Agenda)
CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    paciente_nome TEXT,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'Agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar a tabela de Prontuários
CREATE TABLE IF NOT EXISTS public.prontuarios (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    paciente_nome TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Desabilitar RLS temporariamente para facilitar o uso inicial 
-- (ATENÇÃO: Em produção pesada, recomenda-se ativar o RLS e configurar políticas)
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios DISABLE ROW LEVEL SECURITY;
