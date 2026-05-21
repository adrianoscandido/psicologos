import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Home, LogOut } from 'lucide-react';
import './Layout.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supabase logout will go here
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="psi-symbol">Ψ</span>
        </div>
        <h2>Dra. Ana Paula</h2>
        <p>Psicóloga Clínica</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <Home size={20} />
              <span>Início</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/agenda" className={({ isActive }) => isActive ? 'active' : ''}>
              <Calendar size={20} />
              <span>Agenda</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/pacientes" className={({ isActive }) => isActive ? 'active' : ''}>
              <Users size={20} />
              <span>Pacientes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/prontuario" className={({ isActive }) => isActive ? 'active' : ''}>
              <FileText size={20} />
              <span>Novo Prontuário</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
