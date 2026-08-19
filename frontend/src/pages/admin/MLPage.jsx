import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MLPage() {
  const [regionId, setRegionId] = useState('');
  const [targetCount, setTargetCount] = useState(5000);
  const [forecast, setForecast] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [demand, setDemand] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/regions').then(({ data }) => setRegions(data));
    api.get('/ml/anomalies').then(({ data }) => setAnomalies(data));
    api.get('/ml/demand-forecast').then(({ data }) => setDemand(data));
  }, []);

  async function handleSimulate(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const url = regionId
        ? `/ml/forecast?region_id=${regionId}&target_count=${targetCount}`
        : `/ml/forecast?target_count=${targetCount}`;
      const { data } = await api.get(url);
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleSimulate();
  }, [regionId]);

  const progressPercent = forecast && forecast.cumulativeTotal
    ? Math.min(100, Math.round((forecast.cumulativeTotal / targetCount) * 100))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header com Posicionamento de Inteligencia Operacional */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.8rem' }}>🧠</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--cc-text)' }}>
              Inteligência Operacional & Previsão Agregada
            </h2>
            <p style={{ margin: '2px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
              Modelagem preditiva agregada de produtividade de campo, metas por RA e volumetria de solicitações comunitárias.
            </p>
          </div>
        </div>
      </div>

      {/* Aviso de Transparencia e LGPD */}
      <div style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.3rem' }}>🔒</span>
        <span>
          <strong>Privacidade por Design (LGPD):</strong> As análises preditivas são calculadas exclusivamente sobre dados operacionais e métricas territoriais agregadas das RAs do DF. Não é realizada nenhuma inferência ou perfilamento político individual.
        </span>
      </div>

      {/* SEÇÃO 1: SIMULADOR DE METAS PREDITIVAS */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--cc-border)' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--cc-text)' }}>
            🎯 Simulador Preditivo de Metas por Região Administrativa
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.88rem' }}>
            Defina uma meta de apoiadores e acompanhe a estimativa matemática de conclusão no ritmo atual da campanha.
          </p>
        </div>

        <form onSubmit={handleSimulate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'end', marginBottom: 20 }}>
          <div>
            <label className="cc-label">Região Administrativa (DF)</label>
            <select className="cc-input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              <option value="">Todas as RAs (Distrito Federal)</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="cc-label">Meta Desejada (Apoiadores)</label>
            <input
              type="number"
              className="cc-input"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              min="100"
              step="100"
            />
          </div>

          <button className="cc-btn cc-btn-primary" disabled={loading} style={{ height: 42 }}>
            {loading ? 'Calculando...' : 'Simular Projeção'}
          </button>
        </form>

        {forecast && (
          <div style={{ background: '#f1f5f9', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Média Diária Atual</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cc-navy)', marginTop: 4 }}>
                  {forecast.dailyAverage || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>cadastros/dia</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>Baseado nos últimos 30 dias</div>
              </div>

              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Acumulado Atual no DF</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                  {forecast.cumulativeTotal ? forecast.cumulativeTotal.toLocaleString('pt-BR') : 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>Registros validados na base</div>
              </div>

              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>
                <span>Progresso Preditivo da Meta</span>
                <span>{progressPercent}% atingido ({forecast.cumulativeTotal || 0} / {targetCount})</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
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
            📊 Monitor de Anomalias & Oscilações de Produção por RA
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
                      {isDrop ? `📉 ${a.changePercent}%` : `📈 +${a.changePercent}%`}
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
            📬 Projeção Preditiva de Demandas do Eleitorado no DF
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
