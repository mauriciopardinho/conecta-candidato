import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '', region_id: '' });
  const [message, setMessage] = useState('');

  function load() {
    api.get('/admin/agents').then(({ data }) => setAgents(data));
    api.get('/admin/regions').then(({ data }) => setRegions(data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/admin/agents', form);
      setMessage('Cabo eleitoral criado com sucesso!');
      setForm({ name: '', phone: '', username: '', password: '', region_id: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao criar cabo eleitoral.');
    }
  }

  async function toggleStatus(agent) {
    await api.patch(`/admin/agents/${agent.id}`, { is_active: !agent.is_active });
    load();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>👥 Gestão de Cabos Eleitorais (DF)</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
          Cadastre novas lideranças e vincule às Regiões Administrativas do Distrito Federal.
        </p>
      </div>

      <div className="cc-card" style={{ maxWidth: 540, borderRadius: 16 }}>
        <h3 style={{ marginTop: 0, fontSize: '1.15rem' }}>➕ Criar Nova Liderança / Cabo</h3>
        <form onSubmit={handleCreate}>
          <label className="cc-label">Nome completo</label>
          <input className="cc-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} placeholder="Ex: João da Silva" />

          <label className="cc-label">Telefone (WhatsApp)</label>
          <input className="cc-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ marginBottom: 12 }} placeholder="(61) 99999-9999" />

          <label className="cc-label">Região Administrativa (DF)</label>
          <select className="cc-input" value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} style={{ marginBottom: 12 }}>
            <option value="">Selecione a RA</option>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <label className="cc-label">Usuário de login</label>
          <input className="cc-input" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} style={{ marginBottom: 12 }} placeholder="Ex: cabo_ceilandia" />

          <label className="cc-label">Senha</label>
          <input className="cc-input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ marginBottom: 16 }} placeholder="Mínimo 6 caracteres" />

          {message && <p style={{ fontSize: '0.85rem', color: message.includes('sucesso') ? '#166534' : 'var(--cc-danger)', marginBottom: 12, padding: 10, background: message.includes('sucesso') ? '#f0fdf4' : '#fef2f2', borderRadius: 8 }}>{message}</p>}

          <button className="cc-btn cc-btn-primary" style={{ width: '100%', padding: '12px' }}>Criar Cabo Eleitoral</button>
        </form>
      </div>

      <div className="cc-card" style={{ overflowX: 'auto', borderRadius: 16, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 14px' }}>Nome da Liderança</th>
              <th style={{ padding: '12px 14px' }}>Região Administrativa</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{a.full_name}</td>
                <td style={{ padding: '12px 14px', color: 'var(--cc-text-muted)' }}>📍 {a.Region?.name || '—'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`cc-badge ${a.is_active ? 'cc-badge-concluida' : 'cc-badge-recebida'}`}>{a.is_active ? 'ativo' : 'inativo'}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button className="cc-btn cc-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => toggleStatus(a)}>
                    {a.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
