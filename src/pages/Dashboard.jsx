import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value, color, loading }) => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    padding: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s',
    cursor: 'default'
  }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
  >
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 14,
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem', fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pacientes: 0, hoje: 0, semana: 0 });
  const [consultasHoje, setConsultasHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const { count: pac } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
      
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
      const semana = new Date(hoje); semana.setDate(semana.getDate() + 7);

      const { data: ch } = await supabase.from('consultas').select('*').gte('data_hora', hoje.toISOString()).lt('data_hora', amanha.toISOString()).order('data_hora');
      const { count: cs } = await supabase.from('consultas').select('*', { count: 'exact', head: true }).gte('data_hora', hoje.toISOString()).lt('data_hora', semana.toISOString());

      setStats({ pacientes: pac || 0, hoje: ch?.length || 0, semana: cs || 0 });
      setConsultasHoje(ch || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.25rem' }}>
            Bom dia, Dra. Ana Paula ☀️
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/painel/pacientes')} style={{ gap: '0.5rem' }}>
          <Plus size={18} /> Novo Paciente
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard loading={loading} icon={<Users size={24} />} label="Pacientes Cadastrados" value={stats.pacientes} color="linear-gradient(135deg, #3a7bd5 0%, #2563c7 100%)" />
        <StatCard loading={loading} icon={<Calendar size={24} />} label="Consultas Hoje" value={stats.hoje} color="linear-gradient(135deg, #c5a97a 0%, #b39768 100%)" />
        <StatCard loading={loading} icon={<Clock size={24} />} label="Consultas esta Semana" value={stats.semana} color="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" />
        <StatCard loading={loading} icon={<TrendingUp size={24} />} label="Aproveitamento" value="100%" color="linear-gradient(135deg, #059669 0%, #047857 100%)" />
      </div>

      {/* Today's appointments */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-sans)' }}>Agenda de Hoje</h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.15rem' }}>{stats.hoje} consulta{stats.hoje !== 1 ? 's' : ''} agendada{stats.hoje !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/painel/agenda')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3a7bd5', fontSize: '0.88rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
            Ver Agenda <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ padding: '1rem 2rem' }}>
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>Carregando...</p>
          ) : consultasHoje.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Nenhuma consulta hoje</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Aproveite para organizar prontuários ou agendar novas sessões</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
              {consultasHoje.map(c => (
                <div key={c.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 12,
                  border: '1px solid #f1f5f9',
                  background: '#fafbfc',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#bfdbfe'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    color: '#3a7bd5',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    flexShrink: 0
                  }}>{hora(c.data_hora)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{c.paciente_nome}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>{c.tipo}</div>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.85rem',
                    borderRadius: 50,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: c.status === 'Agendado' ? '#f0fdf4' : '#fffbeb',
                    color: c.status === 'Agendado' ? '#16a34a' : '#d97706'
                  }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
