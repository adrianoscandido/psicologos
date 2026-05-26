import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

/* ─── Componente de resposta dinâmica ─── */
const CampoResposta = ({ pergunta, resposta, onChange }) => {
  const { tipo_resposta, opcoes } = pergunta;
  const val = resposta?.resposta || '';
  const desc = resposta?.descricao || '';

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0',
    borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
    outline: 'none', color: '#0f172a', background: 'white', transition: 'border-color 0.2s'
  };

  if (tipo_resposta === 'texto_livre') return (
    <textarea value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)} rows={3}
      placeholder="Sua resposta..." style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = '#3a7bd5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
  );

  if (tipo_resposta === 'numero') return (
    <input type="number" value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)}
      placeholder="0" style={{ ...inputStyle, maxWidth: 160 }}
      onFocus={e => e.target.style.borderColor = '#3a7bd5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
  );

  if (tipo_resposta === 'data') return (
    <input type="date" value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)}
      style={{ ...inputStyle, maxWidth: 200 }}
      onFocus={e => e.target.style.borderColor = '#3a7bd5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
  );

  if (tipo_resposta === 'sim_nao' || tipo_resposta === 'sim_nao_descricao') return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {['Sim', 'Não'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(pergunta.id, opt, desc)}
            style={{
              padding: '0.6rem 1.75rem', borderRadius: 50, border: `2px solid ${val === opt ? (opt === 'Sim' ? '#3a7bd5' : '#ef4444') : '#e2e8f0'}`,
              background: val === opt ? (opt === 'Sim' ? '#eff6ff' : '#fef2f2') : 'white',
              color: val === opt ? (opt === 'Sim' ? '#2563eb' : '#dc2626') : '#64748b',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s'
            }}>{opt}</button>
        ))}
      </div>
      {tipo_resposta === 'sim_nao_descricao' && val && (
        <textarea value={desc} onChange={e => onChange(pergunta.id, val, e.target.value)} rows={2}
          placeholder="Descreva..." style={{ ...inputStyle, marginTop: '0.75rem', resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#3a7bd5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      )}
    </div>
  );

  if (tipo_resposta === 'multipla_escolha') return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
      {(opcoes || []).map(opt => {
        const selecionadas = val ? val.split('|') : [];
        const ativo = selecionadas.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => {
            const novo = ativo ? selecionadas.filter(s => s !== opt) : [...selecionadas, opt];
            onChange(pergunta.id, novo.join('|'), desc);
          }}
            style={{
              padding: '0.55rem 1.1rem', borderRadius: 50, border: `2px solid ${ativo ? '#3a7bd5' : '#e2e8f0'}`,
              background: ativo ? '#eff6ff' : 'white', color: ativo ? '#2563eb' : '#64748b',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s'
            }}>{opt}</button>
        );
      })}
    </div>
  );

  return null;
};

/* ─── PÁGINA PÚBLICA ─── */
const AnamnesePublica = () => {
  const { token } = useParams();
  const [anamnese, setAnamnese]       = useState(null);
  const [categorias, setCategorias]   = useState([]);
  const [perguntas, setPerguntas]     = useState([]);
  const [respostas, setRespostas]     = useState({});
  const [catAtual, setCatAtual]       = useState(0);
  const [status, setStatus]           = useState('carregando'); // carregando|ativo|concluido|invalido
  const [salvando, setSalvando]       = useState(false);

  useEffect(() => { init(); }, [token]);

  const init = async () => {
    // Busca anamnese pelo token
    const { data: an, error } = await supabase
      .from('anamneses')
      .select('*, pacientes(nome)')
      .eq('token_acesso', token)
      .single();

    if (error || !an) return setStatus('invalido');
    if (an.status === 'concluida') return setStatus('concluido');
    if (new Date(an.token_expira_em) < new Date()) return setStatus('invalido');

    setAnamnese(an);

    // Busca categorias e perguntas visíveis para paciente
    const { data: cats } = await supabase
      .from('anamnese_categorias')
      .select('*')
      .contains('tipo_paciente', [an.tipo_paciente])
      .eq('ativo', true)
      .order('ordem');

    const { data: pergs } = await supabase
      .from('anamnese_perguntas')
      .select('*')
      .eq('visivel_paciente', true)
      .eq('ativo', true)
      .order('ordem');

    // Busca respostas já preenchidas
    const { data: resps } = await supabase
      .from('anamnese_respostas')
      .select('*')
      .eq('anamnese_id', an.id);

    const respMap = {};
    (resps || []).forEach(r => { respMap[r.pergunta_id] = r; });

    setCategorias(cats || []);
    setPerguntas(pergs || []);
    setRespostas(respMap);
    setStatus('ativo');
  };

  const onChange = async (perguntaId, resposta, descricao) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], resposta, descricao } }));

    // Salva automaticamente no Supabase
    await supabase.from('anamnese_respostas').upsert({
      anamnese_id: anamnese.id,
      pergunta_id: perguntaId,
      resposta,
      descricao,
      respondido_por: 'paciente',
    }, { onConflict: 'anamnese_id,pergunta_id' });

    // Marca como rascunho
    if (anamnese.status === 'pendente') {
      await supabase.from('anamneses').update({ status: 'rascunho' }).eq('id', anamnese.id);
      setAnamnese(prev => ({ ...prev, status: 'rascunho' }));
    }
  };

  const concluir = async () => {
    setSalvando(true);
    await supabase.from('anamneses').update({ status: 'concluida' }).eq('id', anamnese.id);
    setStatus('concluido');
    setSalvando(false);
  };

  const catsFiltradas = categorias.filter(c =>
    perguntas.some(p => p.categoria_id === c.id)
  );
  const perguntasDaCat = catsFiltradas[catAtual]
    ? perguntas.filter(p => p.categoria_id === catsFiltradas[catAtual].id)
    : [];
  const totalCats   = catsFiltradas.length;
  const progresso   = totalCats > 0 ? Math.round(((catAtual) / totalCats) * 100) : 0;

  /* ─── Telas de estado ─── */
  if (status === 'carregando') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#3a7bd5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Carregando formulário...
      </div>
    </div>
  );

  if (status === 'invalido') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '3rem', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <AlertCircle size={56} style={{ color: '#ef4444', margin: '0 auto 1.5rem', display: 'block' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.75rem' }}>Link Inválido ou Expirado</h2>
        <p style={{ color: '#64748b', lineHeight: 1.7 }}>Este link não existe ou o prazo de preenchimento expirou. Por favor, entre em contato com a Dra. Ana Paula para receber um novo link.</p>
      </div>
    </div>
  );

  if (status === 'concluido') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2d5a8e 100%)', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}>
          <CheckCircle size={40} style={{ color: 'white' }} />
        </div>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ψ</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0f172a', fontSize: '1.8rem', marginBottom: '1rem' }}>Obrigado!</h2>
        <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '1.05rem' }}>
          Suas respostas foram salvas com sucesso. A <strong>Dra. Ana Paula</strong> já pode visualizá-las no sistema. Até breve!
        </p>
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
          <p style={{ color: '#15803d', fontSize: '0.88rem', fontWeight: 600 }}>CRP 06/157985 • Psicologia Clínica</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header fixo */}
      <header style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '1.25rem 2rem', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#c5a97a' }}>Ψ</span>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Dra. Ana Paula Candido</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>Ficha de Anamnese</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {catAtual + 1} / {totalCats}
          </div>
        </div>
        {/* Barra de progresso */}
        <div style={{ maxWidth: 760, margin: '0.75rem auto 0', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#c5a97a', borderRadius: 4, width: `${progresso}%`, transition: 'width 0.4s ease' }} />
        </div>
      </header>

      {/* Conteúdo */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {catsFiltradas[catAtual] && (
          <div>
            {/* Cabeçalho da categoria */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(58,123,213,0.1)', border: '1px solid rgba(58,123,213,0.2)', color: '#3a7bd5', padding: '0.35rem 1rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                Seção {catAtual + 1} de {totalCats}
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.5rem' }}>{catsFiltradas[catAtual].nome}</h2>
              {catsFiltradas[catAtual].descricao && (
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{catsFiltradas[catAtual].descricao}</p>
              )}
            </div>

            {/* Perguntas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {perguntasDaCat.map((p, i) => (
                <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {i + 1}. {p.texto}
                    {p.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                  </label>
                  <CampoResposta pergunta={p} resposta={respostas[p.id]} onChange={onChange} />
                </div>
              ))}
            </div>

            {/* Navegação */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'space-between' }}>
              {catAtual > 0 ? (
                <button onClick={() => setCatAtual(catAtual - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', border: '2px solid #e2e8f0', borderRadius: 12, background: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b', fontFamily: 'var(--font-sans)' }}>
                  <ChevronLeft size={18} /> Anterior
                </button>
              ) : <div />}

              {catAtual < totalCats - 1 ? (
                <button onClick={() => setCatAtual(catAtual + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3a7bd5, #2563c7)', color: 'white', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: '0 4px 16px rgba(58,123,213,0.35)' }}>
                  Próxima Seção <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={concluir} disabled={salvando}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: '0 4px 16px rgba(5,150,105,0.35)' }}>
                  <CheckCircle size={18} /> {salvando ? 'Enviando...' : 'Concluir Anamnese'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AnamnesePublica;
