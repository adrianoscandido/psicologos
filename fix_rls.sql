-- =====================================================
-- EXECUTE ESSE SCRIPT NO SUPABASE SQL EDITOR
-- Corrige o erro: "row-level security policy"
-- =====================================================

-- Desabilitar RLS nas tabelas principais
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios DISABLE ROW LEVEL SECURITY;

-- Garantir que as tabelas existam com RLS desabilitado
ALTER TABLE IF EXISTS public.disponibilidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bloqueios DISABLE ROW LEVEL SECURITY;

-- Caso a opção acima não funcione, criar políticas permissivas
-- (execute apenas se o DISABLE acima não resolver)
DO $$
BEGIN
  -- Pacientes: permite tudo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pacientes' AND policyname = 'allow_all') THEN
    CREATE POLICY allow_all ON public.pacientes FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Consultas: permite tudo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consultas' AND policyname = 'allow_all') THEN
    CREATE POLICY allow_all ON public.consultas FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Prontuários: permite tudo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prontuarios' AND policyname = 'allow_all') THEN
    CREATE POLICY allow_all ON public.prontuarios FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
