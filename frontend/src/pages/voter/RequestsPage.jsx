import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function RequestsPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'media' });
  const [message, setMessage] = useState('');

  function load() {
    api.get('/my-requests').then(({ data }) => setList(data));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/requests', form);
      setForm({ subject: '', description: '', priority: 'media' });
      setMessage('Solicitação registrada com sucesso!');
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao enviar solicitação.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="cc-card">
        <h2>Solicitar atenção para minha região</h2>
        <form onSubmit={handleSubmit}>
          <label className="cc-label">Assunto</label>
          <input className="cc-input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ marginBottom: 10 }} />
          <label className="cc-label">Descrição do problema</label>
          <textarea className="cc-input" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 10 }} />
          <label className="cc-label">Prioridade</label>
          <select className="cc-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={{ marginBottom: 12 }}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
          {message && <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)', marginBottom: 10 }}>{message}</p>}
          <button className="cc-btn cc-btn-primary" style={{ width: '100%' }}>Enviar solicitação</button>
        </form>
      </div>

      <div>
        <h3>Minhas solicitações</h3>
        {list.length === 0 && <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>Nenhuma solicitação registrada.</p>}
        {list.map((r) => (
          <div key={r.id} className="cc-card" style={{ marginBottom: 10 }}>
            <span className={`cc-badge cc-badge-${r.status}`}>{r.status.replace('_', ' ')}</span>
            <h4 style={{ marginTop: 8 }}>{r.subject}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)' }}>{r.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
