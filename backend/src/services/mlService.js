const { Op, fn, col, literal } = require('sequelize');
const { ProductionRecord, RequestModel, Region } = require('../models');

/**
 * MLService
 * ---------
 * Regras de escopo (fixas por design, não configuráveis):
 *  - Consome SOMENTE contagens agregadas de `production_records` e `requests`.
 *  - NUNCA recebe voter_id como parâmetro de entrada.
 *  - NUNCA produz um score, rótulo ou perfil associado a uma pessoa.
 *  - Toda saída é agregada por região e/ou por dia.
 *
 * Métodos estatísticos usados são deliberadamente simples e auditáveis
 * (regressão linear, médias móveis, z-score) — nada de modelos de caixa-preta
 * para uma aplicação onde a explicabilidade importa.
 */
class MLService {
  /** Regressão linear simples (mínimos quadrados) sobre pontos {x, y} */
  _linearRegression(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
    const denom = n * sumXX - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  }

  _mean(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  _stdDev(arr) {
    const m = this._mean(arr);
    const variance = this._mean(arr.map((v) => (v - m) ** 2));
    return Math.sqrt(variance);
  }

  /**
   * Previsão de produção: com base no ritmo diário recente (regressão
   * linear sobre os últimos `windowDays` dias), estima em quantos dias a
   * meta será atingida.
   */
  async forecastProduction({ agentId = null, regionId = null, targetCount, windowDays = 30 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const where = { record_date: { [Op.gte]: since.toISOString().slice(0, 10) } };
    if (agentId) where.agent_id = agentId;
    if (regionId) where.region_id = regionId;

    const rows = await ProductionRecord.findAll({
      where,
      attributes: ['record_date', [fn('SUM', col('registrations_count')), 'total']],
      group: ['record_date'],
      order: [['record_date', 'ASC']],
      raw: true,
    });

    if (rows.length === 0) {
      return { message: 'Sem histórico suficiente para gerar previsão.', dailyRate: 0 };
    }

    const points = rows.map((r, idx) => ({ x: idx, y: Number(r.total) }));
    const { slope } = this._linearRegression(points);
    const cumulativeTotal = points.reduce((s, p) => s + p.y, 0);
    const dailyRate = Math.max(slope, 0.01); // evita divisão por zero / ritmo negativo

    let message;
    let estimatedDays = null;

    if (targetCount && targetCount > cumulativeTotal) {
      const remaining = targetCount - cumulativeTotal;
      estimatedDays = Math.ceil(remaining / dailyRate);
      message = `Com base no ritmo atual (~${dailyRate.toFixed(1)} cadastros/dia), a equipe deverá atingir a meta em aproximadamente ${estimatedDays} dias.`;
    } else if (targetCount) {
      message = 'A meta informada já foi atingida no período analisado.';
      estimatedDays = 0;
    } else {
      message = `Ritmo atual estimado em ~${dailyRate.toFixed(1)} cadastros/dia.`;
    }

    return { dailyRate: Number(dailyRate.toFixed(2)), cumulativeTotal, estimatedDays, message };
  }

  /**
   * Detecção de anomalias por região: compara a produção dos últimos
   * `recentDays` dias com a média histórica (z-score), por região.
   */
  async detectAnomalies({ historyDays = 60, recentDays = 7, zThreshold = 1.5 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - historyDays);
    const recentSince = new Date();
    recentSince.setDate(recentSince.getDate() - recentDays);

    const regions = await Region.findAll({ raw: true });
    const results = [];

    for (const region of regions) {
      const history = await ProductionRecord.findAll({
        where: { region_id: region.id, record_date: { [Op.gte]: since.toISOString().slice(0, 10) } },
        attributes: ['record_date', [fn('SUM', col('registrations_count')), 'total']],
        group: ['record_date'],
        raw: true,
      });

      if (history.length < 5) continue; // histórico insuficiente para análise estatística

      const dailyTotals = history.map((h) => Number(h.total));
      const historicalMean = this._mean(dailyTotals);
      const historicalStdDev = this._stdDev(dailyTotals) || 1;

      const recent = history.filter((h) => h.record_date >= recentSince.toISOString().slice(0, 10));
      const recentMean = this._mean(recent.map((h) => Number(h.total)));

      const zScore = (recentMean - historicalMean) / historicalStdDev;
      const changePercent = historicalMean === 0 ? 0 : ((recentMean - historicalMean) / historicalMean) * 100;

      if (Math.abs(zScore) >= zThreshold) {
        const direction = changePercent < 0 ? 'caiu' : 'subiu';
        results.push({
          region: region.name,
          region_id: region.id,
          changePercent: Number(changePercent.toFixed(1)),
          zScore: Number(zScore.toFixed(2)),
          message: `Produção da região ${region.name} ${direction} ${Math.abs(changePercent).toFixed(0)}% em relação à média histórica.`,
        });
      }
    }

    return results;
  }

  /**
   * Previsão de demanda operacional: média móvel de solicitações
   * (`requests`) por região, para estimar volume futuro.
   */
  async forecastDemand({ windowDays = 30, projectionDays = 7 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const regions = await Region.findAll({ raw: true });
    const results = [];

    for (const region of regions) {
      const count = await RequestModel.count({
        where: { region_id: region.id, created_at: { [Op.gte]: since } },
      });
      const dailyAverage = count / windowDays;
      const projected = Math.round(dailyAverage * projectionDays);

      results.push({
        region: region.name,
        region_id: region.id,
        dailyAverage: Number(dailyAverage.toFixed(2)),
        projectedRequests: projected,
        message: `Estimativa de ~${projected} solicitações nos próximos ${projectionDays} dias em ${region.name}.`,
      });
    }

    return results;
  }
}

module.exports = new MLService();
