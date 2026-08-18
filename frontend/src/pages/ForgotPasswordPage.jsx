import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function requestCode(e) {
    e.preventDefault();
    setError('');
    const { data } = await api.post('/auth/forgot-password', { identifier });
    setMessage(data.message);
    setStep(2);
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    try {
      // Nota: em produção, o backend pode retornar o userId associado ao
      // identifier de forma seedada; aqui pedimos o userId por praticidade
      // de fluxo — ajuste a UX conforme a integração real do WhatsApp.
      await api.post('/auth/reset-password', { userId, code, newPassword });
      setMessage('Senha redefinida! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível redefinir a senha.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cc-bg)' }}>
      <div className="cc-card" style={{ width: 360 }}>
        <h2>Recuperar senha</h2>
        {step === 1 ? (
          <form onSubmit={requestCode}>
            <label className="cc-label">Telefone ou usuário</label>
            <input className="cc-input" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ marginBottom: 14 }} />
            <button className="cc-btn cc-btn-primary" style={{ width: '100%' }}>Enviar código</button>
            {message && <p style={{ fontSize: '0.85rem', marginTop: 12, color: 'var(--cc-text-muted)' }}>{message}</p>}
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label className="cc-label">ID do usuário (enviado internamente)</label>
            <input className="cc-input" required value={userId} onChange={(e) => setUserId(e.target.value)} style={{ marginBottom: 12 }} />
            <label className="cc-label">Código recebido</label>
            <input className="cc-input" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} style={{ marginBottom: 12 }} />
            <label className="cc-label">Nova senha</label>
            <input className="cc-input" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginBottom: 14 }} />
            {error && <div style={{ color: 'var(--cc-danger)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}
            {message && <div style={{ color: 'var(--cc-success)', fontSize: '0.85rem', marginBottom: 12 }}>{message}</div>}
            <button className="cc-btn cc-btn-primary" style={{ width: '100%' }}>Redefinir senha</button>
          </form>
        )}
      </div>
    </div>
  );
}
