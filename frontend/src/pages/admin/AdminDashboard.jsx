import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

function StatCard({ label, value }) {
  return (
    <div className="cc-card">
      <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.9rem', fontFamily: 'var(--cc-font-display)', color: 'var(--cc-navy)' }}>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setSummary(data));
    api.get('/admin/production?days=30').then(({ data }) => setSeries(data));
  }, []);

  if (!summary) return <p>Carregando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2>Dashboard do Candidato</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Total de cadastros" value={summary.totalRegistrations} />
        <StatCard label="Hoje" value={summary.todayRegistrations} />
        <StatCard label="Esta semana" value={summary.weekRegistrations} />
        <StatCard label="Este mês" value={summary.monthRegistrations} />
        <StatCard label="Cabos ativos" value={summary.activeAgents} />
        <StatCard label="Regiões atendidas" value={summary.regionsCount} />
        <StatCard label="Solicitações abertas" value={summary.openRequests} />
        <StatCard label="Solicitações concluídas" value={summary.completedRequests} />
      </div>

      <div className="cc-card">
        <h3>Produção diária (últimos 30 dias)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--cc-border)" />
            <XAxis dataKey="record_date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#10a394" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
