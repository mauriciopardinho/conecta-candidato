import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'field_agent') navigate('/agent');
      else navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemoCredentials(id, pwd) {
    setIdentifier(id);
    setPassword(pwd);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--cc-navy) 0%, #020617 100%)',
      padding: 16,
    }}>
      <div className="cc-card" style={{ width: '100%', maxWidth: 400, borderRadius: 20, padding: 28, background: '#ffffff' }}>
        
        {/* Header da Plataforma */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 4 }}>🛒</div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--cc-navy)', fontWeight: 800 }}>Mercado IA DF</h2>
          <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
            Economia Inteligente em Supermercados no Distrito Federal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="cc-label">Telefone ou Usuário</label>
          <input
            className="cc-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Ex: admin ou +5561998340001"
            required
            style={{ marginBottom: 14 }}
          />

          <label className="cc-label">Senha</label>
          <input
            className="cc-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha de acesso"
            required
            style={{ marginBottom: 14 }}
          />

          {error && (
            <div style={{
              background: '#fef2f2',
              color: 'var(--cc-danger)',
              fontSize: '0.85rem',
              padding: 10,
              borderRadius: 8,
              marginBottom: 14,
              border: '1px solid #fecaca',
            }}>
              {error}
            </div>
          )}

          <button className="cc-btn cc-btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Acessando Plataforma...' : 'Entrar no Mercado IA DF'}
          </button>
        </form>

        {/* Atalhos Rápidos de Acesso para Demonstração */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cc-text-muted)', textTransform: 'uppercase' }}>
            ⚡ Acesso Rápido para Demonstração:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <button
              onClick={() => fillDemoCredentials('admin', 'Admin@123')}
              type="button"
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}
            >
              👑 <strong>Gestor DF:</strong> <code>admin</code> / <code>Admin@123</code>
            </button>
            <button
              onClick={() => fillDemoCredentials('cabo1', 'Cabo@123')}
              type="button"
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}
            >
              📱 <strong>Caçador (Ceilândia):</strong> <code>cabo1</code> / <code>Cabo@123</code>
            </button>
            <button
              onClick={() => fillDemoCredentials('+55 (61) 99830001', 'Eleitor@123')}
              type="button"
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left' }}
            >
              🛍️ <strong>Consumidor:</strong> <code>+55 (61) 99830001</code> / <code>Eleitor@123</code>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: '0.82rem', textAlign: 'center', color: 'var(--cc-text-muted)' }}>
          <Link to="/register" style={{ color: 'var(--cc-teal)', fontWeight: 600 }}>Cadastrar Nova Conta de Consumidor</Link>
          <div style={{ marginTop: 6 }}>
            <Link to="/pricing" style={{ color: '#64748b' }}>Planos Comerciais SaaS</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
