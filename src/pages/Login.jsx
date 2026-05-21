import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    
    // Tenta fazer o login real no Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      // Fallback de emergência caso o usuário ainda não tenha sido criado no painel do Supabase
      if (email === 'adrianoscandido93@gmail.com' && password === '123') {
        navigate('/painel');
      } else {
        setError('Login falhou: ' + authError.message + '. (Se for o seu primeiro acesso, verifique se criou o usuário no painel Auth do Supabase)');
      }
    } else {
      // Login com sucesso no Supabase
      navigate('/painel');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Left side - Decorative */}
      <div style={{ flex: 1, backgroundColor: 'var(--primary-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', backgroundImage: 'url(/bg.jpg)', backgroundSize: 'cover', backgroundBlendMode: 'multiply', opacity: 0.9 }}>
        <div style={{ fontSize: '8rem', lineHeight: 1, marginBottom: '1rem', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>Ψ</div>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem', fontFamily: 'var(--font-serif)', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>Ana Paula Candido dos Santos</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, letterSpacing: '1px' }}>Sistema de Gestão Clínica</p>
      </div>

      {/* Right side - Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2rem', textAlign: 'center', fontFamily: 'var(--font-serif)' }}>Acesso Restrito</h2>
          
          {error && (
            <div style={{ backgroundColor: '#fce8e6', color: '#d93025', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
