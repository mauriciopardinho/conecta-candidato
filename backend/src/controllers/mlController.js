const mlService = require('../services/mlService');

async function forecast(req, res) {
  const { agentId, regionId, targetCount, windowDays } = req.query;
  const result = await mlService.forecastProduction({
    agentId: agentId || null,
    regionId: regionId || null,
    targetCount: targetCount ? Number(targetCount) : null,
    windowDays: windowDays ? Number(windowDays) : undefined,
  });
  return res.json(result);
}

async function anomalies(req, res) {
  const result = await mlService.detectAnomalies();
  return res.json(result);
}

async function demand(req, res) {
  const result = await mlService.forecastDemand();
  return res.json(result);
}

module.exports = { forecast, anomalies, demand };
