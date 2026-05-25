import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [novaConsulta, setNovaConsulta] = useState({ paciente_id: '', data_hora: '', tipo: 'Presencial' });

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Starts on Monday
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(start, i)); // Mon-Fri
  const hours = Array.from({ length: 9 }).map((_, i) => `${i + 9}:00`); // 9:00 to 17:00

  useEffect(() => {
    carregarDados();
  }, [currentDate]);

  const carregarDados = async () => {
    setLoading(true);
    // Pega pacientes para o select
    const { data: pacData } = await supabase.from('pacientes').select('id, nome');
    if (pacData) setPacientes(pacData);

    // Pega consultas da semana
    const fim = addDays(start, 5);
    const { data: consData } = await supabase
      .from('consultas')
      .select('*')
      .gte('data_hora', start.toISOString())
      .lt('data_hora', fim.toISOString());
    
    if (consData) setConsultas(consData);
    setLoading(false);
  };

  const handleSalvarConsulta = async (e) => {
    e.preventDefault();
    const paciente = pacientes.find(p => p.id === novaConsulta.paciente_id);
    if (!paciente) return alert('Selecione um paciente');

    const { error } = await supabase.from('consultas').insert([{
      paciente_id: paciente.id,
      paciente_nome: paciente.nome,
      data_hora: new Date(novaConsulta.data_hora).toISOString(),
      tipo: novaConsulta.tipo,
      status: 'Agendado'
    }]);

    if (!error) {
      setShowModal(false);
      setNovaConsulta({ paciente_id: '', data_hora: '', tipo: 'Presencial' });
      carregarDados();
    } else {
      alert('Erro ao agendar: ' + error.message);
    }
  };

  const getConsulta = (dia, horaTexto) => {
    return consultas.find(c => {
      const data = new Date(c.data_hora);
      const mesmaData = isSameDay(data, dia);
      const mesmaHora = data.getHours() === parseInt(horaTexto.split(':')[0]);
      return mesmaData && mesmaHora;
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div className="dash-header-flex" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '2rem' }}>Agenda</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', boxShadow: '0 8px 16px rgba(72,118,147,0.2)' }}>
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="card" style={{ border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button className="btn-secondary" onClick={() => setCurrentDate(addDays(currentDate, -7))} style={{ padding: '0.6rem', borderRadius: '12px' }}>
            <ChevronLeft size={24} />
          </button>
          
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)' }}>
            Semana de {format(start, "d 'de' MMMM", { locale: ptBR })}
          </h2>

          <button className="btn-secondary" onClick={() => setCurrentDate(addDays(currentDate, 7))} style={{ padding: '0.6rem', borderRadius: '12px' }}>
            <ChevronRight size={24} />
          </button>
        </div>

        {loading ? (
           <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Carregando agenda...</p>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #eee' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #eee', borderRight: '1px solid #eee', padding: '1rem', width: '90px', backgroundColor: '#f8f9fa' }}>Horário</th>
                  {weekDays.map((day, i) => (
                    <th key={i} style={{ borderBottom: '2px solid #eee', borderRight: i < 4 ? '1px solid #eee' : 'none', padding: '1rem', backgroundColor: '#f8f9fa', color: 'var(--primary-dark)' }}>
                      <div style={{ textTransform: 'capitalize', fontWeight: '600' }}>{format(day, 'EEEE', { locale: ptBR })}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{format(day, 'dd/MM')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour, i) => (
                  <tr key={i}>
                    <td style={{ borderBottom: '1px solid #eee', borderRight: '1px solid #eee', padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-muted)', backgroundColor: '#f8f9fa' }}>
                      {hour}
                    </td>
                    {weekDays.map((day, j) => {
                      const consulta = getConsulta(day, hour);
                      return (
                        <td key={j} style={{ borderBottom: '1px solid #eee', borderRight: j < 4 ? '1px solid #eee' : 'none', padding: '0.5rem', height: '70px', position: 'relative', transition: 'background 0.2s' }} onMouseEnter={(e) => !consulta && (e.currentTarget.style.background='#fafafa')} onMouseLeave={(e) => !consulta && (e.currentTarget.style.background='transparent')}>
                          {consulta && (
                            <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(72,118,147,0.2)', fontWeight: '500' }}>
                              {consulta.paciente_nome}
                              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>{consulta.tipo}</div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Consulta */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '2rem', position: 'relative', animation: 'fadeIn 0.3s ease' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary-dark)' }}>Agendar Consulta</h2>
            <form onSubmit={handleSalvarConsulta}>
              <div className="input-group">
                <label>Paciente</label>
                <select required value={novaConsulta.paciente_id} onChange={(e) => setNovaConsulta({...novaConsulta, paciente_id: e.target.value})}>
                  <option value="">Selecione um paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Data e Hora</label>
                <input required type="datetime-local" value={novaConsulta.data_hora} onChange={(e) => setNovaConsulta({...novaConsulta, data_hora: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Tipo de Atendimento</label>
                <select value={novaConsulta.tipo} onChange={(e) => setNovaConsulta({...novaConsulta, tipo: e.target.value})}>
                  <option value="Presencial">Presencial</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
