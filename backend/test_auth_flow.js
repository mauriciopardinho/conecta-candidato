async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('🧪 SUITE DE TESTES AUTOMATIZADOS E2E DE AUTENTICACAO');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3333/api';

  try {
    // TESTE 1: Login de Admin Valido
    console.log('[TESTE 1] Tentando login com usuario administrativo valido (admin / Admin@123)...');
    const res1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'Admin@123' }),
    });

    const data1 = await res1.json();
    console.log(` -> Status HTTP: ${res1.status}`);
    console.log(` -> Token recebido: ${data1.token ? 'SIM (Formato JWT ' + data1.token.slice(0, 20) + '...)' : 'NAO'}`);
    console.log(` -> Usuario: ${JSON.stringify(data1.user)}`);

    if (res1.status === 200 && data1.token && data1.user.role === 'admin') {
      console.log(' ✅ TESTE 1 PASSOU COM SUCESSO!\n');
    } else {
      throw new Error('Falha no Teste 1: resposta inesperada do login de admin.');
    }

    const token = data1.token;

    // TESTE 2: Acesso a Rota Protegida (Sessao / Token)
    console.log('[TESTE 2] Acessando rota protegida (/admin/dashboard) com o Token obtido...');
    const res2 = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data2 = await res2.json();
    console.log(` -> Status HTTP: ${res2.status}`);
    console.log(` -> Total de apoiadores no DF: ${data2.totalRegistrations}`);
    console.log(` -> Liderancas ativas: ${data2.activeAgents}`);

    if (res2.status === 200 && data2.totalRegistrations !== undefined) {
      console.log(' ✅ TESTE 2 PASSOU COM SUCESSO (Sessao/Token Validos)!\n');
    } else {
      throw new Error('Falha no Teste 2: nao foi possivel acessar a area administrativa.');
    }

    // TESTE 3: Senha Incorreta
    console.log('[TESTE 3] Tentando login com senha propositalmente incorreta...');
    const res3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'SenhaErradaProposital999' }),
    });
    const data3 = await res3.json();

    if (res3.status === 401 && data3.error === 'Credenciais inválidas.') {
      console.log(` -> Status HTTP: ${res3.status}`);
      console.log(` -> Mensagem de erro retornada: "${data3.error}"`);
      console.log(' ✅ TESTE 3 PASSOU COM SUCESSO (Login Recusado Corretamente)!\n');
    } else {
      throw new Error(`Falha no Teste 3: status inesperado ${res3.status}`);
    }

    // TESTE 4: Usuario Inexistente
    console.log('[TESTE 4] Tentando login com usuario inexistente...');
    const res4 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usuario_que_nao_existe_df', password: 'Admin@123' }),
    });
    const data4 = await res4.json();

    if (res4.status === 401 && data4.error === 'Credenciais inválidas.') {
      console.log(` -> Status HTTP: ${res4.status}`);
      console.log(` -> Mensagem de erro retornada: "${data4.error}"`);
      console.log(' ✅ TESTE 4 PASSOU COM SUCESSO (Usuario Inexistente Recusado)!\n');
    } else {
      throw new Error(`Falha no Teste 4: status inesperado ${res4.status}`);
    }

    console.log('====================================================');
    console.log('🎉 TODOS OS 4 TESTES DE ACEITACAO PASSARAM COM SUCESSO!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ ERRO NO TESTE:', err.message);
    process.exit(1);
  }
}

runAcceptanceTests();
