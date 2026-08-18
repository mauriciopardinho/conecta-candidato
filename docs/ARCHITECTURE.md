# Conecta Candidato — Arquitetura do Sistema

## 1. Visão Geral

Conecta Candidato é uma plataforma SaaS de gestão e relacionamento para campanhas
eleitorais, com três perfis independentes de acesso:

- **Admin/Candidato** — painel administrativo completo (dashboards, mapa, ML, gestão de cabos).
- **Cabo Eleitoral** — app/dashboard operacional de produção e cadastro de contatos.
- **Eleitor** — aplicativo mobile-first para acompanhar propostas, enviar sugestões e pedidos.

## 2. Stack Tecnológica

| Camada        | Tecnologia |
|---------------|-----------|
| Backend       | Node.js + Express |
| ORM / Banco   | Sequelize + SQLite (dev) — trocável para PostgreSQL em produção via `DATABASE_URL` |
| Autenticação  | JWT (access + refresh), bcrypt para hash de senha |
| Frontend Web  | React + Vite + React Router + Recharts (gráficos) + Leaflet (mapa) |
| Mobile futuro | O frontend React é responsivo e empacotável com Capacitor → gera APK Android sem reescrever o app |
| WhatsApp      | Camada de abstração `WhatsAppService` (stub local, plugável a qualquer provedor: Meta Cloud API, Twilio, Z-API etc.) |
| ML            | Módulo estatístico próprio (regressão linear / médias móveis / z-score) sobre dados agregados de produção — sem dependências pesadas, roda em Node puro |
| Segurança     | Helmet, rate-limiting, RBAC por middleware, validação de entrada (Zod), logs de auditoria em tabela própria |

Motivo do SQLite em dev: zero configuração para rodar localmente. Basta trocar
`DATABASE_URL` no `.env` para apontar a um Postgres em produção — o Sequelize
abstrai o dialeto.

## 3. Perfis e Regras de Acesso (RBAC)

```
role: 'admin'        → acesso total, todas rotas /admin/*, /ml/*
role: 'field_agent'   → acesso a /agent/*, somente aos próprios dados de produção e região
role: 'voter'         → acesso a /voter/*, /proposals, /suggestions, /requests (somente os próprios registros)
```

Middleware `authenticate` valida o JWT. Middleware `authorize(...roles)` bloqueia
por perfil. Middleware `ownershipGuard` garante que eleitor só veja seus próprios
dados e cabo só veja sua própria produção/região.

## 4. Estrutura de Pastas

```
conecta-candidato/
├── backend/
│   ├── src/
│   │   ├── config/          # conexão com banco, variáveis de ambiente
│   │   ├── models/          # modelos Sequelize (1 arquivo por entidade)
│   │   ├── controllers/     # lógica de negócio por módulo
│   │   ├── routes/          # definição das rotas REST
│   │   ├── middleware/      # auth, rbac, rate limit, validação, auditoria
│   │   ├── services/        # WhatsAppService, MLService, NotificationService
│   │   ├── seed/            # dados fictícios de demonstração
│   │   ├── utils/           # helpers (hash, jwt, logger)
│   │   ├── app.js           # configuração do Express
│   │   └── server.js        # ponto de entrada
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/voter/     # telas do app do eleitor
│   │   ├── pages/admin/     # painel administrativo
│   │   ├── pages/agent/     # dashboard do cabo eleitoral
│   │   ├── components/      # componentes reutilizáveis (cards, tabelas, nav)
│   │   ├── services/api.js  # client HTTP central
│   │   └── styles/          # identidade visual "Conecta Candidato"
│   └── package.json
└── docs/
    ├── ARCHITECTURE.md      # este arquivo
    └── INSTALL.md           # guia de instalação e execução
```

## 5. Modelo de Dados (resumo das entidades)

`users` (tabela base de credenciais) → `voters`, `field_agents`, `admins` (perfis
específicos ligados por `user_id`), `regions`, `proposals`, `suggestions`,
`requests`, `registrations`, `production_records`, `goals`, `notifications`,
`whatsapp_verifications`, `consent_records`, `audit_logs`.

Nenhuma tabela armazena intenção de voto, opinião política, religião, raça ou
orientação sexual — essas colunas simplesmente não existem no schema, por
design (privacy-by-design), não apenas por regra de aplicação.

## 6. Módulo de Machine Learning — limites de escopo

O `MLService` consome exclusivamente `production_records` (contagens agregadas
por região/dia). Ele expõe:

- **Previsão de produção** (regressão linear simples sobre a série histórica) → estimativa de dias até a meta.
- **Detecção de anomalias** (z-score sobre a série de produção por região) → alerta de queda/alta incomum.
- **Previsão de demanda operacional** (média móvel sobre `requests` por região) → estimativa de volume futuro.

Ele **não** tem acesso a nenhuma tabela ou coluna que descreva indivíduos
politicamente, e não existe endpoint que receba `voter_id` como entrada para
scoring — arquitetura pensada para tornar esse uso indevido estruturalmente
difícil, não apenas proibido por política.

## 7. Fluxo de Autenticação do Eleitor

1. `POST /auth/register` → cria `user` (inativo) + `voter`.
2. Sistema gera código de 6 dígitos, salva em `whatsapp_verifications` (com expiração), chama `WhatsAppService.sendVerificationCode()`.
3. `POST /auth/verify-whatsapp` → valida código, ativa `user.status = 'active'`.
4. `POST /auth/login` → emite JWT somente se `status === 'active'`.
5. `POST /auth/forgot-password` → reutiliza o mesmo mecanismo de código via WhatsApp.

## 8. Caminho para o APK

O frontend é uma SPA React comum. Para gerar o Android/APK futuramente:

```
npm install @capacitor/core @capacitor/android
npx cap init "Conecta Candidato" "com.conectacandidato.app"
npm run build
npx cap add android
npx cap copy
npx cap open android   # abre no Android Studio para gerar o APK/AAB
```

Nenhuma mudança estrutural é necessária no código React para isso — é por
esse motivo que o frontend evita APIs exclusivas de navegador sempre que possível.
