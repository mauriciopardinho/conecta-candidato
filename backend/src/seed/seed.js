require('dotenv').config();
const {
  sequelize,
  User,
  Region,
  Voter,
  FieldAgent,
  Proposal,
  Suggestion,
  RequestModel,
  Registration,
  ProductionRecord,
  ConsentRecord,
  AuditLog,
} = require('../models');
const { hashPassword } = require('../utils/crypto');
const logger = require('../utils/logger');

const DF_REGIONS = [
  { name: 'Ceilândia (RA IX)', latitude: -15.8209, longitude: -48.1078, monthly_goal: 600 },
  { name: 'Samambaia (RA XII)', latitude: -15.8756, longitude: -48.0856, monthly_goal: 500 },
  { name: 'Taguatinga (RA III)', latitude: -15.8333, longitude: -48.0567, monthly_goal: 450 },
  { name: 'Plano Piloto - Brasília (RA I)', latitude: -15.7942, longitude: -47.8822, monthly_goal: 400 },
  { name: 'Águas Claras (RA XX)', latitude: -15.8381, longitude: -48.0289, monthly_goal: 350 },
  { name: 'Guará (RA X)', latitude: -15.8242, longitude: -47.9781, monthly_goal: 300 },
  { name: 'Gama (RA II)', latitude: -16.0150, longitude: -48.0678, monthly_goal: 350 },
  { name: 'Santa Maria (RA XIII)', latitude: -16.0153, longitude: -47.9867, monthly_goal: 300 },
  { name: 'Recanto das Emas (RA XV)', latitude: -15.9056, longitude: -48.0639, monthly_goal: 300 },
  { name: 'Sobradinho (RA V)', latitude: -15.6517, longitude: -47.7917, monthly_goal: 250 },
  { name: 'Planaltina (RA VI)', latitude: -15.6178, longitude: -47.6522, monthly_goal: 300 },
  { name: 'Vicente Pires (RA XXX)', latitude: -15.8075, longitude: -48.0236, monthly_goal: 250 },
  { name: 'São Sebastião (RA XIV)', latitude: -15.9083, longitude: -47.7719, monthly_goal: 250 },
];

const GROCERY_CATEGORIES = ['Mercearia', 'Carnes & Aves', 'Hortifrúti', 'Laticínios', 'Limpeza', 'Bebidas'];
const FICTIONAL_FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Hugo', 'Ivana', 'João', 'Lucas', 'Mariana', 'Pedro', 'Renata'];
const FICTIONAL_LAST_NAMES = ['Silva', 'Souza', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Ferreira', 'Santos'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(idx) {
  const n = String(idx).padStart(4, '0');
  return `+55 (61) 9983${n}`;
}

async function runSeed() {
  logger.info('Iniciando carga de dados de demonstração do Mercado IA DF...');

  await sequelize.sync({ force: true });

  const createdRegions = [];
  for (const r of DF_REGIONS) {
    const region = await Region.create(r);
    createdRegions.push(region);
  }
  logger.info(`Criadas ${createdRegions.length} Regiões Administrativas do DF.`);

  // 1. Usuário Administrador (Gestor Mercado IA DF)
  const adminPasswordHash = await hashPassword('Admin@123');
  const adminUser = await User.create({
    phone: '+55 (61) 99999-0001',
    email: 'admin@mercadoiadf.com.br',
    username: 'admin',
    password_hash: adminPasswordHash,
    role: 'admin',
    status: 'active',
  });
  logger.info('Usuário Admin do Mercado IA DF criado: admin / Admin@123');

  // 2. Caçadores de Ofertas de Bairro (1 por RA)
  const agentPasswordHash = await hashPassword('Cabo@123');
  const createdAgents = [];
  for (let i = 0; i < createdRegions.length; i++) {
    const region = createdRegions[i];
    const username = `cabo${i + 1}`;
    const user = await User.create({
      phone: `+55 (61) 98888-00${String(i + 1).padStart(2, '0')}`,
      email: `${username}@mercadoiadf.com.br`,
      username,
      password_hash: agentPasswordHash,
      role: 'field_agent',
      status: 'active',
    });

    const agent = await FieldAgent.create({
      user_id: user.id,
      region_id: region.id,
      full_name: `Caçador de Ofertas ${i + 1} (${region.name.split(' ')[0]})`,
      whatsapp: user.phone,
      is_active: true,
    });
    createdAgents.push({ agent, user, region });
  }
  logger.info(`Criados ${createdAgents.length} Caçadores de Ofertas de Bairro (cabo1..cabo13 / Cabo@123).`);

  // 3. Ofertas e Dicas de Economia da Comunidade
  const sampleOffers = [
    { title: 'Arroz Tipo 1 5kg — Menor Preço no Atacadão', cat: 'Mercearia', desc: 'Saco de 5kg por R$ 18,90 no Atacadão de Ceilândia. Validade registrada por nota emitida há 20 min.' },
    { title: 'Peito de Frango R$ 11,90/kg no Assaí', cat: 'Carnes & Aves', desc: 'Oferta imbatível de Peito de Frango no Assaí de Taguatinga. Economia líquida estimada em R$ 34,00 para a feira familiar.' },
    { title: 'Leite Integral R$ 3,89 no Carrefour', cat: 'Laticínios', desc: 'Caixa de leite por R$ 3,89 no Carrefour Asa Norte (Plano Piloto). Melhor valor apurado hoje.' },
    { title: 'Óleo de Soja 900ml R$ 4,99 no Dona de Casa', cat: 'Mercearia', desc: 'Óleo de soja com desconto em Águas Claras. Economia calculada de R$ 2,50 por unidade.' },
  ];

  for (const offer of sampleOffers) {
    await Proposal.create({
      title: offer.title,
      category: offer.cat,
      description: offer.desc,
      expected_impact: 'Alta Economia no Orçamento Familiar',
      estimated_cost: null,
      status: 'publicada',
    });
  }

  // 4. Consumidores Cadastrados e Registros de Compras no DF
  const voterPasswordHash = await hashPassword('Eleitor@123');
  let totalRegistrationsCount = 0;

  const createdVoters = [];
  for (let i = 1; i <= 100; i++) {
    const region = randomFrom(createdRegions);
    const agentObj = createdAgents.find((a) => a.region.id === region.id) || createdAgents[0];
    const firstName = randomFrom(FICTIONAL_FIRST_NAMES);
    const lastName = randomFrom(FICTIONAL_LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const phone = randomPhone(i);

    const user = await User.create({
      phone,
      email: null,
      username: null,
      password_hash: voterPasswordHash,
      role: 'voter',
      status: 'active',
    });

    const voter = await Voter.create({
      user_id: user.id,
      region_id: region.id,
      full_name: fullName,
      phone,
      whatsapp_verified: true,
      notes: 'Consumidor cadastrado no programa de economia do bairro',
    });
    createdVoters.push(voter);

    await ConsentRecord.create({
      subject_type: 'voter',
      subject_id: voter.id,
      consent_type: 'lgpd_terms_v1',
      granted_at: new Date(),
      ip_address: '127.0.0.1',
      user_agent: 'SeedScript/1.0',
      metadata: JSON.stringify({ accepted: true, purpose: 'pesquisa_precos_mercado_df' }),
    });

    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const regDateStr = d.toISOString().slice(0, 10);

    await Registration.create({
      voter_id: voter.id,
      registered_by_agent_id: agentObj.agent.id,
      region_id: region.id,
      full_name: fullName,
      phone,
      registration_date: regDateStr,
    });
    totalRegistrationsCount++;
  }

  // 5. Alertas de Preço Incorreto (Demandas de Correção com PIX/Cashback)
  const sampleAlerts = [
    { sub: 'Preço do Feijão Carioca diferente na prateleira', desc: 'No sistema marca R$ 6,90 mas na gôndola está R$ 8,50. Enviado foto do encarte.', prio: 'alta', cat: 'Mercearia' },
    { sub: 'Promoção de Óleo de Soja encerrada antes do prazo', desc: 'Atacadão informou término de estoque de óleo em Ceilândia.', prio: 'media', cat: 'Mercearia' },
    { sub: 'Preço da Carne Moída divergente em Taguatinga', desc: 'Na nota registrou R$ 24,90/kg mas na etiqueta constava R$ 21,90.', prio: 'alta', cat: 'Carnes & Aves' },
  ];

  for (let i = 0; i < sampleAlerts.length; i++) {
    const alert = sampleAlerts[i];
    const region = createdRegions[i % createdRegions.length];
    const voter = createdVoters[i % createdVoters.length];
    await RequestModel.create({
      voter_id: voter.id,
      region_id: region.id,
      subject: alert.sub,
      description: alert.desc,
      priority: alert.prio,
      category: alert.cat,
      status: i === 0 ? 'recebida' : i === 1 ? 'em_analise' : 'concluida',
    });
  }

  // 6. Registros de Produção Diária de Preços por Agente (Últimos 30 dias)
  const today = new Date();
  for (const { agent, region } of createdAgents) {
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      const count = Math.floor(Math.random() * 4) + 1;

      await ProductionRecord.create({
        agent_id: agent.id,
        region_id: region.id,
        record_date: dateStr,
        registrations_count: count,
      });
    }
  }

  // 7. Audit Log de Inicialização
  await AuditLog.create({
    actor_role: 'system',
    action: 'SEED_INITIALIZATION',
    entity: 'Database',
    ip_address: '127.0.0.1',
    metadata: JSON.stringify({ message: 'Base do Mercado IA DF semeada com sucesso com dados do DF.' }),
  });

  logger.info(`Concluído! ${totalRegistrationsCount} registros de preços criados.`);
}

if (require.main === module) {
  runSeed()
    .then(() => {
      logger.info('Seed concluído com sucesso.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Erro no seed:', err);
      process.exit(1);
    });
}

module.exports = { runSeed };
