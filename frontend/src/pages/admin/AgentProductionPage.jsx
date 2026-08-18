import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AgentProductionPage() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  function load() {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/production/by-agent', { params }).then(({ data }) => setRows(data));
  }

  useEffect(load, [statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📈 Produção por Cabo Eleitoral (DF)</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
          Desempenho diário, semanal e mensal das lideranças nas Regiões Administrativas.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select className="cc-input" style={{ width: 220, fontSize: '0.9rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="ativo">Apenas Ativos</option>
          <option value="inativo">Apenas Inativos</option>
        </select>
      </div>

      <div className="cc-card" style={{ overflowX: 'auto', borderRadius: 16, padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 14px' }}>Cabo / Liderança</th>
              <th style={{ padding: '12px 14px' }}>Região Administrativa</th>
              <th style={{ padding: '12px 14px' }}>Hoje</th>
              <th style={{ padding: '12px 14px' }}>Semana</th>
              <th style={{ padding: '12px 14px' }}>Mês</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.agent_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '12px 14px', color: 'var(--cc-text-muted)' }}>📍 {r.region || '—'}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>{r.today}</td>
                <td style={{ padding: '12px 14px' }}>{r.week}</td>
                <td style={{ padding: '12px 14px' }}>{r.month}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`cc-badge ${r.status === 'ativo' ? 'cc-badge-concluida' : 'cc-badge-recebida'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
