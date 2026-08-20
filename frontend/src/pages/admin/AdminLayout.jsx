import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

export default function AdminLayout() {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoBanner, setDemoBanner] = useState(true);

  const menuItems = [
    { to: '/admin', label: 'Painel Executivo', icon: '📊', end: true },
    { to: '/admin/producao', label: 'Pesquisa de Ofertas', icon: '📈' },
    { to: '/admin/regioes', label: 'Mapa de Mercados DF', icon: '🗺️' },
    { to: '/admin/cabos', label: 'Caçadores de Ofertas', icon: '📱' },
    { to: '/admin/sugestoes', label: 'Dicas de Compras', icon: '💡' },
    { to: '/admin/solicitacoes', label: 'Alertas de Divergência', icon: '🚨' },
    { to: '/admin/ml', label: 'IA Preditiva de Preços', icon: '🧠' },
    { to: '/admin/auditoria', label: 'Auditoria LGPD', icon: '📜' },
    { to: '/admin/onboarding', label: 'Setup de Regiões', icon: '⚙️' },
    { to: '/pricing', label: 'Planos SaaS', icon: '💎' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cc-bg)' }}>
      
      {/* BANNER MODO DEMONSTRAÇÃO */}
      {demoBanner && (
        <div style={{
          background: 'linear-gradient(90deg, #10b981 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10001,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🛒 <strong>Mercado IA DF:</strong> Inteligência de Preços de Supermercado em Brasília (13 RAs do DF).</span>
          </div>
          <button
            onClick={() => setDemoBanner(false)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER MOBILE */}
      <header className="cc-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.5rem',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <span style={{ fontFamily: 'var(--cc-font-display)', fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
            Mercado IA DF
          </span>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          Sair
        </button>
      </header>

      {/* BARRA DE ROLAGEM HORIZONTAL NO MOBILE */}
      <div className="cc-mobile-subnav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `cc-mobile-pill ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* DRAWER SLIDE-OVER MOBILE */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
          />

          <div style={{
            position: 'relative',
            width: '280px',
            maxWidth: '80%',
            background: 'var(--cc-navy)',
            color: '#fff',
            height: '100%',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            zIndex: 10000,
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--cc-font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                  Mercado IA DF
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Painel do Gestor</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem' }}
              >
                ✕
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: '10px',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    textDecoration: 'none'
                  }}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <button
              onClick={logout}
              className="cc-btn"
              style={{
                marginTop: 'auto',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px'
              }}
            >
              <span>🚪</span> Sair da Conta
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      <aside className="cc-sidebar">
        <div style={{ fontFamily: 'var(--cc-font-display)', fontSize: '1.2rem', marginBottom: 24, color: '#fff', fontWeight: 800 }}>
          🛒 Mercado IA DF
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="cc-btn"
          style={{
            marginTop: 32,
            background: 'rgba(255,255,255,0.06)',
            color: '#b9c9d8',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>🚪</span> Sair da Conta
        </button>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="cc-admin-layout">
        <Outlet />
      </div>
    </div>
  );
}
