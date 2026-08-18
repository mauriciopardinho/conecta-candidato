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
      setError(err.response?.data?.error || 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, var(--cc-navy), var(--cc-navy-dark))' }}>
      <form onSubmit={handleSubmit} className="cc-card" style={{ width: 360, background: '#fff' }}>
        <h2 style={{ marginBottom: 4 }}>Conecta Candidato</h2>
        <p style={{ color: 'var(--cc-text-muted)', marginTop: 4, marginBottom: 20, fontSize: '0.9rem' }}>
          Entre com seu telefone (eleitor) ou usuário (cabo/admin).
        </p>

        <label className="cc-label">Telefone ou usuário</label>
        <input className="cc-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required style={{ marginBottom: 14 }} />

        <label className="cc-label">Senha</label>
        <input className="cc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 14 }} />

        {error && <div style={{ color: 'var(--cc-danger)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}

        <button className="cc-btn cc-btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center' }}>
          <Link to="/forgot-password">Esqueci minha senha</Link>
          {' · '}
          <Link to="/register">Sou eleitor e quero me cadastrar</Link>
        </div>
      </form>
    </div>
  );
}
