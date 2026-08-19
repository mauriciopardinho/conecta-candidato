import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../services/AuthContext';

function StatCard({ label, value, subtext }) {
  return (
    <div className="cc-card" style={{ flex: '1 1 120px', padding: 14, borderRadius: 14 }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--cc-text-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontFamily: 'var(--cc-font-display)', color: 'var(--cc-navy)', marginTop: 2 }}>{value}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('cadastro'); // 'cadastro', 'demandas', 'historico'
  const [data, setData] = useState(null);
  const [agentRequests, setAgentRequests] = useState([]);
  const [regForm, setRegForm] = useState({ full_name: '', phone: '', has_consent: false, operational_note: '' });
  const [message, setMessage] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(false);
  const { logout } = useAuth();

  function loadData() {
    api.get('/agent/production').then(({ data }) => setData(data));
  }

  function loadRequests() {
    setLoadingRequests(true);
    api.get('/requests/agent')
      .then(({ data }) => setAgentRequests(data))
      .catch(() => setAgentRequests([]))
      .finally(() => setLoadingRequests(false));
  }

  useEffect(() => {
    loadData();
    loadRequests();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage('');
    if (!regForm.has_consent) {
      setMessage('É obrigatório confirmar o consentimento LGPD do eleitor antes de salvar.');
      return;
    }
    try {
      await api.post('/agent/registrations', regForm);
      setMessage('Apoiador cadastrado com sucesso!');
      setRegForm({ full_name: '', phone: '', has_consent: false, operational_note: '' });
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao cadastrar contato.');
    }
  }

  async function handleUpdateRequestStatus(id, newStatus) {
    try {
      await api.patch(`/requests/agent/${id}`, { status: newStatus });
      loadRequests();
    } catch (err) {
      alert('Erro ao atualizar demanda.');
    }
  }

  if (!data) return <p style={{ padding: 24, textAlign: 'center', color: 'var(--cc-text-muted)' }}>Carregando Minha Operação...</p>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cc-bg)' }}>
      {/* Top Header Mobile */}
      <header style={{
        background: 'linear-gradient(135deg, var(--cc-navy), var(--cc-navy-dark))',
        color: '#fff',
        padding: '16px 20px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <strong style={{ fontFamily: 'var(--cc-font-display)', fontSize: '1.1rem', color: '#fff' }}>MINHA OPERAÇÃO</strong>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Liderança de Campo DF</div>
        </div>
        <button onClick={logout} className="cc-btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#dfe9f2', fontSize: '0.8rem', padding: '6px 14px' }}>
          Sair
        </button>
      </header>

      <div className="cc-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 750, margin: '0 auto' }}>
        
        {/* Metricas Pessoais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          <StatCard label="Hoje" value={data.production.today} subtext="Contatos" />
          <StatCard label="Semana" value={data.production.week} />
          <StatCard label="Mês" value={data.production.month} />
          <StatCard label="Total" value={data.production.total} />
        </div>

        {/* Acoes Rapidas Mobile Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 12, padding: 4, gap: 4 }}>
          <button
            onClick={() => setActiveTab('cadastro')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'cadastro' ? '#fff' : 'transparent',
              color: activeTab === 'cadastro' ? 'var(--cc-navy)' : 'var(--cc-text-muted)',
              boxShadow: activeTab === 'cadastro' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            ➕ Novo Contato
          </button>
          <button
            onClick={() => setActiveTab('demandas')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'demandas' ? '#fff' : 'transparent',
              color: activeTab === 'demandas' ? 'var(--cc-navy)' : 'var(--cc-text-muted)',
              boxShadow: activeTab === 'demandas' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            🛠️ Demandas ({agentRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'historico' ? '#fff' : 'transparent',
              color: activeTab === 'historico' ? 'var(--cc-navy)' : 'var(--cc-text-muted)',
              boxShadow: activeTab === 'historico' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            📈 Produção
          </button>
        </div>

        {/* Tab 1: Formulario de Cadastro */}
        {activeTab === 'cadastro' && (
          <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 12 }}>📝 Registrar Novo Apoiador de Campo</h3>
            <form onSubmit={handleRegister}>
              <label className="cc-label">Nome Completo do Apoiador</label>
              <input
                className="cc-input"
                required
                value={regForm.full_name}
                onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                style={{ marginBottom: 12 }}
                placeholder="Ex: Ana Maria da Silva"
              />

              <label className="cc-label">Telefone WhatsApp (61)</label>
              <input
                className="cc-input"
                required
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                style={{ marginBottom: 12 }}
                placeholder="+55 (61) 99999-9999"
              />

              <label className="cc-label">Observação Operacional / Local de Abordagem</label>
              <input
                className="cc-input"
                value={regForm.operational_note}
                onChange={(e) => setRegForm({ ...regForm, operational_note: e.target.value })}
                style={{ marginBottom: 12 }}
                placeholder="Ex: Abordagem na feira comunitária de Ceilândia"
              />

              <label style={{ display: 'flex', gap: 10, fontSize: '0.85rem', marginBottom: 16, cursor: 'pointer', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={regForm.has_consent}
                  onChange={(e) => setRegForm({ ...regForm, has_consent: e.target.checked })}
                />
                <span>Obtive o consentimento do eleitor conforme a LGPD.</span>
              </label>

              {message && (
                <p style={{
                  fontSize: '0.85rem',
                  color: message.includes('sucesso') ? '#166534' : 'var(--cc-danger)',
                  marginBottom: 12,
                  padding: 10,
                  background: message.includes('sucesso') ? '#f0fdf4' : '#fef2f2',
                  borderRadius: 8
                }}>
                  {message}
                </p>
              )}

              <button className="cc-btn cc-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                Confirmar Cadastro de Campo
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Demandas da Regiao */}
        {activeTab === 'demandas' && (
          <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 14 }}>🛠️ Atendimento de Demandas da Sua Região</h3>
            
            {loadingRequests ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--cc-text-muted)' }}>Carregando demandas comunitárias...</p>
            ) : agentRequests.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--cc-text-muted)' }}>Nenhuma demanda comunitária registrada nesta região no momento.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {agentRequests.map((req) => (
                  <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ fontSize: '0.95rem' }}>{req.subject}</strong>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: req.status === 'concluida' ? '#dcfce7' : req.status === 'em_analise' ? '#fef3c7' : '#e0f2fe',
                        color: req.status === 'concluida' ? '#166534' : req.status === 'em_analise' ? '#92400e' : '#075985',
                        fontWeight: 600,
                      }}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--cc-text-muted)', margin: '0 0 10px 0' }}>{req.description}</p>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      {req.status !== 'em_analise' && req.status !== 'concluida' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'em_analise')}
                          className="cc-btn"
                          style={{ fontSize: '0.78rem', background: '#f59e0b', color: '#fff', padding: '4px 10px' }}
                        >
                          Assumir Atendimento
                        </button>
                      )}
                      {req.status !== 'concluida' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'concluida')}
                          className="cc-btn"
                          style={{ fontSize: '0.78rem', background: '#10b981', color: '#fff', padding: '4px 10px' }}
                        >
                          Marcar Resolvida
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Historico de Producao */}
        {activeTab === 'historico' && (
          <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: 14 }}>📈 Histórico de Registros de Campo</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.history}>
                <XAxis dataKey="record_date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#10a394" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}
