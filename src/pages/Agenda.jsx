import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Starts on Monday
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(start, i)); // Mon-Fri

  const hours = Array.from({ length: 9 }).map((_, i) => `${i + 9}:00`); // 9:00 to 17:00

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>Agenda</h1>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} />
          Novo Agendamento
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn-secondary" onClick={() => setCurrentDate(addDays(currentDate, -7))} style={{ padding: '0.5rem' }}>
            <ChevronLeft size={20} />
          </button>
          
          <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)' }}>
            Semana de {format(start, "d 'de' MMMM", { locale: ptBR })} a {format(addDays(start, 4), "d 'de' MMMM", { locale: ptBR })}
          </h2>

          <button className="btn-secondary" onClick={() => setCurrentDate(addDays(currentDate, 7))} style={{ padding: '0.5rem' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', border: '1px solid var(--border-color)' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid var(--border-color)', padding: '1rem', width: '80px', backgroundColor: '#f8f9fa' }}>Horário</th>
                {weekDays.map((day, i) => (
                  <th key={i} style={{ border: '1px solid var(--border-color)', padding: '1rem', backgroundColor: '#f8f9fa', color: 'var(--primary-dark)' }}>
                    {format(day, 'EEEE', { locale: ptBR })}<br/>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#666' }}>{format(day, 'dd/MM')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid var(--border-color)', padding: '0.5rem', textAlign: 'center', fontWeight: '500', color: '#666', backgroundColor: '#f8f9fa' }}>
                    {hour}
                  </td>
                  {weekDays.map((_, j) => (
                    <td key={j} style={{ border: '1px solid var(--border-color)', padding: '0.5rem', height: '60px', position: 'relative' }}>
                      {/* Simulating an appointment on Wed at 14:00 */}
                      {i === 5 && j === 2 && (
                        <div style={{ backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          Maria Silva
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
