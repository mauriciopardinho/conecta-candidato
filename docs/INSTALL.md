# Guia de Instalação — Conecta Candidato

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- (Opcional, produção) Postgres 14+
- (Opcional, APK) Android Studio + JDK 17

## 1. Backend

```bash
cd backend
cp .env.example .env
npm install
```

Edite o `.env` se necessário. Por padrão já funciona com SQLite local, sem
nenhuma configuração adicional.

Popule o banco com dados de demonstração (fictícios):

```bash
npm run seed
```

Isso recria o banco do zero e cria: 1 admin, 10 cabos eleitorais, 8 regiões,
~200 registros, propostas, sugestões, solicitações e 90 dias de produção
histórica — todos os dados marcados como fictícios.

Inicie o servidor:

```bash
npm run dev
```

A API sobe em `http://localhost:3333`. Teste com:

```bash
curl http://localhost:3333/api/health
```

## 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## 3. Testando os três perfis

- **Admin:** usuário `admin`, senha `Admin@123` → painel completo em `/admin`
- **Cabo eleitoral:** usuário `cabo1` (até `cabo10`), senha `Cabo@123` → dashboard em `/agent`
- **Eleitor:** crie uma conta em `/register` (o código de confirmação aparece
  no console do backend, já que o WhatsApp roda em modo stub)

## 4. Build de produção do frontend

```bash
cd frontend
npm run build
```

Gera os arquivos estáticos em `frontend/dist/`, prontos para deploy em
qualquer CDN/hosting estático (Vercel, Netlify, S3+CloudFront etc.).

## 5. Deploy do backend em produção

1. Provisione um Postgres e defina `DATABASE_URL` no `.env` de produção.
2. Troque `sequelize.sync()` por migrations versionadas (`sequelize-cli`)
   antes de ir para produção real.
3. Gere segredos JWT fortes e únicos (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
4. Configure as variáveis `WHATSAPP_*` com as credenciais do provedor
   escolhido e implemente `sendViaProvider()` em `whatsappService.js`.
5. Rode atrás de HTTPS (obrigatório para JWT/cookies seguros e para a API
   oficial do WhatsApp Business).

## 6. Gerando o APK Android

Pré-requisito: Android Studio instalado.

```bash
cd frontend
npm install @capacitor/core @capacitor/android
npx cap init "Conecta Candidato" "com.conectacandidato.app"
npm run build
npx cap add android
npx cap copy
npx cap open android
```

No Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`. O
arquivo `.apk` gerado fica em
`android/app/build/outputs/apk/debug/app-debug.apk`.

Para uma build assinada de produção, use
`Build > Generate Signed Bundle / APK` e siga o assistente para criar/usar
seu keystore.
