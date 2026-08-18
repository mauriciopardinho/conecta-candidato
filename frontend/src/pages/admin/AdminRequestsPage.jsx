import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminRequestsPage() {
  const [list, setList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.get('/requests/admin', { params }).then(({ data }) => setList(data));
  }
  useEffect(load, [statusFilter]);

  async function updateStatus(id, status) {
    await api.patch(`/requests/admin/${id}`, { status });
    load();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📝 Solicitações de Atuação por RA (DF)</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
          Demandas comunitárias de infraestrutura, iluminação, saúde e serviços públicos.
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
            Nenhuma solicitação encontrada para o filtro selecionado.
          </div>
        ) : (
          list.map((r) => (
            <div key={r.id} className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`cc-badge cc-badge-${r.status}`}>{r.status.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                    Prioridade: {r.priority}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)' }}>📍 {r.Region?.name || 'Distrito Federal'}</span>
              </div>
              <h4 style={{ margin: '8px 0 6px 0', fontSize: '1.1rem', color: 'var(--cc-text)' }}>{r.subject}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--cc-text-muted)', margin: '0 0 16px 0' }}>{r.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Atualizar Status:</span>
                <select className="cc-input" style={{ width: 180, fontSize: '0.85rem', padding: '8px 12px' }} value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
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
