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

// Regiões Administrativas (RAs) reais do Distrito Federal (Brasília - DF)
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

const PROPOSAL_CATEGORIES = ['Saúde', 'Educação', 'Infraestrutura', 'Segurança', 'Emprego', 'Mobilidade Urbana (DF)'];

const FICTIONAL_FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio', 'Gabriela', 'Hugo', 'Ivana', 'João', 'Lucas', 'Mariana', 'Pedro', 'Renata'];
const FICTIONAL_LAST_NAMES = ['Silva', 'Souza', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Ferreira', 'Santos'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function fakeName() {
  return `${randomFrom(FICTIONAL_FIRST_NAMES)} ${randomFrom(FICTIONAL_LAST_NAMES)} (DF)`;
}
function fakePhone() {
  return `+55 (61) 9${String(Math.floor(10000000 + Math.random() * 89999999))}`;
}
function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  await sequelize.sync({ force: true });
  logger.info('Banco recriado. Iniciando seed de dados do Distrito Federal (Brasília)...');

  // --- Regiões do DF ---
  const regions = await Region.bulkCreate(
    DF_REGIONS.map((r) => ({
      name: r.name,
      city: 'Brasília',
      state: 'DF',
      latitude: r.latitude,
      longitude: r.longitude,
      monthly_goal: r.monthly_goal,
    })),
    { returning: true }
  );

  // --- Administrador da Campanha ---
  const adminPasswordHash = await hashPassword('Admin@123');
  const adminUser = await User.create({
    role: 'admin',
    username: 'admin',
    email: 'admin@conectacandidato.df.br',
    phone: '+55 (61) 99999-0000',
    password_hash: adminPasswordHash,
    status: 'active',
    terms_accepted_at: new Date(),
  });
  logger.info(`Admin fictício da Campanha DF criado — usuário: admin / senha: Admin@123`);

  // --- Cabos Eleitorais por Região Administrativa (13 cabos) ---
  const agents = [];
  const caboPasswordHash = await hashPassword('Cabo@123');
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const user = await User.create({
      role: 'field_agent',
      username: `cabo${i + 1}`,
      phone: fakePhone(),
      password_hash: caboPasswordHash,
      status: 'active',
    });
    const agent = await FieldAgent.create({
      user_id: user.id,
      full_name: `${fakeName()} - Liderança ${region.name.split(' ')[0]}`,
      region_id: region.id,
      is_active: true,
      created_by_admin_id: adminUser.id,
    });
    agents.push(agent);
  }
  logger.info('Cabos eleitorais criados para as RAs do DF (usuário: cabo1..cabo13 / senha: Cabo@123)');

  // --- Propostas da Campanha DF ---
  const proposals = [];
  const sampleProposals = [
    { title: 'Ampliação do VLP eBRT até Samambaia e Ceilândia', category: 'Mobilidade Urbana (DF)', desc: 'Construção e ampliação de corredores exclusivos de transporte público interconectando Ceilândia, Taguatinga e Samambaia.' },
    { title: 'Reforço no Policiamento Ostensivo em Santa Maria e Recanto das Emas', category: 'Segurança', desc: 'Instalação de novas bases comunitárias de segurança e videomonitoramento de alta definição.' },
    { title: 'Modernização de UPA 24h e HRC em Ceilândia e Taguatinga', category: 'Saúde', desc: 'Reforma com ampliação de leitos e informatização do atendimento médico imediato.' },
    { title: 'Programa Jovem Aprendiz DF nas RAs de Baixa Renda', category: 'Emprego', desc: 'Parceria com o setor produtivo local para capacitação e primeiro emprego de jovens periféricos.' },
    { title: 'Asfaltamento e Drenagem Pluvial em Vicente Pires e Sol Nascente', category: 'Infraestrutura', desc: 'Obras prioritárias para eliminar alagamentos históricos e pavimentar vias de acesso.' },
    { title: 'Revitalização dos Parques Ecológicos do Plano Piloto e Águas Claras', category: 'Infraestrutura', desc: 'Iluminação LED, pistas de caminhada e espaço de lazer com acessibilidade.' },
  ];

  for (let i = 0; i < sampleProposals.length; i++) {
    const p = sampleProposals[i];
    const region = Math.random() > 0.4 ? randomFrom(regions) : null;
    const proposal = await Proposal.create({
      title: p.title,
      description: p.desc,
      category: p.category,
      region_id: region?.id || null,
      status: 'published',
      published_at: new Date(dateNDaysAgo(Math.floor(Math.random() * 45))),
    });
    proposals.push(proposal);
  }

  // --- Eleitores cadastrados (150) ---
  const voters = [];
  const eleitorPasswordHash = await hashPassword('Eleitor@123');
  for (let i = 1; i <= 120; i++) {
    const region = randomFrom(regions);
    const user = await User.create({
      role: 'voter',
      phone: fakePhone(),
      password_hash: eleitorPasswordHash,
      status: 'active',
      terms_accepted_at: new Date(dateNDaysAgo(Math.floor(Math.random() * 60))),
    });
    const voter = await Voter.create({
      user_id: user.id,
      full_name: fakeName(),
      region_id: region.id,
    });
    await ConsentRecord.create({
      subject_type: 'voter',
      subject_id: voter.id,
      consent_type: 'termos_e_privacidade',
      granted_at: new Date(dateNDaysAgo(Math.floor(Math.random() * 60))),
      evidence: 'Aceite digital com assinatura LGPD registrada no app',
    });
    voters.push(voter);
  }

  // --- 100 Registros de campo feitos pelos Cabos nas RAs ---
  for (let i = 1; i <= 100; i++) {
    const agent = randomFrom(agents);
    const region = regions.find((r) => r.id === agent.region_id) || randomFrom(regions);
    const consent = await ConsentRecord.create({
      subject_type: 'registration',
      subject_id: agent.id,
      consent_type: 'contato_cabo',
      granted_at: new Date(dateNDaysAgo(Math.floor(Math.random() * 60))),
      collected_by: agent.id,
      evidence: 'Consentimento presencial gravado em campo com confirmação SMS',
    });
    await Registration.create({
      full_name: fakeName(),
      phone: fakePhone(),
      region_id: region.id,
      registered_by_agent_id: agent.id,
      registration_date: dateNDaysAgo(Math.floor(Math.random() * 90)).slice(0, 10),
      operational_note: `Abordagem de campo realizada na feira / comércio local de ${region.name}.`,
      consent_id: consent.id,
      source: 'Abordagem Presencial de Campo',
    });
  }

  // --- Produção Histórica de 90 dias nas RAs do DF ---
  for (const agent of agents) {
    for (let d = 89; d >= 0; d--) {
      const base = 2 + Math.random() * 5;
      const isCeilandiaOrSamambaia = agent.region_id === regions[0].id || agent.region_id === regions[1].id;
      const boost = isCeilandiaOrSamambaia ? 3 : 0;
      const count = Math.max(1, Math.round(base + boost + (Math.random() > 0.85 ? -2 : 1)));
      await ProductionRecord.create({
        agent_id: agent.id,
        region_id: agent.region_id,
        record_date: dateNDaysAgo(d).slice(0, 10),
        registrations_count: count,
      });
    }
  }

  // --- Sugestões e Solicitações de Eleitores nas RAs ---
  const requestSubjects = [
    'Manutenção de iluminação pública na quadra principal',
    'Solicitação de reforma da praça comunitária e parquinho',
    'Melhoria nas linhas de ônibus em horários de pico',
    'Pedido de ronda escolar e sinalização perto da escola',
    'Tapa-buracos na avenida comercial',
  ];

  for (let i = 1; i <= 35; i++) {
    const voter = randomFrom(voters);
    await RequestModel.create({
      voter_id: voter.id,
      region_id: voter.region_id,
      subject: randomFrom(requestSubjects),
      description: 'Solicitação registrada por eleitor morador do DF referente a benfeitorias na sua Região Administrativa.',
      priority: randomFrom(['baixa', 'media', 'alta', 'urgente']),
      status: randomFrom(['recebida', 'em_analise', 'encaminhada', 'respondida', 'concluida']),
    });
  }

  // --- LOGS DE AUDITORIA REALISTAS (LGPD & Transparência) ---
  const auditLogsSample = [
    { action: 'ACEITE_TERMOS_LGPD', entity: 'ConsentRecord', actor_role: 'voter', ip_address: '177.135.22.10', metadata: JSON.stringify({ detalhe: 'Consentimento de tratamento de dados LGPD aceito pelo eleitor' }) },
    { action: 'CADASTRAR_ELEITOR_CAMPO', entity: 'Registration', actor_role: 'field_agent', ip_address: '177.182.45.89', metadata: JSON.stringify({ regiao: 'Ceilândia (RA IX)', origem: 'Abordagem Presencial' }) },
    { action: 'CADASTRAR_ELEITOR_CAMPO', entity: 'Registration', actor_role: 'field_agent', ip_address: '177.182.45.90', metadata: JSON.stringify({ regiao: 'Taguatinga (RA III)', origem: 'Abordagem Presencial' }) },
    { action: 'LOGIN_ADMIN', entity: 'User', actor_role: 'admin', ip_address: '200.142.10.5', metadata: JSON.stringify({ usuario: 'admin', navegador: 'Chrome / Windows DF' }) },
    { action: 'CONSULTA_PAINEL_PREDITIVO', entity: 'MLModel', actor_role: 'admin', ip_address: '200.142.10.5', metadata: JSON.stringify({ modulo: 'Machine Learning Preditivo DF' }) },
    { action: 'CRIAR_CABO_ELEITORAL', entity: 'FieldAgent', actor_role: 'admin', ip_address: '200.142.10.5', metadata: JSON.stringify({ regiao: 'Samambaia (RA XII)' }) },
    { action: 'ACEITE_TERMOS_LGPD', entity: 'ConsentRecord', actor_role: 'voter', ip_address: '189.6.11.44', metadata: JSON.stringify({ detalhe: 'Consentimento digital confirmado via SMS' }) },
    { action: 'ATUALIZAR_STATUS_SOLICITACAO', entity: 'RequestModel', actor_role: 'admin', ip_address: '200.142.10.5', metadata: JSON.stringify({ novo_status: 'em_analise', regiao: 'Gama (RA II)' }) },
    { action: 'EXPORTAR_RELATORIO_CAMPO', entity: 'ProductionRecord', actor_role: 'admin', ip_address: '200.142.10.5', metadata: JSON.stringify({ formato: 'PDF', periodo: 'Ultimos 30 dias' }) },
    { action: 'LOGIN_CABO', entity: 'User', actor_role: 'field_agent', ip_address: '177.135.88.12', metadata: JSON.stringify({ usuario: 'cabo1' }) },
  ];

  for (let i = 0; i < 40; i++) {
    const sample = randomFrom(auditLogsSample);
    const nDays = Math.floor(Math.random() * 30);
    await AuditLog.create({
      actor_role: sample.actor_role,
      action: sample.action,
      entity: sample.entity,
      ip_address: sample.ip_address,
      metadata: sample.metadata,
      created_at: dateNDaysAgo(nDays),
    });
  }

  logger.info('✅ Seed concluído com sucesso! Banco populado com RAs do Distrito Federal e Logs de Auditoria.');
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
