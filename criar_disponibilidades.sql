-- =====================================================
-- EXECUTE NO SUPABASE SQL EDITOR
-- Cria a tabela de disponibilidades que estava faltando
-- =====================================================

CREATE TABLE IF NOT EXISTS public.disponibilidades (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    dia_semana INTEGER NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fim TEXT NOT NULL,
    intervalo_minutos INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desativa RLS para evitar bloqueios de permissão
ALTER TABLE public.disponibilidades DISABLE ROW LEVEL SECURITY;
