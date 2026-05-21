import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Plus, Pencil, Trash2, Save, X, Search,
  ShieldCheck, User, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';

const PAPEIS = [
  { value: 'admin', label: 'Administrador', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'psicologa', label: 'Psicóloga', color: '#2563eb', bg: '#eff6ff' },
];

const getPapel = (v) => PAPEIS.find(p => p.value === v) || PAPEIS[1];

/* ─── Modal de Criação/Edição ─── */
const ModalUsuario = ({ usuario, onClose, onSaved }) => {
  const isEdit = !!usuario?.id;
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    papel: usuario?.papel || 'psicologa',
    ativo: usuario?.ativo ?? true,
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      if (isEdit) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from('usuarios_sistema')
          .update({
            nome: form.nome,
            papel: form.papel,
            ativo: form.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', usuario.id);
        if (error) throw error;
      } else {
        // Criar novo usuário — primeiro no Auth via Supabase
        // Como a chave pública não permite criar usuários Auth diretamente,
        // criamos apenas o perfil e instruímos o admin a criar no dashboard
        const { error } = await supabase
          .from('usuarios_sistema')
          .insert([{
            nome: form.nome,
            email: form.email,
            papel: form.papel,
            ativo: form.ativo,
          }]);
        if (error) throw error;
      }
      onSaved();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar usuário.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.15rem' }}>
              {isEdit ? 'Altere as informações do usuário' : 'Preencha os dados do novo usuário'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} style={{ color: '#64748b' }} />
          </button>
        </div>

        <form onSubmit={handleSalvar} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {erro && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem' }}>
              {erro}
            </div>
          )}

          {/* Nome */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
              Nome Completo
            </label>
            <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome do usuário"
              style={{ width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3a7bd5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Email — só leitura na edição */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
              E-mail {isEdit && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(não editável)</span>}
            </label>
            <input type="email" required value={form.email} readOnly={isEdit}
              onChange={e => !isEdit && setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com"
              style={{ width: '100%', padding: '0.8rem 1rem', border: '2px solid #e2e8f0', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none', color: '#0f172a', background: isEdit ? '#f8fafc' : 'white', cursor: isEdit ? 'not-allowed' : 'text' }}
              onFocus={e => { if (!isEdit) e.target.style.borderColor = '#3a7bd5'; }}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Papel */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '0.5rem' }}>
              Nível de Acesso
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {PAPEIS.map(p => (
                <button key={p.value} type="button" onClick={() => setForm({ ...form, papel: p.value })}
                  style={{ padding: '0.85rem', borderRadius: 10, border: `2px solid ${form.papel === p.value ? p.color : '#e2e8f0'}`, background: form.papel === p.value ? p.bg : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: form.papel === p.value ? p.color : '#374151' }}>
                    {p.value === 'admin' ? '👑' : '💼'} {p.label}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {p.value === 'admin' ? 'Acesso total ao sistema' : 'Acesso à clínica'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', flex: 1 }}>
              Status do Usuário
            </label>
            <button type="button" onClick={() => setForm({ ...form, ativo: !form.ativo })}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: form.ativo ? '#f0fdf4' : '#fef2f2', color: form.ativo ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {form.ativo ? <><CheckCircle size={16} /> Ativo</> : <><XCircle size={16} /> Inativo</>}
            </button>
          </div>

          {!isEdit && (
            <div style={{ padding: '0.9rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
              <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.6 }}>
                ⚠️ <strong>Importante:</strong> Após cadastrar o perfil aqui, acesse o <strong>Supabase Dashboard → Authentication → Users</strong> e crie o login com o e-mail e senha desejados.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#64748b' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── PÁGINA PRINCIPAL ─── */
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('usuarios_sistema')
      .select('*')
      .order('created_at');
    setUsuarios(data || []);
    setLoading(false);
  };

  const excluirUsuario = async (id) => {
    await supabase.from('usuarios_sistema').delete().eq('id', id);
    setConfirmExcluir(null);
    carregarUsuarios();
  };

  const toggleAtivo = async (u) => {
    await supabase.from('usuarios_sistema').update({ ativo: !u.ativo, updated_at: new Date().toISOString() }).eq('id', u.id);
    carregarUsuarios();
  };

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Modal */}
      {modalAberto && (
        <ModalUsuario
          usuario={usuarioEditando}
          onClose={() => { setModalAberto(false); setUsuarioEditando(null); }}
          onSaved={() => { setModalAberto(false); setUsuarioEditando(null); carregarUsuarios(); }}
        />
      )}

      {/* Confirm excluir */}
      {confirmExcluir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Trash2 size={28} style={{ color: '#ef4444' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Excluir Usuário</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Tem certeza que deseja excluir <strong>{confirmExcluir.nome}</strong>? Essa ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfirmExcluir(null)} style={{ flex: 1, padding: '0.85rem', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)', color: '#64748b' }}>
                Cancelar
              </button>
              <button onClick={() => excluirUsuario(confirmExcluir.id)} style={{ flex: 1, padding: '0.85rem', border: 'none', borderRadius: 10, background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.25rem' }}>
            Usuários do Sistema
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Gerencie quem tem acesso ao painel clínico
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={carregarUsuarios} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.1rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>
            <RefreshCw size={16} /> Atualizar
          </button>
          <button onClick={() => { setUsuarioEditando(null); setModalAberto(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Novo Usuário
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total de Usuários', value: usuarios.length, icon: <User size={22} />, color: 'linear-gradient(135deg, #3a7bd5, #2563c7)' },
          { label: 'Usuários Ativos', value: usuarios.filter(u => u.ativo).length, icon: <CheckCircle size={22} />, color: 'linear-gradient(135deg, #059669, #047857)' },
          { label: 'Administradores', value: usuarios.filter(u => u.papel === 'admin').length, icon: <ShieldCheck size={22} />, color: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Busca */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail..."
              style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.35rem', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '0.88rem', fontFamily: 'var(--font-sans)', outline: 'none', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3a7bd5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{filtrados.length} usuário(s)</span>
        </div>

        {/* Tabela */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Carregando usuários...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <User size={40} style={{ color: '#e2e8f0', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: '#64748b', fontWeight: 500 }}>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Usuário', 'E-mail', 'Nível de Acesso', 'Status', 'Cadastrado em', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => {
                const papel = getPapel(u.papel);
                return (
                  <tr key={u.id} style={{ borderBottom: i < filtrados.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Nome */}
                    <td style={{ padding: '1rem 1.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: u.papel === 'admin' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #3a7bd5, #2563c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{u.nome}</div>
                          {u.papel === 'admin' && <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600 }}>👑 Admin</div>}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '1rem 1.75rem', fontSize: '0.85rem', color: '#64748b' }}>{u.email}</td>
                    {/* Papel */}
                    <td style={{ padding: '1rem 1.75rem' }}>
                      <span style={{ background: papel.bg, color: papel.color, padding: '0.3rem 0.85rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                        {papel.label}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '1rem 1.75rem' }}>
                      <button onClick={() => toggleAtivo(u)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: u.ativo ? '#f0fdf4' : '#fef2f2', color: u.ativo ? '#16a34a' : '#dc2626', border: 'none', borderRadius: 50, padding: '0.3rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                        {u.ativo ? <><CheckCircle size={13} /> Ativo</> : <><XCircle size={13} /> Inativo</>}
                      </button>
                    </td>
                    {/* Data */}
                    <td style={{ padding: '1rem 1.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    {/* Ações */}
                    <td style={{ padding: '1rem 1.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setUsuarioEditando(u); setModalAberto(true); }}
                          style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a7bd5'; e.currentTarget.style.color = '#3a7bd5'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                          <Pencil size={15} style={{ color: 'inherit' }} />
                        </button>
                        <button onClick={() => setConfirmExcluir(u)}
                          style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}>
                          <Trash2 size={15} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box */}
      <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12 }}>
        <p style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.7 }}>
          💡 <strong>Senhas:</strong> As senhas de acesso são gerenciadas diretamente pelo <strong>Supabase Authentication</strong>. Para criar ou redefinir senhas, acesse: <strong>Supabase Dashboard → Authentication → Users</strong>. O perfil aqui define o nome, nível de acesso e status no sistema.
        </p>
      </div>
    </div>
  );
};

export default Usuarios;
