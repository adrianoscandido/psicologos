-- Execute no SQL Editor do Supabase
-- Adiciona a tabela de horários disponíveis da psicóloga

CREATE TABLE IF NOT EXISTS public.disponibilidades (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    dia_semana INTEGER NOT NULL, -- 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
    hora_inicio TEXT NOT NULL,   -- Ex: "09:00"
    hora_fim TEXT NOT NULL,      -- Ex: "18:00"
    intervalo_minutos INTEGER DEFAULT 50,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de bloqueios (férias, datas específicas bloqueadas)
CREATE TABLE IF NOT EXISTS public.bloqueios (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    data_bloqueio DATE NOT NULL,
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar coluna de disponibilidade_id nas consultas (opcional mas útil)
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS slot_hora TEXT;

ALTER TABLE public.disponibilidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloqueios DISABLE ROW LEVEL SECURITY;

-- Inserir horários padrão (Segunda a Sexta, 9h às 18h)
INSERT INTO public.disponibilidades (dia_semana, hora_inicio, hora_fim, intervalo_minutos) VALUES
  (1, '09:00', '18:00', 50),
  (2, '09:00', '18:00', 50),
  (3, '09:00', '18:00', 50),
  (4, '09:00', '18:00', 50),
  (5, '09:00', '18:00', 50)
ON CONFLICT DO NOTHING;
