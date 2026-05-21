import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ nome: '', email: '', telefone: '' });

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPacientes(data);
    setLoading(false);
  };

  const handleSalvarPaciente = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('pacientes')
      .insert([{ 
        nome: novoPaciente.nome, 
        email: novoPaciente.email, 
        telefone: novoPaciente.telefone 
      }]);

    if (!error) {
      setNovoPaciente({ nome: '', email: '', telefone: '' });
      setShowModal(false);
      carregarPacientes();
    } else {
      alert('Erro ao salvar paciente: ' + error.message);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '2rem' }}>Pacientes</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', boxShadow: '0 8px 16px rgba(72,118,147,0.2)' }}>
          <Plus size={20} />
          Novo Paciente
        </button>
      </div>

      <div className="card" style={{ border: '1px solid rgba(0,0,0,0.05)', background: '#fff' }}>
        <div style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar pacientes por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '1rem', background: '#f8f9fa' }}
          />
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando pacientes...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', background: '#f8f9fa' }}>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--primary-dark)', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--primary-dark)', fontWeight: '600' }}>Telefone</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--primary-dark)', fontWeight: '600' }}>E-mail</th>
                  <th style={{ padding: '1.2rem 1rem', color: 'var(--primary-dark)', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                ) : (
                  pacientesFiltrados.map(paciente => (
                    <tr key={paciente.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background='#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding: '1.2rem 1rem', fontWeight: '600', color: 'var(--text-dark)' }}>{paciente.nome}</td>
                      <td style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>{paciente.telefone || '-'}</td>
                      <td style={{ padding: '1.2rem 1rem', color: 'var(--text-muted)' }}>{paciente.email || '-'}</td>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <span style={{ backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Paciente */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '2rem', position: 'relative', animation: 'fadeIn 0.3s ease' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary-dark)' }}>Cadastrar Paciente</h2>
            <form onSubmit={handleSalvarPaciente}>
              <div className="input-group">
                <label>Nome Completo</label>
                <input required type="text" value={novoPaciente.nome} onChange={(e) => setNovoPaciente({...novoPaciente, nome: e.target.value})} placeholder="Ex: Maria Silva" />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input type="email" value={novoPaciente.email} onChange={(e) => setNovoPaciente({...novoPaciente, email: e.target.value})} placeholder="maria@email.com" />
              </div>
              <div className="input-group">
                <label>Telefone (WhatsApp)</label>
                <input required type="text" value={novoPaciente.telefone} onChange={(e) => setNovoPaciente({...novoPaciente, telefone: e.target.value})} placeholder="(11) 90000-0000" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar Paciente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pacientes;
