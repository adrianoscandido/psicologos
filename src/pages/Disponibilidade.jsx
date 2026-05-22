import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, Plus, Trash2, Clock } from 'lucide-react';

const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const HORAS = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2,'0')}:${m}`;
});

const Disponibilidade = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { carregarSlots(); }, []);

  const carregarSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from('disponibilidades').select('*').order('dia_semana').order('hora_inicio');
    setSlots(data || []);
    setLoading(false);
  };

  const addSlot = async () => {
    const { data, error } = await supabase.from('disponibilidades').insert([{
      dia_semana: 1,
      hora_inicio: '09:00',
      hora_fim: '18:00',
      intervalo_minutos: 50,
      ativo: true
    }]).select().single();
    
    if (error) {
      console.error(error);
      alert('Erro ao adicionar: ' + error.message + '\n\nPode ser bloqueio RLS na tabela disponibilidades.');
    }
    if (data) setSlots(prev => [...prev, data]);
  };

  const updateSlot = (id, field, value) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlot = async (id) => {
    await supabase.from('disponibilidades').delete().eq('id', id);
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    setMsg('');
    let hasError = false;
    for (const slot of slots) {
      const { error } = await supabase.from('disponibilidades').update({
        dia_semana: parseInt(slot.dia_semana),
        hora_inicio: slot.hora_inicio,
        hora_fim: slot.hora_fim,
        intervalo_minutos: parseInt(slot.intervalo_minutos),
        ativo: slot.ativo
      }).eq('id', slot.id);
      
      if (error) {
        hasError = true;
        console.error(error);
        alert('Erro ao salvar: ' + error.message);
        break;
      }
    }
    setSaving(false);
    if (!hasError) {
      setMsg('✓ Horários salvos com sucesso!');
      setTimeout(() => setMsg(''), 3000);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.25rem' }}>
            Disponibilidade
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Configure os horários em que você atende. Os pacientes verão apenas esses slots ao agendar online.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {msg && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>{msg}</span>}
          <button onClick={addSlot} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem' }}>
            <Plus size={18} /> Adicionar Dia
          </button>
          <button onClick={saveAll} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {slots.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <Clock size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: '#64748b', fontWeight: 500, marginBottom: '0.5rem' }}>Nenhum horário configurado</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Clique em "Adicionar Dia" para definir sua disponibilidade</p>
            </div>
          )}

          {slots.map(slot => (
            <div key={slot.id} style={{
              background: 'white',
              borderRadius: 14,
              border: `1px solid ${slot.ativo ? '#bfdbfe' : '#e2e8f0'}`,
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              opacity: slot.ativo ? 1 : 0.6
            }}>
              {/* Ativo toggle */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={slot.ativo} onChange={e => updateSlot(slot.id, 'ativo', e.target.checked)} style={{ width: 18, height: 18 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: slot.ativo ? '#16a34a' : '#94a3b8' }}>
                    {slot.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </label>
              </div>

              {/* Dia */}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dia da Semana</label>
                <select value={slot.dia_semana} onChange={e => updateSlot(slot.id, 'dia_semana', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}>
                  {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>

              {/* Horário início */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Início</label>
                <select value={slot.hora_inicio} onChange={e => updateSlot(slot.id, 'hora_inicio', e.target.value)}
                  style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div style={{ color: '#94a3b8', fontWeight: 700, marginTop: '1.2rem' }}>até</div>

              {/* Horário fim */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fim</label>
                <select value={slot.hora_fim} onChange={e => updateSlot(slot.id, 'hora_fim', e.target.value)}
                  style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}>
                  {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Intervalo */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duração Sessão</label>
                <select value={slot.intervalo_minutos} onChange={e => updateSlot(slot.id, 'intervalo_minutos', e.target.value)}
                  style={{ padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}>
                  {[30, 45, 50, 60, 90].map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>

              {/* Remover */}
              <button onClick={() => removeSlot(slot.id)} style={{ color: '#ef4444', padding: '0.5rem', borderRadius: 8, transition: 'background 0.2s', marginTop: '1.2rem' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12 }}>
        <p style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.6 }}>
          💡 <strong>Como funciona:</strong> Os pacientes que acessarem a página de agendamento do site verão apenas os horários livres dentro das faixas que você configurar aqui. Horários já ocupados por consultas agendadas serão automaticamente bloqueados.
        </p>
      </div>
    </div>
  );
};

export default Disponibilidade;
