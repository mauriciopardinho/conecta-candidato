const mlService = require('../services/mlService');

async function forecast(req, res) {
  try {
    const agentId = req.query.agentId || req.query.agent_id || null;
    const regionId = req.query.regionId || req.query.region_id || null;
    const targetCount = req.query.targetCount || req.query.target_count || null;
    const windowDays = req.query.windowDays || req.query.window_days || undefined;

    const result = await mlService.forecastProduction({
      agentId,
      regionId,
      targetCount: targetCount ? Number(targetCount) : null,
      windowDays: windowDays ? Number(windowDays) : undefined,
    });

    return res.json({
      dailyAverage: Math.round((result.dailyRate || 0) * 10) / 10,
      dailyRate: result.dailyRate || 0,
      cumulativeTotal: result.cumulativeTotal || 0,
      estimatedDays: result.estimatedDays,
      message: result.message,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao calcular previsão preditiva.' });
  }
}

async function anomalies(req, res) {
  try {
    const result = await mlService.detectAnomalies();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao calcular anomalias.' });
  }
}

async function demand(req, res) {
  try {
    const result = await mlService.forecastDemand();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao calcular projeção de demanda.' });
  }
}

module.exports = { forecast, anomalies, demand };
