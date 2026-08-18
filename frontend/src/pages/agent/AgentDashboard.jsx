import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../services/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="cc-card" style={{ flex: '1 1 130px', padding: 16 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontFamily: 'var(--cc-font-display)', color: 'var(--cc-navy)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [regForm, setRegForm] = useState({ full_name: '', phone: '', has_consent: false, operational_note: '' });
  const [message, setMessage] = useState('');
  const { logout } = useAuth();

  function load() {
    api.get('/agent/production').then(({ data }) => setData(data));
  }

  useEffect(load, []);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage('');
    if (!regForm.has_consent) {
      setMessage('É obrigatório confirmar o consentimento antes de cadastrar o contato.');
      return;
    }
    try {
      await api.post('/agent/registrations', regForm);
      setMessage('Contato cadastrado com sucesso!');
      setRegForm({ full_name: '', phone: '', has_consent: false, operational_note: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao cadastrar contato.');
    }
  }

  if (!data) return <p style={{ padding: 24, textAlign: 'center' }}>Carregando dados de campo...</p>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cc-bg)' }}>
      <header style={{
        background: 'linear-gradient(135deg, var(--cc-navy), var(--cc-navy-dark))',
        color: '#fff',
        padding: '16px 20px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <strong style={{ fontFamily: 'var(--cc-font-display)', fontSize: '1.05rem', color: '#fff' }}>Conecta DF</strong>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Painel do Cabo Eleitoral</div>
        </div>
        <button onClick={logout} className="cc-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#dfe9f2', fontSize: '0.8rem', padding: '6px 12px' }}>
          Sair
        </button>
      </header>

      <div className="cc-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          <StatCard label="Hoje" value={data.production.today} />
          <StatCard label="Semana" value={data.production.week} />
          <StatCard label="Mês" value={data.production.month} />
          <StatCard label="Total" value={data.production.total} />
          {data.currentGoal && <StatCard label="Meta atual" value={data.currentGoal.target_count} />}
        </div>

        <div className="cc-card" style={{ borderRadius: 16 }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>📈 Histórico de Produção de Campo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.history}>
              <XAxis dataKey="record_date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#10a394" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="cc-card" style={{ borderRadius: 16 }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>📝 Cadastrar Novo Contato no DF</h3>
          <form onSubmit={handleRegister}>
            <label className="cc-label">Nome completo do apoiador</label>
            <input className="cc-input" required value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} style={{ marginBottom: 12 }} placeholder="Ex: Maria das Dores" />

            <label className="cc-label">Telefone (WhatsApp)</label>
            <input className="cc-input" required value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} style={{ marginBottom: 12 }} placeholder="(61) 99999-9999" />

            <label className="cc-label">Observação operacional</label>
            <input className="cc-input" value={regForm.operational_note} onChange={(e) => setRegForm({ ...regForm, operational_note: e.target.value })} style={{ marginBottom: 12 }} placeholder="Ex: Abordagem na feira de Ceilândia" />

            <label style={{ display: 'flex', gap: 8, fontSize: '0.85rem', marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={regForm.has_consent} onChange={(e) => setRegForm({ ...regForm, has_consent: e.target.checked })} />
              <span>Confirmo que obtive consentimento da pessoa para este cadastro (LGPD).</span>
            </label>

            {message && <p style={{ fontSize: '0.85rem', color: message.includes('sucesso') ? '#166534' : 'var(--cc-danger)', marginBottom: 12, padding: 10, background: message.includes('sucesso') ? '#f0fdf4' : '#fef2f2', borderRadius: 8 }}>{message}</p>}

            <button className="cc-btn cc-btn-primary" style={{ width: '100%', padding: '12px' }}>
              Cadastrar Contato de Campo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
