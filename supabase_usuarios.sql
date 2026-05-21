-- =====================================================
-- EXECUTE NO SQL EDITOR DO SUPABASE
-- Criação dos usuários e tabela de perfis do sistema
-- =====================================================

-- 1. Tabela de perfis do sistema (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios_sistema (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    auth_user_id UUID UNIQUE, -- referência ao auth.users
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    papel TEXT NOT NULL DEFAULT 'psicologa', -- 'admin' ou 'psicologa'
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.usuarios_sistema DISABLE ROW LEVEL SECURITY;

-- 2. Inserir perfis iniciais (após criar os usuários no Auth)
INSERT INTO public.usuarios_sistema (nome, email, papel, ativo) VALUES
  ('Adriano Severo', 'adrianoscandido93@gmail.com', 'admin', true),
  ('Dra. Ana Paula Candido', 'Psicoanapaulacandido@hotmail.com', 'psicologa', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- ATENÇÃO: Para criar os usuários com senha no Auth,
-- acesse: Supabase Dashboard > Authentication > Users
-- Clique em "Add User" e crie:
--   1. Email: adrianoscandido93@gmail.com  | Senha: 123
--   2. Email: Psicoanapaulacandido@hotmail.com | Senha: 123
-- =====================================================
