import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Eye, Send, FileText, CheckCircle, Clock, X, Copy, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const TIPOS_PACIENTE = [
  { value: 'crianca',     label: 'Criança',      emoji: '👦' },
  { value: 'adolescente', label: 'Adolescente',  emoji: '🧑' },
  { value: 'adulto',      label: 'Adulto',       emoji: '🧑‍💼' },
  { value: 'casal',       label: 'Casal',        emoji: '👫' },
];

const statusConfig = {
  pendente:  { label: 'Pendente',   bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  rascunho:  { label: 'Rascunho',   bg: '#f0f9ff', color: '#0284c7', dot: '#38bdf8' },
  concluida: { label: 'Concluída',  bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
};

/* ─── Campo de Resposta (modo doutora) ─── */
const CampoRespostaDoutora = ({ pergunta, resposta, onChange }) => {
  const { tipo_resposta, opcoes } = pergunta;
  const val  = resposta?.resposta  || '';
  const desc = resposta?.descricao || '';

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.9rem', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.88rem',
    outline: 'none', color: '#0f172a', background: 'white'
  };

  if (tipo_resposta === 'texto_livre') return (
    <textarea value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)} rows={2}
      placeholder="Resposta..." style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
  );

  if (tipo_resposta === 'numero') return (
    <input type="number" value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)}
      placeholder="0" style={{ ...inputStyle, maxWidth: 120 }}
      onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
  );

  if (tipo_resposta === 'data') return (
    <input type="date" value={val} onChange={e => onChange(pergunta.id, e.target.value, desc)}
      style={{ ...inputStyle, maxWidth: 180 }}
      onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
  );

  if (tipo_resposta === 'sim_nao' || tipo_resposta === 'sim_nao_descricao') return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['Sim', 'Não'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(pergunta.id, opt, desc)}
            style={{ padding: '0.45rem 1.2rem', borderRadius: 50, border: `2px solid ${val === opt ? (opt==='Sim'?'#7c3aed':'#ef4444') : '#e2e8f0'}`,
              background: val === opt ? (opt==='Sim'?'#f5f3ff':'#fef2f2') : 'white',
              color: val === opt ? (opt==='Sim'?'#7c3aed':'#dc2626') : '#94a3b8',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>{opt}</button>
        ))}
      </div>
      {tipo_resposta === 'sim_nao_descricao' && val && (
        <textarea value={desc} onChange={e => onChange(pergunta.id, val, e.target.value)} rows={2}
          placeholder="Descreva..." style={{ ...inputStyle, marginTop: '0.5rem', resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
      )}
    </div>
  );

  if (tipo_resposta === 'multipla_escolha') return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(opcoes || []).map(opt => {
        const sels = val ? val.split('|') : [];
        const ativo = sels.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => {
            const novo = ativo ? sels.filter(s => s!==opt) : [...sels, opt];
            onChange(pergunta.id, novo.join('|'), desc);
          }}
            style={{ padding: '0.4rem 0.9rem', borderRadius: 50, border: `2px solid ${ativo?'#7c3aed':'#e2e8f0'}`,
              background: ativo?'#f5f3ff':'white', color: ativo?'#7c3aed':'#64748b',
              fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}>{opt}</button>
        );
      })}
    </div>
  );

  return null;
};

/* ─── Tela de Entrevista (doutora preenche) ─── */
const TelaEntrevista = ({ anamnese, paciente, onVoltar }) => {
  const [categorias, setCategorias] = useState([]);
  const [perguntas, setPerguntas]   = useState([]);
  const [respostas, setRespostas]   = useState({});
  const [abertas, setAbertas]       = useState({});
  const [salvando, setSalvando]     = useState(false);
  const [msg, setMsg]               = useState('');
  const printRef = useRef();

  useEffect(() => { carregar(); }, [anamnese.id]);

  const carregar = async () => {
    const { data: cats } = await supabase.from('anamnese_categorias').select('*').contains('tipo_paciente', [anamnese.tipo_paciente]).eq('ativo', true).order('ordem');
    const { data: pergs } = await supabase.from('anamnese_perguntas').select('*').eq('visivel_doutora', true).eq('ativo', true).order('ordem');
    const { data: resps } = await supabase.from('anamnese_respostas').select('*').eq('anamnese_id', anamnese.id);
    const map = {};
    (resps || []).forEach(r => { map[r.pergunta_id] = r; });
    setCategorias(cats || []);
    setPerguntas(pergs || []);
    setRespostas(map);
    const ab = {};
    (cats || []).forEach((c, i) => { ab[c.id] = i === 0; });
    setAbertas(ab);
  };

  const onChange = async (perguntaId, resposta, descricao) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: { ...prev[perguntaId], resposta, descricao } }));
    await supabase.from('anamnese_respostas').upsert({
      anamnese_id: anamnese.id, pergunta_id: perguntaId,
      resposta, descricao, respondido_por: 'doutora',
    }, { onConflict: 'anamnese_id,pergunta_id' });
  };

  const salvarRascunho = async () => {
    setSalvando(true);
    await supabase.from('anamneses').update({ status: 'rascunho', updated_at: new Date().toISOString() }).eq('id', anamnese.id);
    setMsg('✓ Rascunho salvo!'); setTimeout(() => setMsg(''), 3000); setSalvando(false);
  };

  const concluir = async () => {
    setSalvando(true);
    await supabase.from('anamneses').update({ status: 'concluida', updated_at: new Date().toISOString() }).eq('id', anamnese.id);
    setMsg('✓ Anamnese concluída!'); setTimeout(() => { setMsg(''); onVoltar(); }, 2000); setSalvando(false);
  };

  const handlePrint = useReactToPrint({ content: () => printRef.current, documentTitle: `Anamnese - ${paciente?.nome}` });

  const respRespondidas = Object.values(respostas).filter(r => r.resposta).length;
  const totalPergs = perguntas.length;

  return (
    <div>
      {/* Header */}
      <div className="dash-header-flex" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onVoltar} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}>
            ← Voltar
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#0f172a' }}>Entrevista — {paciente?.nome}</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{respRespondidas} / {totalPergs} perguntas respondidas</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {msg && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>{msg}</span>}
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>
            <FileText size={16} /> Exportar PDF
          </button>
          <button onClick={salvarRascunho} disabled={salvando} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>
            <Save size={16} /> Rascunho
          </button>
          <button onClick={concluir} disabled={salvando} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> Concluir
          </button>
        </div>
      </div>

      {/* Progresso */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: 4, width: `${totalPergs ? Math.round(respRespondidas/totalPergs*100) : 0}%`, transition: 'width 0.4s' }} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed', whiteSpace: 'nowrap' }}>
          {totalPergs ? Math.round(respRespondidas/totalPergs*100) : 0}%
        </span>
      </div>

      {/* Conteúdo para impressão */}
      <div ref={printRef}>
        {/* Cabeçalho do PDF */}
        <div className="print-header" style={{ display: 'none', marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', margin: 0 }}>Dra. Ana Paula Candido — CRP 06/157985</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Ficha de Anamnese — {paciente?.nome} — {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Categorias colapsáveis */}
        {categorias.map(cat => {
          const pergscat = perguntas.filter(p => p.categoria_id === cat.id);
          if (!pergscat.length) return null;
          const aberta = abertas[cat.id];
          const respondidas = pergscat.filter(p => respostas[p.id]?.resposta).length;

          return (
            <div key={cat.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Cabeçalho da categoria */}
              <button onClick={() => setAbertas(prev => ({ ...prev, [cat.id]: !aberta }))} type="button"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{cat.nome}</div>
                  <span style={{ background: respondidas === pergscat.length ? '#f0fdf4' : '#f1f5f9', color: respondidas === pergscat.length ? '#16a34a' : '#64748b', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
                    {respondidas}/{pergscat.length}
                  </span>
                </div>
                {aberta ? <ChevronUp size={18} style={{ color: '#94a3b8' }} /> : <ChevronDown size={18} style={{ color: '#94a3b8' }} />}
              </button>

              {/* Perguntas */}
              {aberta && (
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {pergscat.map((p, i) => (
                    <div key={p.id}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
                        <span style={{ background: '#f5f3ff', color: '#7c3aed', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                            {p.texto}
                            {p.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                            {!p.visivel_paciente && <span style={{ marginLeft: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>🔒 Somente doutora</span>}
                            {respostas[p.id]?.respondido_por === 'paciente' && <span style={{ marginLeft: '0.5rem', background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>👤 Paciente</span>}
                          </div>
                          <CampoRespostaDoutora pergunta={p} resposta={respostas[p.id]} onChange={onChange} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          .print-header { display: block !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

/* ─── MODAL Nova Anamnese ─── */
const ModalNovaAnamnese = ({ pacientes, onClose, onCriada }) => {
  const [form, setForm] = useState({ paciente_id: '', tipo_paciente: 'crianca', modo: 'entrevista', horas_validade: 48 });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const criar = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expira = new Date(Date.now() + form.horas_validade * 3600000).toISOString();
      const { data, error } = await supabase.from('anamneses').insert([{
        paciente_id:    form.paciente_id,
        tipo_paciente:  form.tipo_paciente,
        modo:           form.modo,
        token_acesso:   token,
        token_expira_em: expira,
        status:         'pendente',
      }]).select().single();
      if (error) throw error;
      onCriada(data);
    } catch (err) { setErro(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>Nova Anamnese</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.15rem' }}>Configure e inicie a coleta de dados</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} style={{ color: '#64748b' }} />
          </button>
        </div>

        <form onSubmit={criar} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {erro && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem' }}>{erro}</div>}

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Paciente *</label>
            <select required value={form.paciente_id} onChange={e => setForm({...form, paciente_id: e.target.value})}
              style={{ width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none' }}>
              <option value="">Selecione o paciente...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.75rem' }}>Tipo de Paciente *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {TIPOS_PACIENTE.map(t => (
                <button key={t.value} type="button" onClick={() => setForm({...form, tipo_paciente: t.value})}
                  style={{ padding: '0.65rem', borderRadius: 10, border: `2px solid ${form.tipo_paciente===t.value?'#3a7bd5':'#e2e8f0'}`, background: form.tipo_paciente===t.value?'#eff6ff':'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: form.tipo_paciente===t.value?'#3a7bd5':'#374151' }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.75rem' }}>Modo de Preenchimento *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { v: 'entrevista', icon: '🩺', t: 'Entrevista (Doutora preenche)', d: 'Você preenche durante ou após a consulta' },
                { v: 'auto_preenchimento', icon: '👤', t: 'Enviar para Paciente', d: 'Gera um link para o paciente responder' },
              ].map(m => (
                <button key={m.v} type="button" onClick={() => setForm({...form, modo: m.v})}
                  style={{ padding: '1rem', borderRadius: 10, border: `2px solid ${form.modo===m.v?'#3a7bd5':'#e2e8f0'}`, background: form.modo===m.v?'#eff6ff':'white', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: form.modo===m.v?'#3a7bd5':'#0f172a' }}>{m.icon} {m.t}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>{m.d}</div>
                </button>
              ))}
            </div>
          </div>

          {form.modo === 'auto_preenchimento' && (
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Validade do Link</label>
              <select value={form.horas_validade} onChange={e => setForm({...form, horas_validade: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none' }}>
                <option value={24}>24 horas</option>
                <option value={48}>48 horas</option>
                <option value={72}>72 horas</option>
                <option value={168}>1 semana</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#64748b' }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? 'Criando...' : form.modo === 'entrevista' ? '🩺 Iniciar Entrevista' : '👤 Gerar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── PÁGINA PRINCIPAL ─── */
const Anamneses = () => {
  const [anamneses, setAnamneses]   = useState([]);
  const [pacientes, setPacientes]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(null);
  const [anamneseSel, setAnamneseSel] = useState(null); // drill-down entrevista
  const [busca, setBusca]           = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setLoading(true);
    const [{ data: ans }, { data: pacs }] = await Promise.all([
      supabase.from('anamneses').select('*, pacientes(nome)').order('created_at', { ascending: false }),
      supabase.from('pacientes').select('id, nome').order('nome'),
    ]);
    setAnamneses(ans || []);
    setPacientes(pacs || []);
    setLoading(false);
  };

  const onCriada = (anamnese) => {
    setModal(false);
    if (anamnese.modo === 'entrevista') {
      setAnamneseSel(anamnese);
    } else {
      setLinkCopiado(anamnese);
    }
    carregar();
  };

  const copiarLink = (token) => {
    const url = `${window.location.origin}/anamnese/${token}`;
    navigator.clipboard.writeText(url);
  };

  const filtradas = anamneses.filter(a =>
    a.pacientes?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // Drill-down para entrevista
  if (anamneseSel) {
    const pac = pacientes.find(p => p.id === anamneseSel.paciente_id);
    return <TelaEntrevista anamnese={anamneseSel} paciente={pac || anamneseSel.pacientes} onVoltar={() => { setAnamneseSel(null); carregar(); }} />;
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {modal && <ModalNovaAnamnese pacientes={pacientes} onClose={() => setModal(false)} onCriada={onCriada} />}

      {/* Modal link gerado */}
      {linkCopiado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, padding: '2.5rem', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Send size={28} style={{ color: '#16a34a' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Link Gerado!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Copie e envie para o paciente via WhatsApp</p>
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem', wordBreak: 'break-all', fontSize: '0.85rem', color: '#475569', textAlign: 'left' }}>
              {`${window.location.origin}/anamnese/${linkCopiado.token_acesso}`}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setLinkCopiado(null)} style={{ flex: 1, padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)', color: '#64748b' }}>Fechar</button>
              <button onClick={() => { copiarLink(linkCopiado.token_acesso); }} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Copy size={16} /> Copiar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dash-header-flex" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.25rem' }}>Anamneses</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Gerencie as fichas de anamnese dos pacientes</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Nova Anamnese
        </button>
      </div>

      {/* Cards resumo */}
      <div className="dash-grid-3" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total de Anamneses', value: anamneses.length, color: 'linear-gradient(135deg,#3a7bd5,#2563c7)' },
          { label: 'Concluídas', value: anamneses.filter(a => a.status === 'concluida').length, color: 'linear-gradient(135deg,#059669,#047857)' },
          { label: 'Pendentes', value: anamneses.filter(a => a.status === 'pendente').length, color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={22} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="table-container">
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por paciente..."
              style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.35rem', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '0.88rem', fontFamily: 'var(--font-sans)', outline: 'none', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor='#3a7bd5'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{filtradas.length} anamnese(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <FileText size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#64748b', fontWeight: 500 }}>Nenhuma anamnese encontrada</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Paciente', 'Tipo', 'Modo', 'Status', 'Criado em', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((a, i) => {
                const s = statusConfig[a.status] || statusConfig.pendente;
                const tp = TIPOS_PACIENTE.find(t => t.value === a.tipo_paciente);
                return (
                  <tr key={a.id} style={{ borderBottom: i < filtradas.length-1 ? '1px solid #f8fafc' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{a.pacientes?.nome}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600 }}>{tp?.emoji} {tp?.label}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                      {a.modo === 'entrevista' ? '🩺 Entrevista' : '👤 Paciente'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                        ● {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                      {new Date(a.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setAnamneseSel(a)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor='#7c3aed'} onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}>
                          <Eye size={14} /> {a.status === 'concluida' ? 'Ver' : 'Abrir'}
                        </button>
                        {a.modo === 'auto_preenchimento' && a.token_acesso && a.status !== 'concluida' && (
                          <button onClick={() => copiarLink(a.token_acesso)}
                            style={{ padding: '0.4rem 0.8rem', borderRadius: 8, border: '1.5px solid #bae6fd', background: '#f0f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#0284c7' }}>
                            <Copy size={14} /> Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Anamneses;
