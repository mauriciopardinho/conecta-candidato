import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', accepted_terms: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.accepted_terms) {
      setError('É necessário aceitar os termos e a política de privacidade.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      if (data.token && data.user) {
        localStorage.setItem('cc_token', data.token);
        localStorage.setItem('cc_user', JSON.stringify(data.user));
        setSuccess('Cadastro realizado com sucesso! Entrando no aplicativo...');
        setTimeout(() => {
          window.location.href = '/app';
        }, 1000);
      } else {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cc-bg)', padding: 20 }}>
      <form onSubmit={handleSubmit} className="cc-card" style={{ width: 400, borderRadius: 16 }}>
        <h2 style={{ marginTop: 0 }}>Criar conta de eleitor</h2>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
          Não coletamos dados sobre sua opinião política ou intenção de voto.
        </p>

        <label className="cc-label">Nome completo</label>
        <input className="cc-input" required value={form.name} onChange={(e) => update('name', e.target.value)} style={{ marginBottom: 12 }} placeholder="Seu nome completo" />

        <label className="cc-label">Telefone (WhatsApp)</label>
        <input className="cc-input" required value={form.phone} onChange={(e) => update('phone', e.target.value)} style={{ marginBottom: 12 }} placeholder="(61) 99999-9999" />

        <label className="cc-label">E-mail (opcional)</label>
        <input className="cc-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} style={{ marginBottom: 12 }} placeholder="seu.email@exemplo.com" />

        <label className="cc-label">Senha</label>
        <input className="cc-input" type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} style={{ marginBottom: 12 }} placeholder="Mínimo 6 caracteres" />

        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', marginBottom: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.accepted_terms} onChange={(e) => update('accepted_terms', e.target.checked)} />
          <span>Li e aceito os Termos de Uso e a Política de Privacidade LGPD.</span>
        </label>

        {error && <div style={{ color: 'var(--cc-danger)', fontSize: '0.85rem', marginBottom: 12, padding: 10, background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        {success && <div style={{ color: '#166534', fontSize: '0.85rem', marginBottom: 12, padding: 10, background: '#f0fdf4', borderRadius: 8 }}>{success}</div>}

        <button className="cc-btn cc-btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
          {loading ? 'Cadastrando...' : 'Criar Conta Instantaneamente'}
        </button>

        <div style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center' }}>
          <Link to="/login">Já tenho conta</Link>
        </div>
      </form>
    </div>
  );
}
