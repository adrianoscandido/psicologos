import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Gera todos os slots do dia baseado na disponibilidade
const gerarSlots = (disp, ocupados) => {
  const slots = [];
  const [hIni, mIni] = disp.hora_inicio.split(':').map(Number);
  const [hFim, mFim] = disp.hora_fim.split(':').map(Number);
  const totalMinIni = hIni * 60 + mIni;
  const totalMinFim = hFim * 60 + mFim;
  const intervalo = disp.intervalo_minutos;

  for (let t = totalMinIni; t + intervalo <= totalMinFim; t += intervalo) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    const hora = `${h}:${m}`;
    const ocupado = ocupados.includes(hora);
    slots.push({ hora, ocupado });
  }
  return slots;
};

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const BookingSection = () => {
  const [step, setStep] = useState(1); // 1=data/hora, 2=dados, 3=sucesso
  
  // Data selecionada
  const [mesAtual, setMesAtual] = useState(new Date());
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horaSelecionada, setHoraSelecionada] = useState('');
  
  // Disponibilidades e ocupações
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [ocupados, setOcupados] = useState([]); // horas já ocupadas na data
  const [slots, setSlots] = useState([]);

  // Formulário
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', motivo: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { carregarDisponibilidades(); }, []);
  useEffect(() => { if (dataSelecionada) carregarOcupados(dataSelecionada); }, [dataSelecionada]);

  const carregarDisponibilidades = async () => {
    const { data } = await supabase.from('disponibilidades').select('*').eq('ativo', true);
    setDisponibilidades(data || []);
  };

  const carregarOcupados = async (data) => {
    const ini = new Date(data); ini.setHours(0,0,0,0);
    const fim = new Date(data); fim.setHours(23,59,59,999);
    const { data: consultas } = await supabase
      .from('consultas').select('data_hora')
      .gte('data_hora', ini.toISOString())
      .lte('data_hora', fim.toISOString());
    
    const horas = (consultas || []).map(c => {
      const d = new Date(c.data_hora);
      return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    });
    setOcupados(horas);

    // Busca disponibilidade do dia da semana
    const diaSemana = new Date(data).getDay();
    const disp = disponibilidades.find(d => d.dia_semana === diaSemana);
    if (disp) {
      setSlots(gerarSlots(disp, horas));
    } else {
      setSlots([]);
    }
  };

  // Calendário
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const iniciaSemana = primeiroDia.getDay();
  const hoje = new Date(); hoje.setHours(0,0,0,0);

  const isDiaDisponivel = (dia) => {
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    if (d < hoje) return false;
    const diaSemana = d.getDay();
    return disponibilidades.some(disp => disp.dia_semana === diaSemana && disp.ativo);
  };

  const selecionarDia = (dia) => {
    if (!isDiaDisponivel(dia)) return;
    const d = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
    setDataSelecionada(d);
    setHoraSelecionada('');
    setSlots([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dataSelecionada || !horaSelecionada) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Criar/buscar paciente
      let { data: pac } = await supabase.from('pacientes').select('id')
        .or(`email.eq.${form.email},telefone.eq.${form.telefone}`).limit(1).single();
      
      let pacienteId;
      if (pac) {
        pacienteId = pac.id;
      } else {
        const { data: novo, error: pe } = await supabase.from('pacientes')
          .insert([{ nome: form.nome, email: form.email, telefone: form.telefone }]).select().single();
        if (pe) throw pe;
        pacienteId = novo.id;
      }

      // 2. Montar data/hora
      const [h, m] = horaSelecionada.split(':');
      const dataHora = new Date(dataSelecionada);
      dataHora.setHours(parseInt(h), parseInt(m), 0, 0);

      // 3. Criar consulta
      const { error: ce } = await supabase.from('consultas').insert([{
        paciente_id: pacienteId,
        paciente_nome: form.nome,
        data_hora: dataHora.toISOString(),
        slot_hora: horaSelecionada,
        tipo: 'Solicitação Online',
        status: 'Aguardando Confirmação'
      }]);
      if (ce) throw ce;

      // 4. Email
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: 'Dra. Ana Paula',
          from_name: form.nome,
          paciente_email: form.email,
          paciente_telefone: form.telefone,
          data_agendamento: `${dataSelecionada.toLocaleDateString('pt-BR')} às ${horaSelecionada}`,
          motivo: form.motivo || 'Não informado'
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStep(3);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao enviar. Tente novamente.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(1); setDataSelecionada(null); setHoraSelecionada('');
    setForm({ nome: '', email: '', telefone: '', motivo: '' }); setSlots([]);
  };

  return (
    <section id="agendar" style={{ padding: '7rem 2rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(58,123,213,0.08)', border: '1px solid rgba(58,123,213,0.2)', color: '#3a7bd5', padding: '0.35rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            📅 Agendamento
          </div>
          <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '1rem' }}>Agende sua Consulta</h2>
          <div style={{ width: 50, height: 4, borderRadius: 4, background: 'linear-gradient(135deg, #3a7bd5 0%, #c5a97a 100%)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>Escolha um dia e horário disponível. Confirmaremos por e-mail ou WhatsApp.</p>
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            {['1. Escolha o horário', '2. Seus dados'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i ? 'linear-gradient(135deg, #3a7bd5, #2563c7)' : step === i+1 ? 'linear-gradient(135deg, #3a7bd5, #2563c7)' : '#e2e8f0', color: step >= i+1 ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, boxShadow: step === i+1 ? '0 4px 12px rgba(58,123,213,0.3)' : 'none' }}>
                  {i+1}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: step === i+1 ? 700 : 500, color: step === i+1 ? '#0f172a' : '#94a3b8' }}>{label}</span>
                {i < 1 && <div style={{ width: 32, height: 2, background: step > 1 ? '#3a7bd5' : '#e2e8f0', margin: '0 0.25rem', borderRadius: 2 }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Calendário e Horários */}
        {step === 1 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 420 }}>
              {/* Calendário */}
              <div style={{ padding: '2rem', borderRight: '1px solid #f1f5f9' }}>
                {/* Navegação mês */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))} style={{ padding: '0.4rem', borderRadius: 8, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {MESES_PT[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                  </span>
                  <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))} style={{ padding: '0.4rem', borderRadius: 8, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Dias da semana */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {DIAS_PT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', padding: '0.25rem', textTransform: 'uppercase' }}>{d}</div>)}
                </div>

                {/* Dias */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                  {Array.from({ length: iniciaSemana }, (_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: diasNoMes }, (_, i) => {
                    const dia = i + 1;
                    const disponivel = isDiaDisponivel(dia);
                    const selecionado = dataSelecionada && dataSelecionada.getDate() === dia && dataSelecionada.getMonth() === mesAtual.getMonth();
                    const passado = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia) < hoje;
                    return (
                      <button key={dia} onClick={() => selecionarDia(dia)} disabled={!disponivel}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: '0.85rem',
                          fontWeight: selecionado ? 700 : 500,
                          cursor: disponivel ? 'pointer' : 'not-allowed',
                          background: selecionado ? 'linear-gradient(135deg, #3a7bd5, #2563c7)' : disponivel ? '#f0f9ff' : 'transparent',
                          color: selecionado ? 'white' : passado ? '#e2e8f0' : disponivel ? '#0f172a' : '#d1d5db',
                          boxShadow: selecionado ? '0 4px 12px rgba(58,123,213,0.35)' : 'none',
                          transition: 'all 0.15s'
                        }}>
                        {dia}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f0f9ff', border: '1px solid #bfdbfe' }} /> Disponível
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg, #3a7bd5, #2563c7)' }} /> Selecionado
                  </span>
                </div>
              </div>

              {/* Horários */}
              <div style={{ padding: '2rem' }}>
                {!dataSelecionada ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <Calendar size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Selecione uma data disponível no calendário</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <Clock size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
                    <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Sem horários disponíveis</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Todos os slots estão ocupados neste dia</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontFamily: 'var(--font-sans)', fontSize: '1rem' }}>
                      {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                      {slots.filter(s => !s.ocupado).length} horário(s) disponível(is)
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', maxHeight: 280, overflowY: 'auto' }}>
                      {slots.map(slot => (
                        <button key={slot.hora} disabled={slot.ocupado} onClick={() => setHoraSelecionada(slot.hora)}
                          style={{
                            padding: '0.65rem 0.5rem',
                            borderRadius: 8,
                            border: `2px solid ${horaSelecionada === slot.hora ? '#3a7bd5' : slot.ocupado ? '#f1f5f9' : '#e2e8f0'}`,
                            background: horaSelecionada === slot.hora ? 'linear-gradient(135deg, #3a7bd5, #2563c7)' : slot.ocupado ? '#f8fafc' : 'white',
                            color: horaSelecionada === slot.hora ? 'white' : slot.ocupado ? '#cbd5e1' : '#374151',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: slot.ocupado ? 'not-allowed' : 'pointer',
                            textDecoration: slot.ocupado ? 'line-through' : 'none',
                            fontFamily: 'var(--font-sans)',
                            boxShadow: horaSelecionada === slot.hora ? '0 4px 12px rgba(58,123,213,0.3)' : 'none',
                            transition: 'all 0.15s'
                          }}>
                          {slot.hora}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(2)} disabled={!dataSelecionada || !horaSelecionada} className="btn-primary"
                style={{ opacity: (!dataSelecionada || !horaSelecionada) ? 0.4 : 1, cursor: (!dataSelecionada || !horaSelecionada) ? 'not-allowed' : 'pointer' }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Dados */}
        {step === 2 && (
          <div className="card">
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{dataSelecionada?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              </div>
              <div style={{ width: 1, background: '#bae6fd' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horário</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{horaSelecionada}</div>
              </div>
              <button onClick={() => setStep(1)} style={{ marginLeft: 'auto', color: '#3a7bd5', fontSize: '0.85rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Alterar
              </button>
            </div>

            {errorMsg && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.9rem 1.1rem', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Nome Completo</label>
                <input required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Seu nome completo" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>E-mail</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="seu@email.com" />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>WhatsApp</label>
                  <input required type="tel" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="(11) 90000-0000" />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Motivo (opcional)</label>
                <textarea rows="3" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} placeholder="Descreva brevemente o motivo do contato..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>← Voltar</button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Confirmando...' : '✓ Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 — Sucesso */}
        {step === 3 && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={40} style={{ color: '#059669' }} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '1rem' }}>
              Agendamento Confirmado!
            </h3>
            <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '1rem' }}>
              Sua consulta foi agendada para <strong style={{ color: '#0f172a' }}>{dataSelecionada?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> às <strong style={{ color: '#0f172a' }}>{horaSelecionada}</strong>.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
              Você receberá uma confirmação por e-mail em breve. A Dra. Ana Paula entrará em contato pelo WhatsApp para confirmar.
            </p>
            <button onClick={resetForm} className="btn-primary">Fazer novo agendamento</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingSection;
