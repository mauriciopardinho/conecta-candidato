import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const CATEGORIES = [
  ['saude', 'Saúde'], ['educacao', 'Educação'], ['seguranca', 'Segurança'],
  ['infraestrutura', 'Infraestrutura'], ['transporte', 'Transporte'], ['emprego', 'Emprego'],
  ['esporte', 'Esporte'], ['cultura', 'Cultura'], ['meio_ambiente', 'Meio Ambiente'], ['outras', 'Outras'],
];

export default function SuggestionsPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'outras' });
  const [message, setMessage] = useState('');

  function load() {
    api.get('/my-suggestions').then(({ data }) => setList(data));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/suggestions', form);
      setForm({ title: '', description: '', category: 'outras' });
      setMessage('Sugestão enviada com sucesso!');
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao enviar sugestão.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="cc-card">
        <h2>Envie sua sugestão</h2>
        <form onSubmit={handleSubmit}>
          <label className="cc-label">Título</label>
          <input className="cc-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 10 }} />
          <label className="cc-label">Descrição</label>
          <textarea className="cc-input" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 10 }} />
          <label className="cc-label">Categoria</label>
          <select className="cc-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ marginBottom: 12 }}>
            {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {message && <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)', marginBottom: 10 }}>{message}</p>}
          <button className="cc-btn cc-btn-primary" style={{ width: '100%' }}>Enviar sugestão</button>
        </form>
      </div>

      <div>
        <h3>Minhas sugestões</h3>
        {list.length === 0 && <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>Você ainda não enviou sugestões.</p>}
        {list.map((s) => (
          <div key={s.id} className="cc-card" style={{ marginBottom: 10 }}>
            <span className={`cc-badge cc-badge-${s.status}`}>{s.status.replace('_', ' ')}</span>
            <h4 style={{ marginTop: 8 }}>{s.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)' }}>{s.description}</p>
            {s.admin_response && <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Resposta: {s.admin_response}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
