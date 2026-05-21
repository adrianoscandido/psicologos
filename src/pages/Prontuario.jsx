import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, Printer } from 'lucide-react';

const Prontuario = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [queixa, setQueixa] = useState('');
  const [sessao, setSessao] = useState('');
  const [numeroProntuario, setNumeroProntuario] = useState('');

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    const { data } = await supabase.from('pacientes').select('id, nome, telefone');
    if (data) setPacientes(data);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSalvar = async () => {
    if (!pacienteSelecionado) return alert('Selecione um paciente!');
    if (!queixa || !sessao) return alert('Preencha a queixa e a evolução da sessão.');

    const pac = pacientes.find(p => p.id === pacienteSelecionado);

    const { error } = await supabase.from('prontuarios').insert([{
      paciente_id: pac.id,
      paciente_nome: pac.nome,
      conteudo: `QUEIXA: ${queixa}\n\nSESSÃO: ${sessao}`
    }]);

    if (!error) {
      alert('Prontuário salvo no banco de dados com sucesso!');
      setQueixa('');
      setSessao('');
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const pacienteInfos = pacientes.find(p => p.id === pacienteSelecionado) || {};

  return (
    <div className="prontuario-container" style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '2rem' }}>Novo Prontuário</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
            <Printer size={20} />
            Imprimir PDF
          </button>
          <button className="btn-primary" onClick={handleSalvar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', boxShadow: '0 8px 16px rgba(72,118,147,0.2)' }}>
            <Save size={20} />
            Salvar
          </button>
        </div>
      </div>

      <div className="card print-area" style={{ padding: '3rem', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        
        {/* Header - Simulating the business card / form header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '2px solid var(--primary-light)', paddingBottom: '1rem' }}>
          <div style={{ fontSize: '4rem', color: 'var(--primary-color)', lineHeight: 1 }}>Ψ</div>
          <div>
            <h2 style={{ color: 'var(--primary-dark)', fontSize: '1.8rem', margin: 0 }}>Ana Paula Candido dos Santos</h2>
            <p style={{ color: 'var(--primary-dark)', fontWeight: 'bold', margin: 0 }}>Psicóloga CRP 06/157985</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
          REGISTRO DE ACOMPANHAMENTO
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 1rem', fontWeight: 'bold' }}>Nº do Prontuário</div>
            <input type="text" value={numeroProntuario} onChange={e => setNumeroProntuario(e.target.value)} style={{ border: '1px solid var(--primary-light)', padding: '0.25rem', width: '100px' }} />
          </div>
        </div>

        {/* Identificação */}
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Dados de Identificação do Usuário
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <div className="form-row">
            <label>Selecione o Paciente:</label>
            <select className="print-input no-print-appearance" value={pacienteSelecionado} onChange={(e) => setPacienteSelecionado(e.target.value)}>
              <option value="">Selecione...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Data de Nascimento:</label>
              <input type="text" placeholder="__/__/____" className="print-input" />
            </div>
            <div className="form-row" style={{ flex: 1, alignItems: 'center', gap: '0.5rem' }}>
              <label>Sexo:</label>
              <label><input type="radio" name="sexo" value="M" /> M</label>
              <label><input type="radio" name="sexo" value="F" /> F</label>
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Telefone:</label>
              <input type="text" value={pacienteInfos.telefone || ''} readOnly className="print-input" />
            </div>
          </div>
        </div>

        {/* Evolução */}
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Evolução do Atendimento Atual
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="form-row" style={{ alignItems: 'flex-start' }}>
            <label>Queixa / Diagnóstico:</label>
            <textarea rows="4" className="print-input" value={queixa} onChange={e => setQueixa(e.target.value)} style={{ resize: 'vertical' }}></textarea>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>
              Sessão Data: {new Date().toLocaleDateString('pt-BR')}
            </div>
            <textarea rows="6" className="print-input" value={sessao} onChange={e => setSessao(e.target.value)} placeholder="Descreva os pontos principais da sessão de hoje..." style={{ width: '100%', resize: 'vertical', padding: '1rem' }}></textarea>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .form-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .form-row label {
          white-space: nowrap;
          color: var(--primary-dark);
          font-weight: 500;
        }
        .print-input {
          flex: 1;
          border: none;
          border-bottom: 1px dashed var(--primary-color);
          background: transparent;
          padding: 0.25rem;
          font-family: inherit;
          font-size: 1rem;
        }
        .print-input:focus {
          outline: none;
          border-bottom: 2px solid var(--primary-dark);
        }
        textarea.print-input {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: #fafafa;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .btn-primary, .btn-secondary {
            display: none !important;
          }
          .app-layout {
            display: block;
            background: white !important;
          }
          .sidebar {
            display: none !important;
          }
          .main-content {
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }
          .no-print-appearance {
            appearance: none;
            -moz-appearance: none;
            -webkit-appearance: none;
          }
        }
      `}} />
    </div>
  );
};

export default Prontuario;
