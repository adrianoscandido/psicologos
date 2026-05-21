import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const pacientes = [
    { id: 1, nome: 'Maria Silva', telefone: '(11) 98765-4321', ultimaConsulta: '20/05/2026', status: 'Ativo' },
    { id: 2, nome: 'João Santos', telefone: '(11) 91234-5678', ultimaConsulta: '15/05/2026', status: 'Ativo' },
    { id: 3, nome: 'Ana Oliveira', telefone: '(11) 99999-8888', ultimaConsulta: '10/05/2026', status: 'Inativo' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>Pacientes</h1>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} />
          Novo Paciente
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', marginBottom: '1.5rem', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input 
            type="text" 
            placeholder="Buscar pacientes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--primary-dark)' }}>Nome</th>
              <th style={{ padding: '1rem', color: 'var(--primary-dark)' }}>Telefone</th>
              <th style={{ padding: '1rem', color: 'var(--primary-dark)' }}>Última Consulta</th>
              <th style={{ padding: '1rem', color: 'var(--primary-dark)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--primary-dark)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(paciente => (
              <tr key={paciente.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{paciente.nome}</td>
                <td style={{ padding: '1rem' }}>{paciente.telefone}</td>
                <td style={{ padding: '1rem' }}>{paciente.ultimaConsulta}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    backgroundColor: paciente.status === 'Ativo' ? '#e6f4ea' : '#fce8e6',
                    color: paciente.status === 'Ativo' ? '#1e8e3e' : '#d93025',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {paciente.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ver Detalhes</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pacientes;
