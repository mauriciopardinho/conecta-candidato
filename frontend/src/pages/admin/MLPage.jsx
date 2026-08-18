import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MLPage() {
  const [forecast, setForecast] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [demand, setDemand] = useState([]);
  const [targetCount, setTargetCount] = useState(3000);
  const [loadingForecast, setLoadingForecast] = useState(false);

  function loadForecast(target) {
    const val = target || targetCount;
    setLoadingForecast(true);
    api.get('/ml/forecast', { params: { targetCount: val } })
      .then(({ data }) => setForecast(data))
      .finally(() => setLoadingForecast(false));
  }

  useEffect(() => {
    loadForecast(3000);
    api.get('/ml/anomalies').then(({ data }) => setAnomalies(data));
    api.get('/ml/demand').then(({ data }) => setDemand(data));
  }, []);

  const progressPercent = forecast && forecast.cumulativeTotal && targetCount
    ? Math.min(100, Math.round((forecast.cumulativeTotal / targetCount) * 100))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Header com Contexto Político DF */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '2rem' }}>🧠</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
              Machine Learning & Inteligência Preditiva (Distrito Federal)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
              Projeções estatísticas de produção de campo, detecção de anomalias por RA e análise de demandas eleitorais.
            </p>
          </div>
        </div>

        <div style={{
          marginTop: 12,
          padding: '10px 16px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '8px',
          borderLeft: '4px solid #38bdf8',
          fontSize: '0.85rem',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span>🛡️</span>
          <span>
            <strong>Conformidade e LGPD:</strong> Este módulo trabalha estritamente com modelos estatísticos agregados por Região Administrativa (RAs do DF). Não realiza perfilamento individual nem rastreamento de dados pessoais.
          </span>
        </div>
      </div>

      {/* SEÇÃO 1: SIMULADOR DE METAS PREDITIVAS */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--cc-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cc-text)' }}>
              🎯 Simulador de Meta da Campanha no DF
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
              Estime em quantos dias a equipe atingirá o número necessário de eleitores apoiadores.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Meta de Cadastros:</span>
            <input
              className="cc-input"
              style={{ width: 140, fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
            />
            <button
              className="cc-btn cc-btn-primary"
              onClick={() => loadForecast()}
              disabled={loadingForecast}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {loadingForecast ? 'Calculando...' : '🔄 Recalcular'}
            </button>
          </div>
        </div>

        {/* Botões Rápidos de Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[1000, 3000, 5000, 10000, 15000].map((val) => (
            <button
              key={val}
              onClick={() => { setTargetCount(val); loadForecast(val); }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: targetCount === val ? '2px solid #2563eb' : '1px solid var(--cc-border)',
                background: targetCount === val ? '#eff6ff' : 'transparent',
                color: targetCount === val ? '#1d4ed8' : 'var(--cc-text)',
                fontWeight: targetCount === val ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {val.toLocaleString('pt-BR')} apoiadores
            </button>
          ))}
        </div>

        {/* Métricas Visuais */}
        {forecast && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Ritmo de Campo Atual</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  ~{forecast.dailyRate} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>cadastros/dia</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>Calculado via Regressão Linear (30 dias)</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Acumulado Atual no DF</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                  {forecast.cumulativeTotal ? forecast.cumulativeTotal.toLocaleString('pt-BR') : 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>Registros validados na base</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Estimativa de Conclusão</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: forecast.estimatedDays > 30 ? '#d97706' : '#16a34a', marginTop: 4 }}>
                  {forecast.estimatedDays !== null ? `${forecast.estimatedDays} dias` : 'Concluído'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  {forecast.estimatedDays !== null ? `Aproximadamente ${(forecast.estimatedDays / 30).toFixed(1)} meses de trabalho` : 'Meta já atingida!'}
                </div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                <span>Progresso Preditivo da Meta</span>
                <span>{progressPercent}% atingido ({forecast.cumulativeTotal || 0} / {targetCount})</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.5s ease-in-out'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO 2: DETECÇÃO DE ANOMALIAS POR REGIAO ADMINISTRATIVA */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--cc-border)' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cc-text)' }}>
            ⚠️ Monitor de Anomalias & Oscilações de Produção por RA
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
            Compara a produção da última semana com o histórico da RA (algoritmo Z-score estatístico).
          </p>
        </div>

        {anomalies.length === 0 ? (
          <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9rem' }}>
            ✅ <strong>Produção Estável no DF:</strong> Nenhuma anomalia crítica ou queda de produção atípica foi detectada nas Regiões Administrativas nos últimos 7 dias.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {anomalies.map((a) => {
              const isDrop = a.changePercent < 0;
              return (
                <div key={a.region_id || a.region} style={{
                  padding: 16,
                  borderRadius: 12,
                  background: isDrop ? '#fef2f2' : '#f0fdf4',
                  border: isDrop ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: isDrop ? '#991b1b' : '#166534' }}>
                      {a.region}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: isDrop ? '#ef4444' : '#10b981',
                      color: '#ffffff'
                    }}>
                      {isDrop ? `🔻 ${a.changePercent}%` : `🔺 +${a.changePercent}%`}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: isDrop ? '#7f1d1d' : '#14532d' }}>
                    {a.message}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cc-text-muted)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6, marginTop: 4 }}>
                    <strong>Recomendação da IA:</strong> {isDrop ? 'Visitar liderança da RA e reforçar atuação dos cabos.' : 'Manter o ritmo e ampliar abordagens no comércio da região.'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: PREVISÃO DE DEMANDA OPERACIONAL */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--cc-border)' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cc-text)' }}>
            📊 Projeção Preditiva de Demandas do Eleitorado no DF
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
            Estimativa de volume de solicitações (saúde, iluminação, asfalto) para os próximos 7 dias por RA.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Região Administrativa (DF)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Média Diária</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Projeção (7 Dias)</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Pauta de Campanha Sugerida</th>
              </tr>
            </thead>
            <tbody>
              {demand.map((d) => (
                <tr key={d.region_id || d.region} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--cc-text)' }}>
                    📍 {d.region}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--cc-text-muted)' }}>
                    ~{d.dailyAverage} solicitações/dia
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 700,
                      borderRadius: 6,
                      fontSize: '0.85rem'
                    }}>
                      {d.projectedRequests} novos pedidos
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.84rem', color: '#475569' }}>
                    💡 Reunião de pauta de infraestrutura e serviços públicos
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
