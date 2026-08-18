import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    api.get('/admin/audit-logs').then(({ data }) => setLogs(data));
  }, []);

  // Mapeamento de traduções e badges de ações
  function getActionBadge(action) {
    switch (action) {
      case 'ACEITE_TERMOS_LGPD':
        return { label: 'LGPD / Privacidade', bg: '#dcfce7', color: '#15803d', icon: '🛡️', text: 'Aceite de Termos e Privacidade LGPD' };
      case 'CADASTRAR_ELEITOR_CAMPO':
        return { label: 'Cadastro de Campo', bg: '#dbeafe', color: '#1d4ed8', icon: '👥', text: 'Novo eleitor cadastrado por cabo eleitoral' };
      case 'LOGIN_ADMIN':
        return { label: 'Login Admin', bg: '#ffedd5', color: '#c2410c', icon: '🔐', text: 'Autenticação de Administrador no painel' };
      case 'LOGIN_CABO':
        return { label: 'Login Cabo', bg: '#fef9c3', color: '#a16207', icon: '📱', text: 'Autenticação de Cabo Eleitoral no app' };
      case 'CONSULTA_PAINEL_PREDITIVO':
        return { label: 'Inteligência IA', bg: '#f3e8ff', color: '#7e22ce', icon: '🧠', text: 'Consulta a relatórios preditivos de Machine Learning' };
      case 'CRIAR_CABO_ELEITORAL':
        return { label: 'Gestão de Cabos', bg: '#e0e7ff', color: '#4338ca', icon: '👤', text: 'Criação de nova liderança eleitoral de RA' };
      case 'EXPORTAR_RELATORIO_CAMPO':
        return { label: 'Relatório', bg: '#ccfbf1', color: '#0f766e', icon: '📊', text: 'Exportação de relatório consolidado' };
      default:
        return { label: action || 'Ação', bg: '#f1f5f9', color: '#475569', icon: '📝', text: action || 'Registro de sistema' };
    }
  }

  // Filtragem dos logs
  const filteredLogs = logs.filter((log) => {
    const badge = getActionBadge(log.action);
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (badge.text && badge.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actor_role && log.actor_role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_address && log.ip_address.includes(searchTerm));

    if (selectedFilter === 'LGPD') return matchesSearch && log.action === 'ACEITE_TERMOS_LGPD';
    if (selectedFilter === 'CAMPO') return matchesSearch && log.action === 'CADASTRAR_ELEITOR_CAMPO';
    if (selectedFilter === 'LOGIN') return matchesSearch && (log.action === 'LOGIN_ADMIN' || log.action === 'LOGIN_CABO');
    return matchesSearch;
  });

  const lgpdCount = logs.filter((l) => l.action === 'ACEITE_TERMOS_LGPD').length;
  const campoCount = logs.filter((l) => l.action === 'CADASTRAR_ELEITOR_CAMPO').length;
  const loginCount = logs.filter((l) => l.action === 'LOGIN_ADMIN' || l.action === 'LOGIN_CABO').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header com Contexto LGPD */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '2rem' }}>📜</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
              Logs de Auditoria & Conformidade LGPD
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '0.95rem' }}>
              Trilha de auditoria em tempo real, rastreabilidade de acessos e registro de consentimentos de privacidade no DF.
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="cc-card" style={{ padding: 18, borderRadius: 14 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total de Eventos</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: 'var(--cc-text)' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', marginTop: 2 }}>Registros gravados no banco</div>
        </div>

        <div className="cc-card" style={{ padding: 18, borderRadius: 14, borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '0.78rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 700 }}>Aceites LGPD</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: '#16a34a' }}>
            {lgpdCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', marginTop: 2 }}>Consentimentos gravados</div>
        </div>

        <div className="cc-card" style={{ padding: 18, borderRadius: 14, borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '0.78rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 700 }}>Ações de Campo</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: '#2563eb' }}>
            {campoCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', marginTop: 2 }}>Registros de apoiadores</div>
        </div>

        <div className="cc-card" style={{ padding: 18, borderRadius: 14, borderLeft: '4px solid #ea580c' }}>
          <span style={{ fontSize: '0.78rem', color: '#c2410c', textTransform: 'uppercase', fontWeight: 700 }}>Autenticações</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: '#ea580c' }}>
            {loginCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', marginTop: 2 }}>Logins no sistema</div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <input
            className="cc-input"
            style={{ maxWidth: 360, padding: '10px 14px', fontSize: '0.9rem' }}
            placeholder="🔍 Buscar por ação, perfil de usuário ou IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'Todos os Logs' },
              { id: 'LGPD', label: '🛡️ LGPD' },
              { id: 'CAMPO', label: '👥 Campo' },
              { id: 'LOGIN', label: '🔐 Logins' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  border: selectedFilter === f.id ? '2px solid #2563eb' : '1px solid var(--cc-border)',
                  background: selectedFilter === f.id ? '#eff6ff' : 'transparent',
                  color: selectedFilter === f.id ? '#1d4ed8' : 'var(--cc-text)',
                  fontWeight: selectedFilter === f.id ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela Formatada */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px' }}>Data e Hora</th>
                <th style={{ padding: '12px 14px' }}>Categoria de Evento</th>
                <th style={{ padding: '12px 14px' }}>Descrição Humana da Ação</th>
                <th style={{ padding: '12px 14px' }}>Perfil do Usuário</th>
                <th style={{ padding: '12px 14px' }}>Endereço IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--cc-text-muted)' }}>
                    Nenhum log de auditoria encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => {
                  const badge = getActionBadge(l.action);
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--cc-text)' }}>
                        {new Date(l.created_at || l.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: 'var(--cc-text)' }}>
                        {badge.text}
                      </td>
                      <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: 'var(--cc-text-muted)' }}>
                        {l.actor_role === 'admin' ? '⭐ Admin' : l.actor_role === 'field_agent' ? '📱 Cabo Eleitoral' : '👤 Eleitor'}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#64748b' }}>
                        {l.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
