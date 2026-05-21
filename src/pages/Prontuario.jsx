import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Plus, FileText, Printer, X, ChevronRight, Calendar, Clock, User, Save } from 'lucide-react';

/* ─────────────────────────────────────────────
   PRINT STYLES (injetadas no head)
───────────────────────────────────────────── */
const printStyles = `
  @media print {
    * { visibility: hidden !important; }
    .prontuario-print-area, .prontuario-print-area * { visibility: visible !important; }
    .prontuario-print-area {
      position: fixed;
      inset: 0;
      background: white;
      padding: 2.5cm 2cm;
      font-family: Arial, sans-serif;
      color: #000;
      z-index: 99999;
    }
  }
`;

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
const Prontuario = () => {
  // Listas
  const [pacientes, setPacientes] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [busca, setBusca] = useState('');

  // Seleção
  const [pacSelecionado, setPacSelecionado] = useState(null);
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null);

  // Modals
  const [modalNovaSessao, setModalNovaSessao] = useState(false);
  const [modalImpressao, setModalImpressao] = useState(false);
  const [loadingSessoes, setLoadingSessoes] = useState(false);

  // Form nova sessão
  const [formSessao, setFormSessao] = useState({
    data_sessao: new Date().toISOString().slice(0, 10),
    queixa: '',
    evolucao: '',
    tecnicas: '',
    encaminhamentos: '',
    plano_proxima: ''
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarPacientes(); }, []);
  useEffect(() => { if (pacSelecionado) carregarSessoes(pacSelecionado.id); }, [pacSelecionado]);

  /* ── Data fetchers ── */
  const carregarPacientes = async () => {
    const { data } = await supabase.from('pacientes').select('*').order('nome');
    setPacientes(data || []);
  };

  const carregarSessoes = async (pid) => {
    setLoadingSessoes(true);
    const { data } = await supabase
      .from('prontuarios')
      .select('*')
      .eq('paciente_id', pid)
      .order('created_at', { ascending: false });
    setSessoes(data || []);
    setSessaoSelecionada(null);
    setLoadingSessoes(false);
  };

  /* ── Salvar sessão ── */
  const salvarSessao = async (e) => {
    e.preventDefault();
    if (!pacSelecionado) return;
    setSalvando(true);
    const { error } = await supabase.from('prontuarios').insert([{
      paciente_id: pacSelecionado.id,
      paciente_nome: pacSelecionado.nome,
      conteudo: JSON.stringify(formSessao)
    }]);
    if (!error) {
      setModalNovaSessao(false);
      setFormSessao({ data_sessao: new Date().toISOString().slice(0, 10), queixa: '', evolucao: '', tecnicas: '', encaminhamentos: '', plano_proxima: '' });
      carregarSessoes(pacSelecionado.id);
    }
    setSalvando(false);
  };

  /* ── Parse conteúdo ── */
  const parseSessao = (raw) => {
    try { return JSON.parse(raw); }
    catch { return { queixa: raw }; }
  };

  /* ── Imprimir ── */
  const handlePrint = () => {
    setModalImpressao(true);
    setTimeout(() => window.print(), 300);
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  /* ─── RENDER ─── */
  return (
    <>
      <style>{printStyles}</style>

      {/* ── Área de impressão (invisível em tela, visível no print) ── */}
      {modalImpressao && pacSelecionado && (
        <PrintArea
          paciente={pacSelecionado}
          sessoes={sessoes.map(s => ({ ...s, dados: parseSessao(s.conteudo) }))}
          onClose={() => setModalImpressao(false)}
        />
      )}

      {/* ── Modal: Nova Sessão ── */}
      {modalNovaSessao && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            {/* Header modal */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>Nova Sessão</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.15rem' }}>{pacSelecionado?.nome}</p>
              </div>
              <button onClick={() => setModalNovaSessao(false)} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} style={{ color: '#64748b' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={salvarSessao} style={{ padding: '2rem' }}>
              {/* Data */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>Data da Sessão</label>
                <input type="date" required value={formSessao.data_sessao} onChange={e => setFormSessao({ ...formSessao, data_sessao: e.target.value })}
                  style={{ padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', outline: 'none', width: '200px' }} />
              </div>

              {/* Campos */}
              {[
                { key: 'queixa', label: 'Queixa / Motivo da Sessão', required: true, rows: 3, placeholder: 'O que o paciente trouxe para esta sessão?' },
                { key: 'evolucao', label: 'Evolução e Observações Clínicas', required: true, rows: 5, placeholder: 'Estado emocional, comportamento, insights, progressos...' },
                { key: 'tecnicas', label: 'Técnicas e Intervenções Utilizadas', required: false, rows: 3, placeholder: 'Ex: Reestruturação cognitiva, Mindfulness, TCC...' },
                { key: 'encaminhamentos', label: 'Encaminhamentos e Tarefas', required: false, rows: 3, placeholder: 'Tarefas de casa, encaminhamentos para outros profissionais...' },
                { key: 'plano_proxima', label: 'Plano para a Próxima Sessão', required: false, rows: 2, placeholder: 'Temas a abordar, foco da próxima sessão...' }
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
                    {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <textarea required={f.required} rows={f.rows} value={formSessao[f.key]} onChange={e => setFormSessao({ ...formSessao, [f.key]: e.target.value })} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', color: '#0f172a', lineHeight: 1.7, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#3a7bd5'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              ))}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalNovaSessao(false)} style={{ padding: '0.8rem 1.5rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: 'pointer', background: 'white', color: '#64748b' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn-primary">
                  <Save size={16} />
                  {salvando ? 'Salvando...' : 'Salvar Sessão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          TELA PRINCIPAL
      ══════════════════════════════════ */}
      <div style={{ display: 'flex', height: 'calc(100vh - 5rem)', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>

        {/* ── Coluna 1: Lista de Pacientes ── */}
        <div style={{ width: 280, flexShrink: 0, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem' }}>Pacientes</h2>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar paciente..."
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '0.85rem', fontFamily: 'var(--font-sans)', outline: 'none', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3a7bd5'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {pacientesFiltrados.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <User size={32} style={{ color: '#e2e8f0', margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Nenhum paciente encontrado</p>
              </div>
            ) : pacientesFiltrados.map(p => (
              <button key={p.id} onClick={() => setPacSelecionado(p)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.9rem 1.25rem',
                  background: pacSelecionado?.id === p.id ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                  borderBottom: '1px solid #f8fafc', border: 'none', cursor: 'pointer',
                  borderLeft: `3px solid ${pacSelecionado?.id === p.id ? '#3a7bd5' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s'
                }}>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: pacSelecionado?.id === p.id ? '#1d4ed8' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</div>
                  {p.telefone && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{p.telefone}</div>}
                </div>
                {pacSelecionado?.id === p.id && <ChevronRight size={14} style={{ color: '#3a7bd5', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Coluna 2: Sessões do paciente ── */}
        {!pacSelecionado ? (
          <div style={{ flex: 1, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <FileText size={52} style={{ color: '#e2e8f0' }} />
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '1rem' }}>Selecione um paciente</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Escolha um paciente na lista para ver os registros clínicos</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {/* Header do paciente */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.25rem 1.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>{pacSelecionado.nome}</h2>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  {pacSelecionado.email && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>✉ {pacSelecionado.email}</span>}
                  {pacSelecionado.telefone && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📱 {pacSelecionado.telefone}</span>}
                  <span style={{ fontSize: '0.8rem', color: '#3a7bd5', fontWeight: 600 }}>{sessoes.length} sessão(ões) registrada(s)</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', color: '#64748b', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a7bd5'; e.currentTarget.style.color = '#3a7bd5'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                  <Printer size={16} /> Imprimir Prontuário
                </button>
                <button onClick={() => setModalNovaSessao(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem' }}>
                  <Plus size={16} /> Nova Sessão
                </button>
              </div>
            </div>

            {/* Lista de sessões */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: '1rem', flexDirection: sessaoSelecionada ? 'row' : 'column' }}>
              {loadingSessoes ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.9rem' }}>Carregando sessões...</div>
              ) : sessoes.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 16, border: '1px dashed #cbd5e1', padding: '3.5rem', textAlign: 'center' }}>
                  <Calendar size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
                  <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhuma sessão registrada</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Clique em "Nova Sessão" para registrar o primeiro atendimento</p>
                  <button onClick={() => setModalNovaSessao(true)} className="btn-primary">
                    <Plus size={16} /> Registrar 1ª Sessão
                  </button>
                </div>
              ) : (
                <>
                  {/* Timeline de sessões */}
                  <div style={{ flex: sessaoSelecionada ? '0 0 320px' : 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sessoes.map((s, idx) => {
                      const dados = parseSessao(s.conteudo);
                      const data = dados.data_sessao ? new Date(dados.data_sessao + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                      const ativo = sessaoSelecionada?.id === s.id;
                      return (
                        <button key={s.id} onClick={() => setSessaoSelecionada(ativo ? null : s)}
                          style={{
                            background: ativo ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'white',
                            border: `1.5px solid ${ativo ? '#93c5fd' : '#e2e8f0'}`,
                            borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s',
                            boxShadow: ativo ? '0 4px 16px rgba(58,123,213,0.12)' : '0 1px 4px rgba(0,0,0,0.04)'
                          }}>
                          {/* Número da sessão */}
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: ativo ? 'linear-gradient(135deg, #3a7bd5, #2563c7)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: ativo ? 'white' : '#64748b', flexShrink: 0 }}>
                            {sessoes.length - idx}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: ativo ? '#1d4ed8' : '#0f172a' }}>
                              Sessão {sessoes.length - idx} — {data}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {dados.queixa?.slice(0, 60)}{dados.queixa?.length > 60 ? '...' : ''}
                            </div>
                          </div>
                          <ChevronRight size={16} style={{ color: ativo ? '#3a7bd5' : '#cbd5e1', flexShrink: 0, transform: ativo ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalhe da sessão */}
                  {sessaoSelecionada && (() => {
                    const dados = parseSessao(sessaoSelecionada.conteudo);
                    const data = dados.data_sessao ? new Date(dados.data_sessao + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : new Date(sessaoSelecionada.created_at).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
                    const numSessao = sessoes.length - sessoes.findIndex(s => s.id === sessaoSelecionada.id);
                    return (
                      <div style={{ flex: 1, background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        {/* Header sessão */}
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ background: 'linear-gradient(135deg, #3a7bd5, #2563c7)', color: 'white', padding: '0.2rem 0.7rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800 }}>Sessão {numSessao}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>📅 {data}</p>
                          </div>
                          <button onClick={() => setSessaoSelecionada(null)} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={15} style={{ color: '#64748b' }} />
                          </button>
                        </div>
                        {/* Campos */}
                        <div style={{ padding: '1.75rem' }}>
                          {[
                            { label: 'Queixa / Motivo', valor: dados.queixa, color: '#dc2626', bg: '#fef2f2' },
                            { label: 'Evolução e Observações', valor: dados.evolucao, color: '#2563eb', bg: '#eff6ff' },
                            { label: 'Técnicas e Intervenções', valor: dados.tecnicas, color: '#7c3aed', bg: '#f5f3ff' },
                            { label: 'Encaminhamentos', valor: dados.encaminhamentos, color: '#b45309', bg: '#fffbeb' },
                            { label: 'Plano Próxima Sessão', valor: dados.plano_proxima, color: '#16a34a', bg: '#f0fdf4' }
                          ].filter(f => f.valor).map(f => (
                            <div key={f.label} style={{ marginBottom: '1.5rem' }}>
                              <div style={{ display: 'inline-block', background: f.bg, color: f.color, padding: '0.25rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
                                {f.label}
                              </div>
                              <div style={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.75, whiteSpace: 'pre-wrap', padding: '0.9rem 1.1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                                {f.valor}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   COMPONENTE DE IMPRESSÃO (só aparece no print)
───────────────────────────────────────────── */
const PrintArea = ({ paciente, sessoes, onClose }) => (
  <div className="prontuario-print-area">
    {/* Botão fechar (não aparece no print) */}
    <button onClick={onClose} style={{ position: 'fixed', top: 16, right: 16, zIndex: 99999, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Arial', fontWeight: 700 }} className="no-print">
      ✕ Fechar Prévia
    </button>

    {/* Cabeçalho */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '2px solid #3a7bd5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '3.5rem', color: '#3a7bd5', fontFamily: 'Georgia', lineHeight: 1 }}>Ψ</div>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: '#1e3a5f', margin: 0, fontFamily: 'Georgia' }}>Ana Paula Candido dos Santos</h1>
        <p style={{ color: '#3a7bd5', fontWeight: 'bold', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Psicóloga • CRP 06/157985</p>
      </div>
    </div>

    {/* Dados do paciente */}
    <div style={{ background: '#f0f4f8', border: '1px solid #c8d8e8', borderRadius: 6, padding: '1rem 1.5rem', marginBottom: '2rem' }}>
      <h2 style={{ color: '#1e3a5f', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontFamily: 'Arial' }}>Dados do Paciente</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.88rem' }}>
        <div><strong>Nome:</strong> {paciente.nome}</div>
        {paciente.email && <div><strong>E-mail:</strong> {paciente.email}</div>}
        {paciente.telefone && <div><strong>Telefone:</strong> {paciente.telefone}</div>}
        <div><strong>Total de sessões:</strong> {sessoes.length}</div>
      </div>
    </div>

    {/* Sessões */}
    <h2 style={{ color: '#1e3a5f', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontFamily: 'Arial' }}>Registro de Sessões</h2>
    {sessoes.map((s, i) => {
      const data = s.dados.data_sessao ? new Date(s.dados.data_sessao + 'T12:00:00').toLocaleDateString('pt-BR') : new Date(s.created_at).toLocaleDateString('pt-BR');
      return (
        <div key={s.id} style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid', border: '1px solid #dde6ef', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ background: '#1e3a5f', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'Arial' }}>
            Sessão {sessoes.length - i} — {data}
          </div>
          <div style={{ padding: '1rem' }}>
            {[
              { label: 'Queixa / Motivo', valor: s.dados.queixa },
              { label: 'Evolução e Observações Clínicas', valor: s.dados.evolucao },
              { label: 'Técnicas e Intervenções', valor: s.dados.tecnicas },
              { label: 'Encaminhamentos', valor: s.dados.encaminhamentos },
              { label: 'Plano para Próxima Sessão', valor: s.dados.plano_proxima }
            ].filter(f => f.valor).map(f => (
              <div key={f.label} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#3a7bd5', textTransform: 'uppercase', fontFamily: 'Arial' }}>{f.label}</div>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#222', whiteSpace: 'pre-wrap', marginTop: '0.2rem' }}>{f.valor}</div>
              </div>
            ))}
          </div>
        </div>
      );
    })}

    <div style={{ marginTop: '3rem', borderTop: '1px solid #ccc', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#999', textAlign: 'center', fontFamily: 'Arial' }}>
      Documento gerado em {new Date().toLocaleDateString('pt-BR')} — Psicóloga Ana Paula Candido dos Santos • CRP 06/157985 — Uso exclusivo clínico e confidencial
    </div>
  </div>
);

export default Prontuario;
