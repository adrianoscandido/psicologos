import React, { useState } from 'react';

const Prontuario = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="prontuario-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>Registro de Acompanhamento</h1>
        <button className="btn-primary" onClick={handlePrint}>Imprimir / Gerar PDF</button>
      </div>

      <div className="card print-area" style={{ padding: '3rem', backgroundColor: '#fff' }}>
        
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
            <input type="text" style={{ border: '1px solid var(--primary-light)', padding: '0.25rem', width: '100px' }} />
          </div>
        </div>

        {/* Identificação */}
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Dados de Identificação do Usuário
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <div className="form-row">
            <label>Nome:</label>
            <input type="text" className="print-input" />
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
              <input type="text" className="print-input" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Data de Início:</label>
              <input type="text" placeholder="__/__/____" className="print-input" />
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <label>Data de Término:</label>
              <input type="text" placeholder="__/__/____" className="print-input" />
            </div>
          </div>

          <div className="form-row">
            <label>Responsável:</label>
            <input type="text" className="print-input" />
          </div>
        </div>

        {/* Evolução */}
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Evolução do Atendimento Atual
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="form-row" style={{ alignItems: 'flex-start' }}>
            <label>Queixa:</label>
            <textarea rows="5" className="print-input" style={{ resize: 'vertical' }}></textarea>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', display: 'inline-block', marginBottom: '0.5rem' }}>
              Sessão: ___/___/___
            </div>
            <textarea rows="6" className="print-input" style={{ width: '100%', resize: 'vertical' }}></textarea>
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
        }
        .print-input {
          flex: 1;
          border: none;
          border-bottom: 1px solid var(--primary-color);
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
          border: 1px solid var(--primary-color);
          border-radius: 4px;
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
          }
          .btn-primary {
            display: none;
          }
          .app-layout {
            display: block;
          }
          .sidebar {
            display: none;
          }
          .main-content {
            padding: 0;
            background: white;
          }
        }
      `}} />
    </div>
  );
};

export default Prontuario;
