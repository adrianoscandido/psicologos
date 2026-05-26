-- ================================================================
-- MÓDULO DE ANAMNESE — EXECUTE NO SUPABASE SQL EDITOR
-- ================================================================

-- 1. CATEGORIAS DE PERGUNTAS
CREATE TABLE IF NOT EXISTS anamnese_categorias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text NOT NULL,
  descricao       text,
  ordem           int  NOT NULL DEFAULT 0,
  tipo_paciente   text[] NOT NULL DEFAULT '{}'::text[], -- ['crianca','adolescente','adulto','casal']
  ativo           boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- 2. PERGUNTAS (vinculadas a uma categoria)
CREATE TABLE IF NOT EXISTS anamnese_perguntas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id      uuid NOT NULL REFERENCES anamnese_categorias(id) ON DELETE CASCADE,
  texto             text NOT NULL,
  tipo_resposta     text NOT NULL DEFAULT 'texto_livre',
  -- tipos: texto_livre | sim_nao | sim_nao_descricao | multipla_escolha | numero | data
  opcoes            jsonb,          -- para multipla_escolha: ["Normal","Cesárea"]
  obrigatoria       boolean NOT NULL DEFAULT false,
  visivel_paciente  boolean NOT NULL DEFAULT true,   -- paciente vê/responde
  visivel_doutora   boolean NOT NULL DEFAULT true,   -- doutora vê na entrevista
  ordem             int     NOT NULL DEFAULT 0,
  ativo             boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- 3. ANAMNESES (registro de aplicação para um paciente)
CREATE TABLE IF NOT EXISTS anamneses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo_paciente   text NOT NULL,   -- crianca | adolescente | adulto | casal
  modo            text NOT NULL DEFAULT 'entrevista', -- entrevista | auto_preenchimento
  token_acesso    text UNIQUE,     -- token único para acesso público do paciente
  token_expira_em timestamptz,     -- validade do link
  status          text NOT NULL DEFAULT 'pendente', -- pendente | rascunho | concluida
  observacoes     text,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 4. RESPOSTAS
CREATE TABLE IF NOT EXISTS anamnese_respostas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anamnese_id   uuid NOT NULL REFERENCES anamneses(id) ON DELETE CASCADE,
  pergunta_id   uuid NOT NULL REFERENCES anamnese_perguntas(id) ON DELETE CASCADE,
  resposta      text,             -- resposta principal (sim/não/texto/valor)
  descricao     text,             -- campo extra "Descreva / Qual?"
  respondido_por text DEFAULT 'doutora', -- doutora | paciente
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(anamnese_id, pergunta_id)
);

-- ================================================================
-- RLS POLICIES
-- ================================================================

ALTER TABLE anamnese_categorias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese_perguntas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnese_respostas   ENABLE ROW LEVEL SECURITY;

-- Categorias e perguntas: usuários autenticados leem e escrevem
CREATE POLICY "Autenticados leem categorias"  ON anamnese_categorias  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados gerenciam categorias" ON anamnese_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Autenticados leem perguntas"   ON anamnese_perguntas   FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados gerenciam perguntas"  ON anamnese_perguntas  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anamneses: autenticados gerenciam
CREATE POLICY "Autenticados gerenciam anamneses" ON anamneses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Respostas: autenticados gerenciam + paciente acessa via token (anon)
CREATE POLICY "Autenticados gerenciam respostas" ON anamnese_respostas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Acesso público (anon) para o paciente responder via token
CREATE POLICY "Anon lê anamnese via token"  ON anamneses           FOR SELECT TO anon USING (token_acesso IS NOT NULL AND token_expira_em > now());
CREATE POLICY "Anon lê perguntas"           ON anamnese_perguntas  FOR SELECT TO anon USING (ativo = true AND visivel_paciente = true);
CREATE POLICY "Anon lê categorias"          ON anamnese_categorias FOR SELECT TO anon USING (ativo = true);
CREATE POLICY "Anon insere respostas"       ON anamnese_respostas  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon atualiza respostas"     ON anamnese_respostas  FOR UPDATE TO anon USING (true);

-- ================================================================
-- DADOS INICIAIS — CATEGORIAS E PERGUNTAS (Criança / Adolescente)
-- ================================================================

DO $$
DECLARE
  cat_queixa      uuid;
  cat_gestacao    uuid;
  cat_nascimento  uuid;
  cat_saude       uuid;
  cat_alimentacao uuid;
  cat_sono        uuid;
  cat_psicomotor  uuid;
  cat_escolaridade uuid;
  cat_linguagem   uuid;
  cat_sexualidade uuid;
  cat_ambiental   uuid;
BEGIN

-- Categoria 1: Queixa Principal
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Queixa Principal', 'Motivo da consulta e histórico inicial', 1, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_queixa;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_queixa, 'Queixa ou motivo do interesse pela consulta', 'texto_livre', true, true, 1),
(cat_queixa, 'Desde quando há o problema?', 'texto_livre', true, true, 2),
(cat_queixa, 'Já procurou outros especialistas?', 'sim_nao_descricao', true, true, 3),
(cat_queixa, 'Está fazendo algum tipo de tratamento médico, psicológico, psiquiátrico ou neurológico?', 'sim_nao_descricao', true, true, 4),
(cat_queixa, 'Quem indicou a clínica?', 'texto_livre', true, true, 5);

-- Categoria 2: Gestação
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Antecedentes — Gestação', 'Histórico da gestação', 2, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_gestacao;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, opcoes, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_gestacao, 'A gravidez foi planejada?', 'sim_nao', NULL, true, true, 1),
(cat_gestacao, 'Apresentou algum aborto anterior? Como lidou com a situação?', 'sim_nao_descricao', NULL, true, true, 2),
(cat_gestacao, 'Qual o estado civil dos pais no momento da concepção?', 'multipla_escolha', '["Casados","Solteiros","Divorciados","União estável"]', true, true, 3),
(cat_gestacao, 'Qual a reação dos pais e familiares sobre a gravidez?', 'texto_livre', NULL, true, true, 4),
(cat_gestacao, 'Fez alguma transfusão durante a gravidez?', 'sim_nao', NULL, true, true, 5),
(cat_gestacao, 'Fez uso de álcool durante a gestação?', 'sim_nao_descricao', NULL, true, true, 6),
(cat_gestacao, 'Fez uso de drogas / tabaco durante a gestação?', 'sim_nao', NULL, true, true, 7),
(cat_gestacao, 'Doenças durante a gestação?', 'sim_nao_descricao', NULL, true, true, 8),
(cat_gestacao, 'Condições emocionais durante a gravidez', 'texto_livre', NULL, true, true, 9),
(cat_gestacao, 'Como estava a relação do casal durante a gravidez?', 'texto_livre', NULL, true, true, 10),
(cat_gestacao, 'Houve algum episódio marcante durante a gravidez?', 'sim_nao_descricao', NULL, true, true, 11);

-- Categoria 3: Condições de Nascimento
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Antecedentes — Nascimento', 'Condições do parto e pós-parto', 3, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_nascimento;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, opcoes, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_nascimento, 'Tipo de parto', 'multipla_escolha', '["Normal","Cesárea"]', true, true, 1),
(cat_nascimento, 'Houve complicações no parto?', 'sim_nao_descricao', NULL, true, true, 2),
(cat_nascimento, 'Uso de fórceps?', 'sim_nao', NULL, true, true, 3),
(cat_nascimento, 'Características do bebê após o nascimento', 'texto_livre', NULL, true, true, 4),
(cat_nascimento, 'Depois que o bebê nasceu, quanto tempo levou para trazê-lo para você?', 'texto_livre', NULL, true, true, 5),
(cat_nascimento, 'Demais informações relevantes sobre o nascimento', 'texto_livre', NULL, true, true, 6);

-- Categoria 4: Saúde Física
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Desenvolvimento — Saúde Física', 'Histórico de saúde física da criança/adolescente', 4, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_saude;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_saude, 'A criança/adolescente sofreu algum acidente ou se submeteu a alguma cirurgia?', 'sim_nao_descricao', true, true, 1),
(cat_saude, 'A criança/adolescente já teve ou tem alguma doença?', 'sim_nao_descricao', true, true, 2),
(cat_saude, 'Faz uso de alguma medicação?', 'sim_nao_descricao', true, true, 3),
(cat_saude, 'Possui reações alérgicas?', 'sim_nao_descricao', true, true, 4),
(cat_saude, 'Tem bronquite ou asma?', 'sim_nao_descricao', true, true, 5),
(cat_saude, 'Apresenta problemas de visão?', 'sim_nao_descricao', true, true, 6),
(cat_saude, 'Apresenta problemas de audição?', 'sim_nao_descricao', true, true, 7),
(cat_saude, 'Dor de cabeça com frequência?', 'sim_nao_descricao', true, true, 8),
(cat_saude, 'Já desmaiou alguma vez? Quando? Como foi?', 'sim_nao_descricao', true, true, 9),
(cat_saude, 'Teve ou tem convulsões?', 'sim_nao_descricao', true, true, 10),
(cat_saude, 'Alguém da família apresenta problemas de desmaios, convulsões, ataques?', 'sim_nao_descricao', true, true, 11),
(cat_saude, 'Observações gerais de saúde', 'texto_livre', true, true, 12);

-- Categoria 5: Sono
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Desenvolvimento — Sono', 'Padrões e qualidade do sono', 5, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_sono;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, opcoes, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_sono, 'A criança/adolescente dorme bem?', 'sim_nao_descricao', NULL, true, true, 1),
(cat_sono, 'Como é o sono?', 'multipla_escolha', '["Agitado","Tranquilo"]', true, true, 2),
(cat_sono, 'Fala dormindo?', 'sim_nao_descricao', NULL, true, true, 3),
(cat_sono, 'É sonâmbulo?', 'sim_nao_descricao', NULL, true, true, 4),
(cat_sono, 'Tem pesadelos com frequência?', 'sim_nao_descricao', NULL, true, true, 5),
(cat_sono, 'Range os dentes?', 'sim_nao_descricao', NULL, true, true, 6),
(cat_sono, 'Dorme em quarto separado dos pais?', 'sim_nao', NULL, true, true, 7),
(cat_sono, 'Com quem dorme?', 'texto_livre', NULL, true, true, 8),
(cat_sono, 'A criança/adolescente acorda e vai para a cama dos pais?', 'sim_nao_descricao', NULL, true, true, 9);

-- Categoria 6: Desenvolvimento Psicomotor
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Desenvolvimento — Psicomotor', 'Marco do desenvolvimento motor', 6, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_psicomotor;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_psicomotor, 'Com qual idade começou a andar?', 'numero', true, true, 1),
(cat_psicomotor, 'Engatinhou?', 'sim_nao_descricao', true, true, 2),
(cat_psicomotor, 'Alguma dificuldade no desenvolvimento motor?', 'sim_nao_descricao', true, true, 3),
(cat_psicomotor, 'É lento para realizar alguma tarefa?', 'sim_nao_descricao', true, true, 4),
(cat_psicomotor, 'Veste-se sozinho?', 'sim_nao', true, true, 5),
(cat_psicomotor, 'Toma banho sozinho?', 'sim_nao', true, true, 6),
(cat_psicomotor, 'Calça-se sozinho?', 'sim_nao', true, true, 7),
(cat_psicomotor, 'Sabe dar nó nos calçados?', 'sim_nao', true, true, 8),
(cat_psicomotor, 'É desastrado?', 'sim_nao_descricao', true, true, 9),
(cat_psicomotor, 'Pratica esportes?', 'sim_nao_descricao', true, true, 10);

-- Categoria 7: Escolaridade
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Escolaridade', 'Histórico e desempenho escolar', 7, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_escolaridade;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, opcoes, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_escolaridade, 'A criança/adolescente gosta de ir à escola?', 'sim_nao_descricao', NULL, true, true, 1),
(cat_escolaridade, 'É bem aceita pelos amigos ou é isolada?', 'texto_livre', NULL, true, true, 2),
(cat_escolaridade, 'Já repetiu alguma série?', 'sim_nao_descricao', NULL, true, true, 3),
(cat_escolaridade, 'Gosta de estudar?', 'sim_nao', NULL, true, true, 4),
(cat_escolaridade, 'Tem o hábito de leitura?', 'sim_nao', NULL, true, true, 5),
(cat_escolaridade, 'Faz as lições que os professores passam?', 'multipla_escolha', '["Sim","Não","Às vezes"]', true, true, 6),
(cat_escolaridade, 'Os pais estudam com a criança?', 'sim_nao_descricao', NULL, true, true, 7),
(cat_escolaridade, 'Mudou muitas vezes de escola?', 'sim_nao_descricao', NULL, true, true, 8),
(cat_escolaridade, 'Vai bem em matemática?', 'sim_nao', NULL, true, true, 9),
(cat_escolaridade, 'Tem dificuldade em leitura e escrita?', 'sim_nao_descricao', NULL, true, true, 10),
(cat_escolaridade, 'É inquieta na escola? Em que circunstâncias?', 'sim_nao_descricao', NULL, true, true, 11),
(cat_escolaridade, 'Quais as principais dificuldades encontradas na escola?', 'texto_livre', NULL, true, true, 12),
(cat_escolaridade, 'O que os professores acham dela(e)?', 'texto_livre', NULL, true, true, 13);

-- Categoria 8: Linguagem
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Linguagem', 'Desenvolvimento da fala e comunicação', 8, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_linguagem;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_linguagem, 'Com qual idade começou a falar?', 'numero', true, true, 1),
(cat_linguagem, 'Alguma dificuldade no desenvolvimento da fala?', 'sim_nao_descricao', true, true, 2),
(cat_linguagem, 'Descreva a comunicação atual', 'texto_livre', true, true, 3);

-- Categoria 9: Aspectos Ambientais e Família
INSERT INTO anamnese_categorias (nome, descricao, ordem, tipo_paciente)
VALUES ('Aspectos Ambientais e Família', 'Relações sociais, família e ambiente', 9, ARRAY['crianca','adolescente'])
RETURNING id INTO cat_ambiental;

INSERT INTO anamnese_perguntas (categoria_id, texto, tipo_resposta, opcoes, visivel_paciente, visivel_doutora, ordem) VALUES
(cat_ambiental, 'Quais as brincadeiras preferidas?', 'texto_livre', NULL, true, true, 1),
(cat_ambiental, 'Prefere brincar', 'multipla_escolha', '["Sozinha","Com amigos"]', true, true, 2),
(cat_ambiental, 'Prefere brincar com crianças', 'multipla_escolha', '["Maiores que ela","Menores que ela","Da mesma idade"]', true, true, 3),
(cat_ambiental, 'Faz amigos com facilidade?', 'sim_nao_descricao', NULL, true, true, 4),
(cat_ambiental, 'Adapta-se facilmente ao meio?', 'sim_nao', NULL, true, true, 5),
(cat_ambiental, 'Como é o relacionamento da criança com os pais?', 'texto_livre', NULL, true, true, 6),
(cat_ambiental, 'Como é o relacionamento com os irmãos?', 'texto_livre', NULL, true, true, 7),
(cat_ambiental, 'Como é o relacionamento com outros adultos?', 'texto_livre', NULL, true, true, 8),
(cat_ambiental, 'Quais as medidas disciplinares normalmente usadas?', 'texto_livre', NULL, true, true, 9),
(cat_ambiental, 'Quem usa as medidas disciplinares?', 'texto_livre', NULL, true, true, 10),
(cat_ambiental, 'Quais as reações da criança/adolescente frente às medidas disciplinares?', 'texto_livre', NULL, true, true, 11);

END $$;
