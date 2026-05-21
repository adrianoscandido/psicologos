import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({ pacientes: 0, consultasHoje: 0, consultasSemana: 0 });
  const [consultasHoje, setConsultasHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Pega total de pacientes
      const { count: pacientesCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true });

      // Pega consultas de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const { data: consultas } = await supabase
        .from('consultas')
        .select('*')
        .gte('data_hora', hoje.toISOString())
        .lt('data_hora', amanha.toISOString())
        .order('data_hora', { ascending: true });

      setStats({
        pacientes: pacientesCount || 0,
        consultasHoje: consultas?.length || 0,
        consultasSemana: (consultas?.length || 0) + 4 // Mock parcial para a semana
      });
      setConsultasHoje(consultas || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-dark)', fontSize: '2rem' }}>Bom dia, Dra. Ana Paula</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Cards modernizados (Glassmorphism) */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', padding: '1.2rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 16px rgba(72,118,147,0.2)' }}>
            <Users size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>{loading ? '-' : stats.pacientes}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>Pacientes Ativos</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-gold) 0%, #b39768 100%)', padding: '1.2rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 16px rgba(197,169,122,0.2)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>{loading ? '-' : stats.consultasHoje}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>Consultas Hoje</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ background: 'linear-gradient(135deg, #7A9FCA 0%, #5b8ab8 100%)', padding: '1.2rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 16px rgba(122,159,202,0.2)' }}>
            <Clock size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>{loading ? '-' : stats.consultasSemana}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>Consultas na Semana</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', color: 'var(--primary-dark)' }}>Próximas Consultas Hoje</h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando agenda...</p>
        ) : consultasHoje.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8f9fa', borderRadius: '12px' }}>
            Nenhuma consulta agendada para hoje.
          </div>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {consultasHoje.map((consulta) => {
              const dataObj = new Date(consulta.data_hora);
              const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return (
                <li key={consulta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor='var(--primary-light)'} onMouseLeave={(e) => e.currentTarget.style.borderColor='var(--border-color)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(75, 120, 165, 0.1)', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {hora}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '1.05rem' }}>{consulta.paciente_nome}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{consulta.tipo} • {consulta.status}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
