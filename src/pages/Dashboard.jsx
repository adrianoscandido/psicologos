import React from 'react';
import { Users, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '2rem', color: 'var(--primary-dark)' }}>Resumo Geral</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(75, 120, 165, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <Users size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>42</h3>
            <p style={{ color: '#666', margin: 0 }}>Pacientes Ativos</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(75, 120, 165, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <Calendar size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>8</h3>
            <p style={{ color: '#666', margin: 0 }}>Consultas Hoje</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(75, 120, 165, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <Clock size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>12</h3>
            <p style={{ color: '#666', margin: 0 }}>Consultas na Semana</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--primary-dark)' }}>Próximas Consultas Hoje</h2>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { time: '14:00', name: 'Maria Silva', type: 'Sessão Online' },
            { time: '15:30', name: 'João Santos', type: 'Sessão Presencial' },
            { time: '17:00', name: 'Ana Oliveira', type: 'Primeira Sessão' }
          ].map((consulta, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{consulta.time}</strong>
                <div>
                  <div style={{ fontWeight: '500' }}>{consulta.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{consulta.type}</div>
                </div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Ver Prontuário</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
