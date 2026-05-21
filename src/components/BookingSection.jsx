import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';

const BookingSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_hora: '',
    motivo: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      // 1. Tentar encontrar o paciente pelo email ou telefone
      let { data: pacienteExistente } = await supabase
        .from('pacientes')
        .select('id')
        .or(`email.eq.${formData.email},telefone.eq.${formData.telefone}`)
        .limit(1)
        .single();

      let pacienteId;

      if (pacienteExistente) {
        pacienteId = pacienteExistente.id;
      } else {
        // 2. Criar novo paciente se não existir
        const { data: novoPaciente, error: pacError } = await supabase
          .from('pacientes')
          .insert([{ 
            nome: formData.nome, 
            email: formData.email, 
            telefone: formData.telefone 
          }])
          .select()
          .single();

        if (pacError) throw pacError;
        pacienteId = novoPaciente.id;
      }

      const dataFormatada = new Date(formData.data_hora).toLocaleString('pt-BR');

      // 3. Criar a consulta (Agenda)
      const { error: consError } = await supabase
        .from('consultas')
        .insert([{
          paciente_id: pacienteId,
          paciente_nome: formData.nome,
          data_hora: new Date(formData.data_hora).toISOString(),
          tipo: 'Solicitação Online',
          status: 'Aguardando Confirmação'
        }]);

      if (consError) throw consError;

      // 4. Disparar email usando EmailJS
      const templateParams = {
        to_name: 'Dra. Ana Paula',
        from_name: formData.nome,
        paciente_email: formData.email,
        paciente_telefone: formData.telefone,
        data_agendamento: dataFormatada,
        motivo: formData.motivo || 'Não informado'
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      setSuccess(true);
      setFormData({ nome: '', email: '', telefone: '', data_hora: '', motivo: '' });

    } catch (err) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao enviar sua solicitação. Verifique se a chave Public Key do EmailJS foi preenchida corretamente no sistema.');
    }
    setLoading(false);
  };

  return (
    <section id="agendar" style={{ padding: '6rem 2rem', backgroundColor: '#f4f7f6' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Agende sua Consulta</h2>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Preencha o formulário abaixo e entraremos em contato para confirmar seu agendamento.</p>
        </div>

        <div className="card" style={{ padding: '3rem', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#e6f4ea', color: '#1e8e3e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>✓</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>Solicitação enviada com sucesso!</h3>
              <p style={{ color: 'var(--text-muted)' }}>Sua solicitação de agendamento foi registrada. Entraremos em contato via WhatsApp ou E-mail em breve para confirmar o horário.</p>
              <button className="btn-primary" onClick={() => setSuccess(false)} style={{ marginTop: '2rem' }}>Fazer novo agendamento</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {errorMsg && <div style={{ backgroundColor: '#fce8e6', color: '#d93025', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>{errorMsg}</div>}
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Nome Completo</label>
                <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Seu nome completo" style={{ padding: '1rem', borderRadius: '10px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>E-mail</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com" style={{ padding: '1rem', borderRadius: '10px' }} />
                </div>
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Telefone (WhatsApp)</label>
                  <input required type="tel" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="(11) 90000-0000" style={{ padding: '1rem', borderRadius: '10px' }} />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Data e Horário de Preferência</label>
                <input required type="datetime-local" value={formData.data_hora} onChange={e => setFormData({...formData, data_hora: e.target.value})} style={{ padding: '1rem', borderRadius: '10px' }} />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Motivo da Consulta (Opcional)</label>
                <textarea rows="4" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} placeholder="Descreva brevemente o motivo do contato..." style={{ padding: '1rem', borderRadius: '10px', resize: 'vertical' }}></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%)', boxShadow: '0 10px 20px rgba(72,118,147,0.3)', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Enviando...' : 'Solicitar Agendamento'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
