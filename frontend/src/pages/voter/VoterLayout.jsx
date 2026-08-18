import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

export default function VoterLayout() {
  const { logout } = useAuth();

  return (
    <div style={{ paddingBottom: 76, minHeight: '100vh', background: 'var(--cc-bg)' }}>
      <header style={{
        background: 'linear-gradient(135deg, var(--cc-navy), var(--cc-navy-dark))',
        color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div>
          <strong style={{ fontFamily: 'var(--cc-font-display)', fontSize: '1.1rem', color: '#fff' }}>Conecta Candidato</strong>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Área do Eleitor (DF)</div>
        </div>
        <button onClick={logout} className="cc-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#dfe9f2', fontSize: '0.82rem', padding: '6px 14px' }}>
          Sair
        </button>
      </header>

      <main style={{ padding: '16px 16px 80px 16px', maxWidth: 800, margin: '0 auto' }}>
        <Outlet />
      </main>

      <nav className="cc-bottom-nav">
        <NavLink to="/app" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>🏠</span>
          <span>Início</span>
        </NavLink>
        <NavLink to="/app/propostas" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>📋</span>
          <span>Propostas</span>
        </NavLink>
        <NavLink to="/app/sugestoes" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>💡</span>
          <span>Sugestões</span>
        </NavLink>
        <NavLink to="/app/solicitacoes" className={({ isActive }) => (isActive ? 'active' : '')}>
          <span>📝</span>
          <span>Solicitações</span>
        </NavLink>
      </nav>
    </div>
  );
}
