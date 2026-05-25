import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, LogOut, Settings, UserCog, Menu, X } from 'lucide-react';
import './Layout.css';
import { supabase } from '../../lib/supabaseClient';

const navItems = [
  { to: '/painel', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
  { to: '/painel/agenda', icon: <Calendar size={20} />, label: 'Agenda' },
  { to: '/painel/pacientes', icon: <Users size={20} />, label: 'Pacientes' },
  { to: '/painel/prontuario', icon: <FileText size={20} />, label: 'Prontuário' },
  { to: '/painel/disponibilidade', icon: <Settings size={20} />, label: 'Disponibilidade' },
  { to: '/painel/usuarios', icon: <UserCog size={20} />, label: 'Usuários' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Fecha a sidebar no mobile ao mudar de rota
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="sidebar-header">
        <div className="logo-container">Ψ</div>
        <h2>Dra. Ana Paula</h2>
        <p>Psicóloga Clínica</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Topbar do mobile */}
      <div className="mobile-dashboard-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3a7bd5, #2563c7)', color: 'white', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 'bold' }}>Ψ</div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Dra. Ana Paula</span>
        </div>
        <button className="mobile-toggle-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} color="#0f172a" />
        </button>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
