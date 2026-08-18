import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/proposals').then(({ data }) => setProposals(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando propostas...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2>Propostas</h2>
      {proposals.length === 0 && <p style={{ color: 'var(--cc-text-muted)' }}>Nenhuma proposta publicada ainda.</p>}
      {proposals.map((p) => (
        <div key={p.id} className="cc-card">
          <span className="cc-badge cc-badge-recebida">{p.category}</span>
          <h3 style={{ marginTop: 8 }}>{p.title}</h3>
          <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
