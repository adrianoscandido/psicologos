import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Plus, Pencil, Trash2, Save, X, ChevronRight, ChevronLeft,
  Tag, HelpCircle, Eye, EyeOff, Lock, Star, GripVertical
} from 'lucide-react';

const TIPOS_PACIENTE = [
  { value: 'crianca',     label: 'Criança',      emoji: '👦' },
  { value: 'adolescente', label: 'Adolescente',  emoji: '🧑' },
  { value: 'adulto',      label: 'Adulto',       emoji: '🧑‍💼' },
  { value: 'casal',       label: 'Casal',        emoji: '👫' },
];

const TIPOS_RESPOSTA = [
  { value: 'texto_livre',       label: 'Texto Livre',              exemplo: 'Campo de texto aberto' },
  { value: 'sim_nao',           label: 'Sim / Não',                exemplo: 'Botões Sim e Não' },
  { value: 'sim_nao_descricao', label: 'Sim / Não + Descrição',    exemplo: 'Sim/Não com campo "Descreva"' },
  { value: 'multipla_escolha',  label: 'Múltipla Escolha',         exemplo: 'Opções configuráveis' },
  { value: 'numero',            label: 'Número',                   exemplo: 'Campo numérico' },
  { value: 'data',              label: 'Data',                     exemplo: 'Seletor de data' },
];

/* ─── Modal Categoria ─── */
const ModalCategoria = ({ cat, onClose, onSaved }) => {
  const isEdit = !!cat?.id;
  const [form, setForm] = useState({
    nome:          cat?.nome || '',
    descricao:     cat?.descricao || '',
    ordem:         cat?.ordem ?? 0,
    tipo_paciente: cat?.tipo_paciente || [],
    ativo:         cat?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const toggleTipo = (v) => setForm(f => ({
    ...f,
    tipo_paciente: f.tipo_paciente.includes(v)
      ? f.tipo_paciente.filter(t => t !== v)
      : [...f.tipo_paciente, v]
  }));

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.tipo_paciente.length) return setErro('Selecione ao menos um tipo de paciente.');
    setLoading(true); setErro('');
    try {
      if (isEdit) {
        const { error } = await supabase.from('anamnese_categorias').update({ ...form, updated_at: new Date().toISOString() }).eq('id', cat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('anamnese_categorias').insert([form]);
        if (error) throw error;
      }
      onSaved();
    } catch (err) { setErro(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:520, boxShadow:'0 32px 80px rgba(0,0,0,0.25)' }}>
        <div style={{ padding:'1.5rem 2rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700, color:'#0f172a', fontSize:'1.05rem' }}>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:'0.15rem' }}>Agrupa perguntas de anamnese por tema</p>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', width:36, height:36, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={18} style={{ color:'#64748b' }} />
          </button>
        </div>

        <form onSubmit={salvar} style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {erro && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'0.75rem 1rem', borderRadius:8, fontSize:'0.85rem' }}>{erro}</div>}

          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.5rem' }}>Nome da Categoria *</label>
            <input required value={form.nome} onChange={e => setForm({...form, nome:e.target.value})} placeholder="Ex: Gestação, Sono, Escolaridade"
              style={{ width:'100%', padding:'0.8rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontFamily:'var(--font-sans)', fontSize:'0.9rem', outline:'none' }}
              onFocus={e => e.target.style.borderColor='#3a7bd5'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.5rem' }}>Descrição (opcional)</label>
            <textarea value={form.descricao} onChange={e => setForm({...form, descricao:e.target.value})} placeholder="Breve descrição sobre o que esta categoria aborda"
              rows={2} style={{ width:'100%', padding:'0.8rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontFamily:'var(--font-sans)', fontSize:'0.9rem', outline:'none', resize:'vertical' }}
              onFocus={e => e.target.style.borderColor='#3a7bd5'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.75rem' }}>Tipo de Paciente *</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
              {TIPOS_PACIENTE.map(t => (
                <button key={t.value} type="button" onClick={() => toggleTipo(t.value)}
                  style={{ padding:'0.75rem', borderRadius:10, border:`2px solid ${form.tipo_paciente.includes(t.value) ? '#3a7bd5' : '#e2e8f0'}`,
                    background: form.tipo_paciente.includes(t.value) ? '#eff6ff' : 'white', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                  <span style={{ fontWeight:700, fontSize:'0.88rem', color: form.tipo_paciente.includes(t.value) ? '#3a7bd5' : '#374151' }}>
                    {t.emoji} {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.9rem 1rem', background:'#f8fafc', borderRadius:10, border:'1px solid #e2e8f0' }}>
            <label style={{ fontWeight:600, fontSize:'0.85rem', color:'#374151', flex:1 }}>Categoria ativa</label>
            <button type="button" onClick={() => setForm({...form, ativo:!form.ativo})}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 1rem', borderRadius:8, border:'none', cursor:'pointer',
                background: form.ativo ? '#f0fdf4' : '#fef2f2', color: form.ativo ? '#16a34a' : '#dc2626', fontWeight:700, fontSize:'0.85rem' }}>
              {form.ativo ? '✅ Ativa' : '⏸ Inativa'}
            </button>
          </div>

          <div style={{ display:'flex', gap:'1rem', paddingTop:'0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'0.85rem', border:'2px solid #e2e8f0', borderRadius:10, background:'white', cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600, color:'#64748b' }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
              <Save size={16} /> {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Modal Pergunta ─── */
const ModalPergunta = ({ pergunta, categoriaId, onClose, onSaved }) => {
  const isEdit = !!pergunta?.id;
  const [form, setForm] = useState({
    texto:            pergunta?.texto || '',
    tipo_resposta:    pergunta?.tipo_resposta || 'texto_livre',
    opcoes:           pergunta?.opcoes ? pergunta.opcoes.join('\n') : '',
    obrigatoria:      pergunta?.obrigatoria ?? false,
    visivel_paciente: pergunta?.visivel_paciente ?? true,
    visivel_doutora:  pergunta?.visivel_doutora ?? true,
    ordem:            pergunta?.ordem ?? 0,
    ativo:            pergunta?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    const payload = {
      categoria_id:     categoriaId,
      texto:            form.texto,
      tipo_resposta:    form.tipo_resposta,
      opcoes:           form.tipo_resposta === 'multipla_escolha' ? form.opcoes.split('\n').map(o => o.trim()).filter(Boolean) : null,
      obrigatoria:      form.obrigatoria,
      visivel_paciente: form.visivel_paciente,
      visivel_doutora:  form.visivel_doutora,
      ordem:            parseInt(form.ordem) || 0,
      ativo:            form.ativo,
    };
    try {
      if (isEdit) {
        const { error } = await supabase.from('anamnese_perguntas').update(payload).eq('id', pergunta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('anamnese_perguntas').insert([payload]);
        if (error) throw error;
      }
      onSaved();
    } catch (err) { setErro(err.message); }
    setLoading(false);
  };

  const BtnVis = ({ icon: Icon, label, active, color, onClick }) => (
    <button type="button" onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', borderRadius:8, border:`2px solid ${active ? color : '#e2e8f0'}`,
        background: active ? `${color}15` : 'white', cursor:'pointer', fontSize:'0.83rem', fontWeight:600, color: active ? color : '#94a3b8', transition:'all 0.15s' }}>
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:580, boxShadow:'0 32px 80px rgba(0,0,0,0.25)', margin:'auto' }}>
        <div style={{ padding:'1.5rem 2rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700, color:'#0f172a', fontSize:'1.05rem' }}>{isEdit ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
            <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:'0.15rem' }}>Configure o texto, tipo e visibilidade</p>
          </div>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', width:36, height:36, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={18} style={{ color:'#64748b' }} />
          </button>
        </div>

        <form onSubmit={salvar} style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {erro && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'0.75rem 1rem', borderRadius:8, fontSize:'0.85rem' }}>{erro}</div>}

          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.5rem' }}>Texto da Pergunta *</label>
            <textarea required value={form.texto} onChange={e => setForm({...form, texto:e.target.value})} placeholder="Ex: A gravidez foi planejada?"
              rows={2} style={{ width:'100%', padding:'0.8rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontFamily:'var(--font-sans)', fontSize:'0.9rem', outline:'none', resize:'vertical' }}
              onFocus={e => e.target.style.borderColor='#3a7bd5'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.5rem' }}>Tipo de Resposta</label>
            <select value={form.tipo_resposta} onChange={e => setForm({...form, tipo_resposta:e.target.value})}
              style={{ width:'100%', padding:'0.8rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontFamily:'var(--font-sans)', fontSize:'0.9rem', outline:'none' }}>
              {TIPOS_RESPOSTA.map(t => <option key={t.value} value={t.value}>{t.label} — {t.exemplo}</option>)}
            </select>
          </div>

          {form.tipo_resposta === 'multipla_escolha' && (
            <div>
              <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.5rem' }}>
                Opções (uma por linha)
              </label>
              <textarea value={form.opcoes} onChange={e => setForm({...form, opcoes:e.target.value})}
                placeholder={"Normal\nCesárea\nFórceps"} rows={4}
                style={{ width:'100%', padding:'0.8rem 1rem', border:'2px solid #e2e8f0', borderRadius:10, fontFamily:'var(--font-sans)', fontSize:'0.9rem', outline:'none', resize:'vertical' }}
                onFocus={e => e.target.style.borderColor='#3a7bd5'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
            </div>
          )}

          {/* Visibilidade */}
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.85rem', color:'#374151', marginBottom:'0.75rem' }}>Visibilidade</label>
            <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
              <BtnVis icon={Eye} label="Paciente vê" active={form.visivel_paciente} color="#3a7bd5" onClick={() => setForm({...form, visivel_paciente:!form.visivel_paciente})} />
              <BtnVis icon={HelpCircle} label="Doutora vê" active={form.visivel_doutora} color="#7c3aed" onClick={() => setForm({...form, visivel_doutora:!form.visivel_doutora})} />
              <BtnVis icon={Star} label="Obrigatória" active={form.obrigatoria} color="#f59e0b" onClick={() => setForm({...form, obrigatoria:!form.obrigatoria})} />
            </div>
            <p style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:'0.5rem' }}>
              💡 "Somente doutora" = marque "Doutora vê" e desmarque "Paciente vê"
            </p>
          </div>

          <div style={{ display:'flex', gap:'1rem', paddingTop:'0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'0.85rem', border:'2px solid #e2e8f0', borderRadius:10, background:'white', cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600, color:'#64748b' }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
              <Save size={16} /> {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Pergunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── TELA DE PERGUNTAS DE UMA CATEGORIA ─── */
const TelaPerguntas = ({ categoria, onVoltar }) => {
  const [perguntas, setPerguntas] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [modal, setModal]       = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => { carregar(); }, [categoria.id]);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('anamnese_perguntas').select('*').eq('categoria_id', categoria.id).order('ordem');
    setPerguntas(data || []);
    setLoading(false);
  };

  const excluir = async (id) => {
    await supabase.from('anamnese_perguntas').delete().eq('id', id);
    setConfirmDel(null); carregar();
  };

  const badgeVis = (p) => (
    <span style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
      {p.visivel_paciente && <span style={{ background:'#eff6ff', color:'#2563eb', padding:'0.2rem 0.5rem', borderRadius:50, fontSize:'0.72rem', fontWeight:700 }}>👤 Paciente</span>}
      {p.visivel_doutora  && <span style={{ background:'#f5f3ff', color:'#7c3aed', padding:'0.2rem 0.5rem', borderRadius:50, fontSize:'0.72rem', fontWeight:700 }}>🩺 Doutora</span>}
      {p.obrigatoria       && <span style={{ background:'#fffbeb', color:'#b45309', padding:'0.2rem 0.5rem', borderRadius:50, fontSize:'0.72rem', fontWeight:700 }}>⭐ Obrigatória</span>}
    </span>
  );

  const labelTipo = (v) => TIPOS_RESPOSTA.find(t => t.value === v)?.label || v;

  return (
    <div>
      {modal && <ModalPergunta pergunta={editando} categoriaId={categoria.id} onClose={() => {setModal(false);setEditando(null);}} onSaved={() => {setModal(false);setEditando(null);carregar();}} />}

      {confirmDel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:16, padding:'2rem', width:'100%', maxWidth:400, textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <Trash2 size={28} style={{ color:'#ef4444' }} />
            </div>
            <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700, marginBottom:'0.5rem' }}>Excluir Pergunta?</h3>
            <p style={{ color:'#64748b', fontSize:'0.9rem', marginBottom:'1.75rem' }}>"{confirmDel.texto}"</p>
            <div style={{ display:'flex', gap:'1rem' }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:'0.85rem', border:'2px solid #e2e8f0', borderRadius:10, background:'white', cursor:'pointer', fontWeight:600, fontFamily:'var(--font-sans)', color:'#64748b' }}>Cancelar</button>
              <button onClick={() => excluir(confirmDel.id)} style={{ flex:1, padding:'0.85rem', border:'none', borderRadius:10, background:'#ef4444', color:'white', cursor:'pointer', fontWeight:700, fontFamily:'var(--font-sans)' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dash-header-flex" style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <button onClick={onVoltar} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'#64748b', fontSize:'0.9rem', fontWeight:600, background:'#f1f5f9', border:'none', padding:'0.5rem 1rem', borderRadius:8, cursor:'pointer' }}>
            <ChevronLeft size={16} /> Categorias
          </button>
          <span style={{ color:'#cbd5e1' }}>/</span>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontFamily:'var(--font-serif)', color:'#0f172a' }}>{categoria.nome}</h1>
            <p style={{ color:'#64748b', fontSize:'0.85rem' }}>{categoria.descricao || 'Gerencie as perguntas desta categoria'}</p>
          </div>
        </div>
        <button onClick={() => { setEditando(null); setModal(true); }} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Plus size={18} /> Nova Pergunta
        </button>
      </div>

      {/* Lista de perguntas */}
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding:'4rem', textAlign:'center', color:'#94a3b8' }}>Carregando...</div>
        ) : perguntas.length === 0 ? (
          <div style={{ padding:'4rem', textAlign:'center' }}>
            <HelpCircle size={40} style={{ color:'#e2e8f0', margin:'0 auto 1rem', display:'block' }} />
            <p style={{ color:'#64748b', fontWeight:500 }}>Nenhuma pergunta cadastrada</p>
            <p style={{ color:'#94a3b8', fontSize:'0.85rem', marginTop:'0.4rem' }}>Clique em "Nova Pergunta" para começar</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['#', 'Pergunta', 'Tipo de Resposta', 'Visibilidade', 'Ações'].map(h => (
                  <th key={h} style={{ padding:'0.85rem 1.5rem', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perguntas.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < perguntas.length-1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'1rem 1.5rem', color:'#94a3b8', fontSize:'0.85rem', fontWeight:600 }}>{p.ordem || i+1}</td>
                  <td style={{ padding:'1rem 1.5rem', maxWidth:320 }}>
                    <div style={{ fontWeight:600, color:'#0f172a', fontSize:'0.9rem', lineHeight:1.4 }}>{p.texto}</div>
                    {!p.ativo && <span style={{ fontSize:'0.72rem', color:'#ef4444', fontWeight:600 }}>● Inativa</span>}
                  </td>
                  <td style={{ padding:'1rem 1.5rem' }}>
                    <span style={{ background:'#f1f5f9', color:'#475569', padding:'0.3rem 0.7rem', borderRadius:50, fontSize:'0.78rem', fontWeight:600 }}>
                      {labelTipo(p.tipo_resposta)}
                    </span>
                  </td>
                  <td style={{ padding:'1rem 1.5rem' }}>{badgeVis(p)}</td>
                  <td style={{ padding:'1rem 1.5rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button onClick={() => { setEditando(p); setModal(true); }}
                        style={{ width:34, height:34, borderRadius:8, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#3a7bd5'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; }}>
                        <Pencil size={15} style={{ color:'#64748b' }} />
                      </button>
                      <button onClick={() => setConfirmDel(p)}
                        style={{ width:34, height:34, borderRadius:8, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.background='#fef2f2'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='white'; }}>
                        <Trash2 size={15} style={{ color:'#ef4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* ─── TELA PRINCIPAL — CATEGORIAS ─── */
const CategoriaPerguntas = () => {
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [editando, setEditando]       = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [categoriaSel, setCategoriaSel] = useState(null); // drill-down para perguntas

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('anamnese_categorias')
      .select('*, anamnese_perguntas(count)')
      .order('ordem');
    setCategorias(data || []);
    setLoading(false);
  };

  const excluir = async (id) => {
    await supabase.from('anamnese_categorias').delete().eq('id', id);
    setConfirmDel(null); carregar();
  };

  // Se selecionou uma categoria, vai para a tela de perguntas
  if (categoriaSel) return <TelaPerguntas categoria={categoriaSel} onVoltar={() => { setCategoriaSel(null); carregar(); }} />;

  return (
    <div style={{ animation:'fadeIn 0.5s ease' }}>
      {modal && <ModalCategoria cat={editando} onClose={() => {setModal(false);setEditando(null);}} onSaved={() => {setModal(false);setEditando(null);carregar();}} />}

      {confirmDel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div style={{ background:'white', borderRadius:16, padding:'2rem', width:'100%', maxWidth:400, textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
              <Trash2 size={28} style={{ color:'#ef4444' }} />
            </div>
            <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700, marginBottom:'0.5rem' }}>Excluir Categoria?</h3>
            <p style={{ color:'#64748b', fontSize:'0.9rem', marginBottom:'1.75rem' }}>Isso excluirá <strong>todas as perguntas</strong> desta categoria. Ação irreversível.</p>
            <div style={{ display:'flex', gap:'1rem' }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1, padding:'0.85rem', border:'2px solid #e2e8f0', borderRadius:10, background:'white', cursor:'pointer', fontWeight:600, fontFamily:'var(--font-sans)', color:'#64748b' }}>Cancelar</button>
              <button onClick={() => excluir(confirmDel.id)} style={{ flex:1, padding:'0.85rem', border:'none', borderRadius:10, background:'#ef4444', color:'white', cursor:'pointer', fontWeight:700, fontFamily:'var(--font-sans)' }}>Excluir Tudo</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dash-header-flex" style={{ marginBottom:'2.5rem' }}>
        <div>
          <h1 style={{ fontSize:'1.8rem', fontFamily:'var(--font-serif)', color:'#0f172a', marginBottom:'0.25rem' }}>Anamnese — Categorias</h1>
          <p style={{ color:'#64748b', fontSize:'0.9rem' }}>Configure os grupos de perguntas para cada tipo de paciente</p>
        </div>
        <button onClick={() => { setEditando(null); setModal(true); }} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="dash-grid-3" style={{ marginBottom:'2rem' }}>
        {[
          { label:'Total de Categorias', value: categorias.length, color:'linear-gradient(135deg,#3a7bd5,#2563c7)' },
          { label:'Categorias Ativas',   value: categorias.filter(c => c.ativo).length, color:'linear-gradient(135deg,#059669,#047857)' },
          { label:'Total de Perguntas',  value: categorias.reduce((acc, c) => acc + (c.anamnese_perguntas?.[0]?.count || 0), 0), color:'linear-gradient(135deg,#7c3aed,#6d28d9)' },
        ].map(c => (
          <div key={c.label} style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:'1.5rem', display:'flex', alignItems:'center', gap:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:48, height:48, borderRadius:12, background:c.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Tag size={22} style={{ color:'white' }} />
            </div>
            <div>
              <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{c.value}</div>
              <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:'0.2rem' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de categorias */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding:'4rem', textAlign:'center', color:'#94a3b8' }}>Carregando...</div>
        ) : categorias.length === 0 ? (
          <div style={{ padding:'4rem', textAlign:'center' }}>
            <Tag size={40} style={{ color:'#e2e8f0', margin:'0 auto 1rem', display:'block' }} />
            <p style={{ color:'#64748b', fontWeight:500 }}>Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Categoria', 'Tipos de Paciente', 'Perguntas', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding:'0.85rem 1.75rem', textAlign:'left', fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorias.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < categorias.length-1 ? '1px solid #f8fafc' : 'none', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'1rem 1.75rem' }} onClick={() => setCategoriaSel(c)}>
                    <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{c.nome}</div>
                    {c.descricao && <div style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:'0.2rem' }}>{c.descricao}</div>}
                  </td>
                  <td style={{ padding:'1rem 1.75rem' }} onClick={() => setCategoriaSel(c)}>
                    <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                      {(c.tipo_paciente || []).map(t => {
                        const tp = TIPOS_PACIENTE.find(p => p.value === t);
                        return tp ? <span key={t} style={{ background:'#f1f5f9', color:'#475569', padding:'0.2rem 0.6rem', borderRadius:50, fontSize:'0.78rem', fontWeight:600 }}>{tp.emoji} {tp.label}</span> : null;
                      })}
                    </div>
                  </td>
                  <td style={{ padding:'1rem 1.75rem', fontSize:'0.9rem', color:'#475569', fontWeight:700 }} onClick={() => setCategoriaSel(c)}>
                    {c.anamnese_perguntas?.[0]?.count || 0} pergunta(s)
                  </td>
                  <td style={{ padding:'1rem 1.75rem' }} onClick={() => setCategoriaSel(c)}>
                    <span style={{ background: c.ativo ? '#f0fdf4' : '#fef2f2', color: c.ativo ? '#16a34a' : '#dc2626', padding:'0.3rem 0.85rem', borderRadius:50, fontSize:'0.78rem', fontWeight:700 }}>
                      {c.ativo ? '● Ativa' : '● Inativa'}
                    </span>
                  </td>
                  <td style={{ padding:'1rem 1.75rem' }}>
                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <button onClick={e => { e.stopPropagation(); setCategoriaSel(c); }}
                        style={{ padding:'0.45rem 0.9rem', borderRadius:8, border:'1.5px solid #bae6fd', background:'#f0f9ff', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.8rem', fontWeight:600, color:'#0284c7' }}>
                        <ChevronRight size={14} /> Perguntas
                      </button>
                      <button onClick={e => { e.stopPropagation(); setEditando(c); setModal(true); }}
                        style={{ width:34, height:34, borderRadius:8, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor='#3a7bd5'} onMouseLeave={e => e.currentTarget.style.borderColor='#e2e8f0'}>
                        <Pencil size={15} style={{ color:'#64748b' }} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDel(c); }}
                        style={{ width:34, height:34, borderRadius:8, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.background='#fef2f2'; }} onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='white'; }}>
                        <Trash2 size={15} style={{ color:'#ef4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoriaPerguntas;
