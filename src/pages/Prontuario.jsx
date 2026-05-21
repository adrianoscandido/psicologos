import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, Printer, Search, FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const Prontuario = () => {
  const [pacientes, setPacientes] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  
  // Form novo prontuário
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    queixa: '',
    sessao: '',
    evolucao: '',
    encaminhamentos: '',
    proxima_sessao: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { carregarPacientes(); }, []);
  useEffect(() => { if (pacienteSelecionado) carregarProntuarios(pacienteSelecionado.id); }, [pacienteSelecionado]);

  const carregarPacientes = async () => {
    const { data } = await supabase.from('pacientes').select('*').order('nome');
    setPacientes(data || []);
  };

  const carregarProntuarios = async (pacienteId) => {
    const { data } = await supabase.from('prontuarios').select('*')
      .eq('paciente_id', pacienteId).order('created_at', { ascending: false });
    setProntuarios(data || []);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!pacienteSelecionado) return;
    setSaving(true);

    const conteudo = JSON.stringify({
      queixa: form.queixa,
      sessao: form.sessao,
      evolucao: form.evolucao,
      encaminhamentos: form.encaminhamentos,
      proxima_sessao: form.proxima_sessao
    });

    const { error } = await supabase.from('prontuarios').insert([{
      paciente_id: pacienteSelecionado.id,
      paciente_nome: pacienteSelecionado.nome,
      conteudo
    }]);

    if (!error) {
      setForm({ queixa: '', sessao: '', evolucao: '', encaminhamentos: '', proxima_sessao: '' });
      setShowForm(false);
      carregarProntuarios(pacienteSelecionado.id);
    }
    setSaving(false);
  };

  const handlePrint = () => window.print();

  const parseConteudo = (texto) => {
    try { return JSON.parse(texto); }
    catch { return { queixa: texto, sessao: '', evolucao: '', encaminhamentos: '', proxima_sessao: '' }; }
  };

  const toggleExpandir = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const pacientesFiltrados = pacientes.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.25rem' }}>Prontuários</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Registros clínicos por paciente</p>
        </div>
        {pacienteSelecionado && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} /> Imprimir
            </button>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Novo Registro
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Lista de Pacientes */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)' }}>Pacientes</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..."
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.88rem', fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {pacientesFiltrados.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Nenhum paciente</div>
            ) : pacientesFiltrados.map(p => (
              <button key={p.id} onClick={() => { setPacienteSelecionado(p); setShowForm(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '1rem 1.5rem',
                  background: pacienteSelecionado?.id === p.id ? '#eff6ff' : 'transparent',
                  borderBottom: '1px solid #f8fafc', border: 'none', cursor: 'pointer',
                  borderLeft: `3px solid ${pacienteSelecionado?.id === p.id ? '#3a7bd5' : 'transparent'}`,
                  transition: 'all 0.15s'
                }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: pacienteSelecionado?.id === p.id ? '#1d4ed8' : '#0f172a' }}>{p.nome}</div>
                {p.telefone && <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>{p.telefone}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Área Principal */}
        <div>
          {!pacienteSelecionado ? (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <FileText size={48} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Selecione um paciente</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Escolha um paciente na lista para visualizar ou criar prontuários</p>
            </div>
          ) : (
            <div className="print-area">
              {/* Header do paciente */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a' }}>{pacienteSelecionado.nome}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.35rem' }}>
                    {pacienteSelecionado.email && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>✉ {pacienteSelecionado.email}</span>}
                    {pacienteSelecionado.telefone && <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📱 {pacienteSelecionado.telefone}</span>}
                  </div>
                </div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.35rem 0.9rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>
                  {prontuarios.length} registro(s)
                </div>
              </div>

              {/* Form novo registro */}
              {showForm && (
                <div style={{ background: 'white', borderRadius: 16, border: '2px solid #bfdbfe', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(58,123,213,0.1)' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} style={{ color: '#3a7bd5' }} /> Novo Registro — {new Date().toLocaleDateString('pt-BR')}
                  </h3>
                  <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Queixa Principal / Motivo da Sessão</label>
                      <textarea rows="3" required value={form.queixa} onChange={e => setForm({...form, queixa: e.target.value})} placeholder="Descreva o motivo da sessão e queixa apresentada pelo paciente..." />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Evolução da Sessão</label>
                      <textarea rows="5" required value={form.sessao} onChange={e => setForm({...form, sessao: e.target.value})} placeholder="Descreva o desenvolvimento da sessão, temas abordados, estado emocional do paciente..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Intervenções / Técnicas Utilizadas</label>
                        <textarea rows="3" value={form.evolucao} onChange={e => setForm({...form, evolucao: e.target.value})} placeholder="Técnicas e abordagens utilizadas na sessão..." />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Encaminhamentos / Orientações</label>
                        <textarea rows="3" value={form.encaminhamentos} onChange={e => setForm({...form, encaminhamentos: e.target.value})} placeholder="Tarefas para casa, encaminhamentos, orientações..." />
                      </div>
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label>Planejamento para Próxima Sessão</label>
                      <input type="text" value={form.proxima_sessao} onChange={e => setForm({...form, proxima_sessao: e.target.value})} placeholder="O que será abordado na próxima sessão?" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                      <button type="submit" disabled={saving} className="btn-primary">
                        <Save size={16} style={{ marginRight: 4 }} /> {saving ? 'Salvando...' : 'Salvar Prontuário'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de prontuários */}
              {prontuarios.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Nenhum prontuário registrado</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Clique em "Novo Registro" para criar o primeiro prontuário deste paciente</p>
                </div>
              ) : prontuarios.map(pron => {
                const dados = parseConteudo(pron.conteudo);
                const aberto = expandidos[pron.id];
                return (
                  <div key={pron.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <button onClick={() => toggleExpandir(pron.id)} style={{ width: '100%', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ display: 'flex', align: 'center', gap: '1rem' }}>
                        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>
                          {new Date(pron.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                          {dados.queixa?.slice(0, 80)}{dados.queixa?.length > 80 ? '...' : ''}
                        </div>
                      </div>
                      {aberto ? <ChevronUp size={18} style={{ color: '#94a3b8', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    </button>
                    
                    {aberto && (
                      <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid #f1f5f9' }}>
                        {[
                          { label: 'Queixa Principal', value: dados.queixa },
                          { label: 'Evolução da Sessão', value: dados.sessao },
                          { label: 'Intervenções / Técnicas', value: dados.evolucao },
                          { label: 'Encaminhamentos', value: dados.encaminhamentos },
                          { label: 'Plano para Próxima Sessão', value: dados.proxima_sessao }
                        ].filter(f => f.value).map(field => (
                          <div key={field.label} style={{ marginTop: '1.25rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3a7bd5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>{field.label}</div>
                            <div style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: 8, border: '1px solid #f1f5f9' }}>{field.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
          .app-layout { display: block; background: white; }
          .sidebar, .main-content > *:not(.print-area) { display: none; }
          .main-content { padding: 0; background: white; }
        }
      `}} />
    </div>
  );
};

export default Prontuario;
