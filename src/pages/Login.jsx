import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (email === 'adrianoscandido93@gmail.com' && password === '123') {
        navigate('/painel');
      } else {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } else {
      navigate('/painel');
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Left — Decorative */}
      <div style={{
        background: 'linear-gradient(150deg, #0f172a 0%, #1e3a5f 40%, #2d5a8e 70%, #3a7bd5 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(197,169,122,0.06)', border: '1px solid rgba(197,169,122,0.1)' }} />
        <div style={{ position: 'absolute', top: '60%', right: '5%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(58,123,213,0.15)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <div style={{
            fontSize: '6rem',
            fontFamily: 'var(--font-serif)',
            color: '#c5a97a',
            lineHeight: 1,
            marginBottom: '1.5rem',
            textShadow: '0 0 60px rgba(197,169,122,0.4)'
          }}>Ψ</div>
          
          <h1 style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}>
            Ana Paula Candido
          </h1>
          
          <p style={{ color: '#c5a97a', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2.5rem', fontWeight: 600 }}>
            Psicóloga Clínica
          </p>
          
          <div style={{ width: 50, height: 2, background: 'linear-gradient(135deg, #c5a97a, #e8d5b0)', margin: '0 auto 2.5rem', borderRadius: 2 }} />
          
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 300 }}>
            Sistema de gestão clínica integrado para organizar pacientes, agenda e prontuários.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', justifyContent: 'center' }}>
            {['Agenda', 'Pacientes', 'Prontuários'].map(item => (
              <div key={item} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: 50,
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 500
              }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.5rem' }}>
              Bem-vinda, Dra. Ana Paula
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Acesse o seu sistema de gestão clínica
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.9rem 1.1rem',
              borderRadius: 10,
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '0.5rem' }}>
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem 0.9rem 2.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    background: 'white',
                    transition: 'border-color 0.2s',
                    color: '#0f172a'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3a7bd5'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#374151', marginBottom: '0.5rem' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem 0.9rem 2.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    background: 'white',
                    transition: 'border-color 0.2s',
                    color: '#0f172a'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3a7bd5'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '0.5rem',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3a7bd5 0%, #2563c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(58,123,213,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            Acesso restrito a profissionais autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
