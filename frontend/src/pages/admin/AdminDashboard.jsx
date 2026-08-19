import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="cc-card" style={{ borderRadius: 16, padding: 18, borderLeft: color ? `4px solid ${color}` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--cc-text-muted)', fontWeight: 600 }}>{label}</div>
        {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '2rem', fontFamily: 'var(--cc-font-display)', color: 'var(--cc-navy)', marginTop: 4, fontWeight: 700 }}>
        {value}
      </div>
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

  if (!summary) return <p style={{ padding: 24, textAlign: 'center', color: 'var(--cc-text-muted)' }}>Carregando Centro de Comando Digital...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Top Banner do Centro de Comando */}
      <div style={{
        background: 'linear-gradient(135deg, var(--cc-navy) 0%, #0f172a 100%)',
        color: '#fff',
        borderRadius: 20,
        padding: '24px 28px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--cc-teal)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Centro de Comando Digital da Campanha DF
          </span>
          <h1 style={{ margin: '4px 0 0 0', fontSize: '1.8rem', color: '#fff', fontWeight: 700 }}>
            Painel Executivo da Candidatura
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Visão 360° da operação territorial, lideranças e demandas comunitárias no Distrito Federal.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/onboarding" className="cc-btn" style={{ background: 'var(--cc-teal)', color: '#fff', fontSize: '0.85rem' }}>
            ⚙️ Configurar Campanha
          </Link>
          <Link to="/pricing" className="cc-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem' }}>
            💎 Planos SaaS
          </Link>
        </div>
      </div>

      {/* Grid de Metricas Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard label="Apoiadores Cadastrados" value={summary.totalRegistrations} color="var(--cc-teal)" icon="👥" />
        <StatCard label="Cadastros Hoje" value={summary.todayRegistrations} color="#10b981" icon="⚡" />
        <StatCard label="Esta Semana" value={summary.weekRegistrations} color="#3b82f6" icon="📅" />
        <StatCard label="Este Mês" value={summary.monthRegistrations} color="#8b5cf6" icon="📊" />
        <StatCard label="Cabos Ativos" value={summary.activeAgents} color="#f59e0b" icon="📱" />
        <StatCard label="RAs Monitoradas" value={summary.regionsCount} color="#ec4899" icon="🗺️" />
        <StatCard label="Demandas Recebidas" value={summary.openRequests} color="#ef4444" icon="🛠️" />
        <StatCard label="Resolutividade LGPD" value={`${summary.resolutionRate || 0}%`} color="#10b981" icon="✅" />
      </div>

      {/* Grafico + Feed de Atividades Recentes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Grafico de Producao */}
        <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 16 }}>📈 Produção Diária de Campo (Últimos 30 dias)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="record_date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--cc-teal)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feed de Atividades Recentes (Audit Logs) */}
        <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📜 Atividades Recentes em Campo</h3>
            <Link to="/admin/auditoria" style={{ fontSize: '0.8rem', color: 'var(--cc-teal)', textDecoration: 'none', fontWeight: 600 }}>
              Ver Auditoria →
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {summary.recentActivities && summary.recentActivities.length > 0 ? (
              summary.recentActivities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cc-navy)' }}>{act.action.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted)' }}>Papel: {act.actor_role} • IP: {act.ip_address}</div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {new Date(act.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)' }}>Nenhuma atividade registrada recentemente.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
