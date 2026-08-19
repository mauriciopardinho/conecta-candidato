async function runFullMasterTestSuite() {
  console.log('========================================================================');
  console.log('🧪 SUITE COMPLETA DE TESTES AUTOMATIZADOS E2E — CONECTA CANDIDATO SAAS');
  console.log('========================================================================\n');

  const BASE_URL = 'http://localhost:3333/api';

  try {
    // TESTE 1: Login de Admin Válido & Token
    console.log('[TESTE 1] Autenticação de Admin (admin / Admin@123)...');
    const res1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'Admin@123' }),
    });

    const data1 = await res1.json();
    console.log(` -> Status HTTP: ${res1.status}`);
    console.log(` -> Token JWT: ${data1.token ? 'SIM' : 'NÃO'}`);
    console.log(` -> Usuário: ${data1.user?.username} (${data1.user?.role})`);

    if (res1.status !== 200 || !data1.token || data1.user?.role !== 'admin') {
      throw new Error('Falha no Teste 1: Autenticação de admin falhou.');
    }
    console.log(' ✅ TESTE 1 PASSOU!\n');

    const adminToken = data1.token;

    // TESTE 2: Centro de Comando Dashboard API
    console.log('[TESTE 2] Consulta de Dados do Centro de Comando (/admin/dashboard)...');
    const res2 = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data2 = await res2.json();
    console.log(` -> Status HTTP: ${res2.status}`);
    console.log(` -> Total de Apoiadores no DF: ${data2.totalRegistrations}`);
    console.log(` -> Taxa de Resolutividade: ${data2.resolutionRate}%`);
    console.log(` -> Atividades Recentes: ${data2.recentActivities?.length} itens`);

    if (res2.status !== 200 || data2.totalRegistrations === undefined) {
      throw new Error('Falha no Teste 2: Erro ao carregar Dashboard.');
    }
    console.log(' ✅ TESTE 2 PASSOU!\n');

    // TESTE 3: Login de Cabo Eleitoral & Operação Regional
    console.log('[TESTE 3] Autenticação de Cabo Eleitoral (cabo1 / Cabo@123)...');
    const res3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'cabo1', password: 'Cabo@123' }),
    });
    const data3 = await res3.json();
    const agentToken = data3.token;

    console.log(` -> Status HTTP: ${res3.status}`);
    console.log(` -> Cabo Autenticado: ${data3.user?.username} (${data3.user?.role})`);

    if (res3.status !== 200 || !agentToken || data3.user?.role !== 'field_agent') {
      throw new Error('Falha no Teste 3: Autenticação de cabo falhou.');
    }

    const res3b = await fetch(`${BASE_URL}/requests/agent`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    console.log(` -> Demandas da Região do Cabo: Status HTTP ${res3b.status}`);

    if (res3b.status !== 200) {
      throw new Error('Falha no Teste 3: Cabo não conseguiu carregar demandas da região.');
    }
    console.log(' ✅ TESTE 3 PASSOU!\n');

    // TESTE 4: Cadastro de Eleitor e Portabilidade LGPD
    console.log('[TESTE 4] Cadastro de Novo Eleitor & Teste de Portabilidade LGPD...');
    const testPhone = `+55 (61) 9${Math.floor(10000000 + Math.random() * 89999999)}`;
    const res4 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Eleitor Teste LGPD DF',
        phone: testPhone,
        password: 'Eleitor@123',
        accepted_terms: true,
      }),
    });
    const data4 = await res4.json();
    const voterToken = data4.token;
    console.log(` -> Status Cadastro: ${res4.status}`);

    const res4b = await fetch(`${BASE_URL}/auth/voter/me/export`, {
      headers: { Authorization: `Bearer ${voterToken}` },
    });
    const data4b = await res4b.json();
    console.log(` -> Portabilidade LGPD (Art. 18): ${data4b.lgpd_compliance ? 'CONFIRMADA' : 'FALHOU'}`);

    if (res4.status !== 201 || !data4b.lgpd_compliance) {
      throw new Error('Falha no Teste 4: Teste de portabilidade LGPD falhou.');
    }
    console.log(' ✅ TESTE 4 PASSOU!\n');

    // TESTE 5: Inteligência Operacional Forecast ML
    console.log('[TESTE 5] Consulta de Inteligência Operacional Preditiva (/ml/forecast)...');
    const res5 = await fetch(`${BASE_URL}/ml/forecast?target_count=5000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data5 = await res5.json();
    console.log(` -> Status HTTP: ${res5.status}`);
    console.log(` -> Média Diária Calculada: ${data5.dailyAverage} cadastros/dia`);
    console.log(` -> Dias Estimados para Conclusão: ${data5.estimatedDays} dias`);

    if (res5.status !== 200 || data5.dailyAverage === undefined) {
      throw new Error('Falha no Teste 5: Inteligência operacional preditiva falhou.');
    }
    console.log(' ✅ TESTE 5 PASSOU!\n');

    // TESTE 6: Proteção RBAC (Bloqueio de Eleitor Acessando Admin)
    console.log('[TESTE 6] Teste de Segurança RBAC (Eleitor tentando acessar /admin/dashboard)...');
    const res6 = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${voterToken}` },
    });
    console.log(` -> Status HTTP Retornado: ${res6.status}`);

    if (res6.status === 403) {
      console.log(' ✅ TESTE 6 PASSOU! (Acesso Negado 403 Conforme Esperado)\n');
    } else {
      throw new Error('Falha no Teste 6: Falha de segurança! Eleitor conseguiu acessar rota de admin.');
    }

    console.log('========================================================================');
    console.log('🎉 TODOS OS 6 TESTES DE ACEITAÇÃO PASSARAM COM 100% DE SUCESSO!');
    console.log('========================================================================');
  } catch (err) {
    console.error('❌ ERRO NO TESTE:', err.message);
    process.exit(1);
  }
}

runFullMasterTestSuite();
