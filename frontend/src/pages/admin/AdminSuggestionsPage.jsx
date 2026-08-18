import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminSuggestionsPage() {
  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.get('/suggestions/admin', { params }).then(({ data }) => setList(data));
  }
  useEffect(load, [statusFilter]);

  async function updateStatus(id, status) {
    await api.patch(`/suggestions/admin/${id}`, { status });
    load();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>💡 Sugestões dos Eleitores do DF</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
          Ideias e contribuições encaminhadas pelos eleitores sobre o plano de governo.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select className="cc-input" style={{ width: 220, fontSize: '0.9rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="recebida">Recebida</option>
          <option value="em_analise">Em análise</option>
          <option value="encaminhada">Encaminhada</option>
          <option value="respondida">Respondida</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length === 0 ? (
          <div className="cc-card" style={{ padding: 24, textAlign: 'center', color: 'var(--cc-text-muted)', borderRadius: 16 }}>
            Nenhuma sugestão encontrada para o filtro selecionado.
          </div>
        ) : (
          list.map((s) => (
            <div key={s.id} className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <span className={`cc-badge cc-badge-${s.status}`}>{s.status.replace('_', ' ')}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)' }}>📍 {s.Region?.name || 'Distrito Federal'}</span>
              </div>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '1.1rem', color: 'var(--cc-text)' }}>{s.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--cc-text-muted)', margin: '0 0 16px 0' }}>{s.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Atualizar Status:</span>
                <select className="cc-input" style={{ width: 180, fontSize: '0.85rem', padding: '8px 12px' }} value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)}>
                  <option value="recebida">Recebida</option>
                  <option value="em_analise">Em análise</option>
                  <option value="encaminhada">Encaminhada</option>
                  <option value="respondida">Respondida</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
