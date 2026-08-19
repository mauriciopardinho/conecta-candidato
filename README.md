# 🚀 Conecta Candidato DF — Centro de Comando Digital da Campanha (SaaS)

Plataforma digital de gestão eleitoral territorial, inteligência de campo e relacionamento comunitário para o Distrito Federal, estruturada em **3 perfis independentes**: **Admin/Candidato**, **Cabo Eleitoral (Minha Operação)** e **Eleitor**.

---

## 📌 Guia Completo de Demonstração & Apresentação

Este repositório contém a versão final e auditada do **Conecta Candidato DF**. Para enviar esta documentação e o código fonte completo para análise no ChatGPT ou apresentação a clientes/candidatos, consulte o resumo estruturado abaixo.

---

## 🏛️ Perfis de Acesso & Matriz de Credenciais

| Perfil | Usuário / Identificador | Senha | RA de Atuação | Descrição da Interface |
| :--- | :--- | :--- | :--- | :--- |
| **Admin da Campanha** | `admin` | `Admin@123` | Distrito Federal (Todas as 13 RAs) | **Centro de Comando Digital:** Indicadores em tempo real, Mapa Leaflet das RAs, resolutividade, log de auditoria e IA preditiva. |
| **Cabo Eleitoral 1** | `cabo1` | `Cabo@123` | Ceilândia (RA IX) | **App "MINHA OPERAÇÃO":** Interface mobile com abas de cadastro rápido, demandas da região e gráficos de meta pessoal. |
| **Cabos Eleitorais 2..13** | `cabo2` .. `cabo13` | `Cabo@123` | Samambaia, Taguatinga, Plano Piloto... | **Atuação Regional:** Cada cabo gerencia os contatos e solicitações comunitárias exclusivamente da sua RA atribuída. |
| **Eleitor Cadastrado** | `+5561998342745` | `Eleitor@123` | Ceilândia | **Portal do Eleitor:** Propostas da campanha, envio de sugestões, abertura de demandas comunitárias e Central de Privacidade LGPD. |

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js (v18+) + Express + Sequelize ORM (SQLite em desenvolvimento, Postgres-ready para produção)
- **Frontend:** React 18 + Vite + React Router (HashRouter SPA) + Recharts + Leaflet Maps
- **Autenticação & Segurança:** JWT (`jsonwebtoken`) + Criptografia `bcrypt` + Middleware RBAC por perfil
- **Privacidade & Compliance:** Módulo LGPD Art. 18 com exportação de dados em JSON (`GET /voter/me/export`) e eliminação/anonimização auditável (`DELETE /voter/me`)

---

## ⚙️ Como Executar Localmente

### 1. Iniciar o Backend API
```bash
cd backend
npm install
npm run seed     # Cria o banco SQLite e popula com 13 RAs do DF e credenciais de teste
npm run dev      # Inicia a API em http://localhost:3333/api
```

### 2. Rodar a Suíte Completa de Testes Automatizados (E2E)
```bash
cd backend
node test_full_suite.js
```
*Executa 6 testes integrados de aceitação (Login Admin, Dashboard API, Operação do Cabo, Cadastro e Portabilidade LGPD, Forecast ML e Segurança RBAC).*

### 3. Iniciar o Frontend SPA React
```bash
cd frontend
npm install
npm run dev      # Inicia o frontend em http://localhost:5173
```
*Acesse `http://localhost:5173/#/login` para testar os 3 perfis.*

---

## 🌐 URLs de Produção e Repositório

- **Frontend (Render Static Site)**: [https://conecta-candidato-app.onrender.com](https://conecta-candidato-app.onrender.com)
- **Backend API (Render Web Service)**: [https://conecta-candidato-api-qvrx.onrender.com/api](https://conecta-candidato-api-qvrx.onrender.com/api)
- **Repositório GitHub**: [https://github.com/mauriciopardinho/conecta-candidato](https://github.com/mauriciopardinho/conecta-candidato)
