import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function VerifyWhatsappPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-whatsapp', { userId, code });
      setSuccess('Conta confirmada! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  }

  if (!userId) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Nenhum cadastro pendente encontrado. <a href="/register">Voltar ao cadastro</a>.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cc-bg)' }}>
      <form onSubmit={handleSubmit} className="cc-card" style={{ width: 340 }}>
        <h2>Confirme seu WhatsApp</h2>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
          Enviamos um código de 6 dígitos por WhatsApp. Digite-o abaixo.
        </p>
        <input
          className="cc-input"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          style={{ marginBottom: 14, textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.3em' }}
        />
        {error && <div style={{ color: 'var(--cc-danger)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'var(--cc-success)', fontSize: '0.85rem', marginBottom: 12 }}>{success}</div>}
        <button className="cc-btn cc-btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Verificando...' : 'Confirmar'}
        </button>
      </form>
    </div>
  );
}
