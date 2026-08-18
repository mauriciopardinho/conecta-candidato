# Conecta Candidato

Plataforma digital de gestão e relacionamento para campanha eleitoral, com três
perfis independentes: **Admin/Candidato**, **Cabo Eleitoral** e **Eleitor**.

> ⚠️ Este é um projeto de demonstração/desenvolvimento. Os dados gerados pelo
> seed (`npm run seed`) são **100% fictícios**. Antes de qualquer uso real em
> campanha, revise a seção de Segurança e LGPD abaixo e ajuste `.env`,
> segredos JWT e a integração real com WhatsApp.

## Stack

- **Backend:** Node.js + Express + Sequelize (SQLite em dev, Postgres-ready em produção)
- **Frontend:** React + Vite + React Router + Recharts + Leaflet
- **Autenticação:** JWT + bcrypt
- **Mobile:** o mesmo frontend React é empacotável em APK via Capacitor (ver seção abaixo)

Veja `docs/ARCHITECTURE.md` para o detalhamento completo da arquitetura,
modelo de dados e decisões de design.

## Estrutura

```
conecta-candidato/
├── backend/     # API REST (Node/Express/Sequelize)
├── frontend/    # SPA React (eleitor, cabo, admin)
└── docs/        # Arquitetura e instalação
```

## Como rodar localmente

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed     # cria o banco SQLite e popula com dados fictícios
npm run dev       # inicia em http://localhost:3333
```

Credenciais criadas pelo seed:

| Perfil | Usuário/Telefone | Senha |
|---|---|---|
| Admin | `admin` | `Admin@123` |
| Cabo eleitoral | `cabo1` até `cabo10` | `Cabo@123` |
| Eleitores | gerados aleatoriamente (ver banco) | `Eleitor@123` |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev       # inicia em http://localhost:5173
```

O Vite já está configurado para fazer proxy de `/api` para `http://localhost:3333`.

Acesse `http://localhost:5173/login` e entre com as credenciais acima.

## Gerando o APK Android (futuro)

O frontend é uma SPA React comum, pensada desde o início para não depender de
nenhuma API exclusiva de navegador — por isso pode virar um app Android sem
reescrever o código:

```bash
cd frontend
npm install @capacitor/core @capacitor/android
npx cap init "Conecta Candidato" "com.conectacandidato.app"
npm run build
npx cap add android
npx cap copy
npx cap open android   # abre no Android Studio para gerar o APK/AAB
```

No Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

Isso exige o Android Studio/SDK instalados na sua máquina — não é possível
compilar um APK dentro deste ambiente de chat, que não tem acesso à internet
nem ao toolchain Android.

## Integração real com WhatsApp

Hoje o `WhatsAppService` (`backend/src/services/whatsappService.js`) roda em
modo `stub`, apenas logando as mensagens no console — suficiente para
desenvolvimento e testes. Para produção, implemente `sendViaProvider()` nesse
mesmo arquivo com a chamada HTTP ao provedor escolhido (Meta Cloud API,
Twilio, Z-API etc.) e configure as variáveis `WHATSAPP_*` no `.env`. Nenhuma
outra parte do sistema precisa mudar.

## Segurança e LGPD — o que já está implementado

- Senhas com hash `bcrypt`
- Autenticação via JWT
- RBAC por perfil (`admin`, `field_agent`, `voter`) em todas as rotas
- Cabo eleitoral nunca acessa dados administrativos nem de outros cabos
- Eleitor nunca acessa dados de outro eleitor
- Rate limiting (geral e reforçado em rotas de autenticação)
- Validação de entrada com Zod em todos os endpoints de escrita
- Proteção contra SQL Injection via ORM parametrizado (Sequelize)
- Logs de auditoria (`audit_logs`), visíveis ao admin em `/admin/auditoria`
- Registro de consentimento (`consent_records`) no cadastro do eleitor e no
  cadastro de contatos pelo cabo — sem consentimento, o cadastro é bloqueado
- Nenhuma tabela do banco armazena intenção de voto, opinião política,
  religião, raça ou orientação sexual — essas colunas simplesmente não
  existem no schema (privacy by design)
- Módulo de ML restrito a dados agregados de produção/demanda — nunca recebe
  `voter_id` como entrada e nunca gera score ou perfil individual

### O que falta implementar para produção real

Estes pontos foram deixados como próximos passos claros, não implementados
neste projeto de demonstração:

- Exclusão de conta e exportação de dados do próprio usuário (endpoints
  `DELETE /voter/me` e `GET /voter/me/export` — a estrutura de dados já
  suporta, faltam as rotas e a lógica de exclusão em cascata/anonimização)
- Política de retenção automatizada (rotina agendada de expurgo)
- Refresh token / revogação de sessão (hoje o JWT expira em 8h, sem refresh)
- Migrations versionadas com `sequelize-cli` (hoje usa `sequelize.sync()`,
  adequado para desenvolvimento, não recomendado para produção)
- Testes automatizados (unitários e de integração)
- Implementação real do `WhatsAppService.sendViaProvider()`

## API — principais endpoints

Ver `docs/ARCHITECTURE.md` para a lista completa. Resumo:

```
POST   /api/auth/register
POST   /api/auth/verify-whatsapp
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password

GET    /api/proposals
GET    /api/proposals/:id

POST   /api/suggestions
GET    /api/my-suggestions

POST   /api/requests
GET    /api/my-requests

POST   /api/agent/registrations
GET    /api/agent/production

GET    /api/admin/dashboard
GET    /api/admin/production
GET    /api/admin/production/by-agent
GET    /api/admin/regions
GET    /api/admin/agents
POST   /api/admin/agents
GET    /api/admin/audit-logs

GET    /api/ml/forecast
GET    /api/ml/anomalies
GET    /api/ml/demand
```

## Identidade visual

Paleta própria "Conecta Candidato" (azul-marinho + teal + âmbar), tipografia
Sora/Manrope, navegação lateral no painel admin e navegação inferior no app
do eleitor — definida em `frontend/src/styles/global.css`.
