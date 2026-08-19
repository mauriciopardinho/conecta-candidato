import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../services/AuthContext';

export default function PrivacyPage() {
  const { user } = useAuth();
  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleted, setDeleted] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.get('/auth/voter/me/export');
      setExportData(data);
      setMsg('Dados exportados com sucesso! Você pode baixar a cópia abaixo.');
    } catch (err) {
      setMsg('Erro ao exportar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja solicitar a anonimização e exclusão da sua conta? Esta ação é irreversível.')) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.delete('/auth/voter/me');
      setMsg(data.message);
      setDeleted(true);
      setTimeout(() => {
        localStorage.clear();
        window.location.hash = '#/login';
      }, 3000);
    } catch (err) {
      setMsg('Erro ao excluir conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--cc-text)' }}>🛡️ Central de Privacidade & Direitos LGPD</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
          Transparência total e controle sobre os seus dados pessoais (LGPD Lei nº 13.709/2018 Art. 18).
        </p>
      </div>

      {msg && (
        <div style={{ padding: 14, borderRadius: 12, background: deleted ? '#fee2e2' : '#e0f2fe', color: deleted ? '#991b1b' : '#075985', fontSize: '0.9rem' }}>
          {msg}
        </div>
      )}

      <div className="cc-card" style={{ borderRadius: 16, padding: 24 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>📋 Seus Dados Registrados</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--cc-text-muted)' }}>
          Abaixo estão as informações vinculadas à sua conta no sistema:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>ID do Titular:</strong> <code>{user?.id}</code></li>
          <li><strong>Telefone:</strong> {user?.phone || 'Não informado'}</li>
          <li><strong>Perfil:</strong> Eleitor Morador do DF</li>
          <li><strong>Status da Conta:</strong> Ativa (Consentimento LGPD confirmado)</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Card Exportação */}
        <div className="cc-card" style={{ borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>📥 Portabilidade de Dados (Art. 18 V)</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--cc-text-muted)', lineHeight: 1.4 }}>
            Baixe uma cópia completa em formato JSON contendo todo o seu histórico de cadastros, propostas e solicitações.
          </p>
          <button className="cc-btn cc-btn-primary" onClick={handleExport} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processando...' : 'Exportar Meus Dados (JSON)'}
          </button>
        </div>

        {/* Card Eliminação */}
        <div className="cc-card" style={{ borderRadius: 16, padding: 24, border: '1px solid #fca5a5' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--cc-danger)' }}>🗑️ Exclusão de Conta (Art. 18 VI)</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--cc-text-muted)', lineHeight: 1.4 }}>
            Solicite a anonimização irreversível dos seus dados pessoais da base da campanha a qualquer momento.
          </p>
          <button className="cc-btn" onClick={handleDelete} disabled={loading} style={{ width: '100%', background: 'var(--cc-danger)', color: '#fff' }}>
            {loading ? 'Processando...' : 'Excluir / Anonimizar Minha Conta'}
          </button>
        </div>
      </div>

      {exportData && (
        <div className="cc-card" style={{ borderRadius: 16, padding: 20, background: '#0f172a', color: '#38bdf8' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>📄 Resultado da Exportação Oficial LGPD:</h4>
          <pre style={{ overflowX: 'auto', fontSize: '0.8rem', background: '#1e293b', padding: 16, borderRadius: 8, color: '#f8fafc' }}>
            {JSON.stringify(exportData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
