import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, LogOut } from 'lucide-react';
import './Layout.css';
import { supabase } from '../../lib/supabaseClient';

const navItems = [
  { to: '/painel', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
  { to: '/painel/agenda', icon: <Calendar size={20} />, label: 'Agenda' },
  { to: '/painel/pacientes', icon: <Users size={20} />, label: 'Pacientes' },
  { to: '/painel/prontuario', icon: <FileText size={20} />, label: 'Prontuário' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
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
  );
};

const Layout = () => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

export default Layout;
