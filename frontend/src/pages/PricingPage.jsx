import React from 'react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const plans = [
    {
      name: 'Essencial',
      badge: 'Início Rápido',
      description: 'Ideal para vereadores e pré-candidaturas locais que precisam organizar a base inicial.',
      features: [
        'Até 5.000 contatos cadastrados',
        'Até 5 lideranças de campo',
        'Gestão de demandas comunitárias',
        'Dashboard básico de metas',
        'Conformidade LGPD padrão',
        'Suporte por e-mail',
      ],
      highlight: false,
    },
    {
      name: 'Profissional',
      badge: 'Mais Popular DF',
      description: 'Perfeito para deputados distritais e federais com operação em múltiplas RAs do DF.',
      features: [
        'Até 25.000 contatos cadastrados',
        'Até 25 lideranças de campo',
        'Mapa geográfico interativo das RAs',
        'Inteligência Preditiva (Machine Learning)',
        'Módulo de Auditoria & Logs LGPD',
        'Notificações de progresso',
        'Suporte prioritário via WhatsApp',
      ],
      highlight: true,
    },
    {
      name: 'Pro',
      badge: 'Campanha Forte',
      description: 'Para majoritárias e campanhas com grande volume de lideranças e comitês de bairro.',
      features: [
        'Até 100.000 contatos cadastrados',
        'Lideranças e cabos ilimitados',
        'Mapa de Calor territorial avançado',
        'Alertas de anomalia por Z-Score',
        'Exportação e relatórios em PDF/Excel',
        'Treinamento de equipe incluído',
        'Atendimento dedicado 24/7',
      ],
      highlight: false,
    },
    {
      name: 'Enterprise',
      badge: 'Personalizado',
      description: 'Solução sob medida com implantação presencial e integrações customizadas.',
      features: [
        'Contatos e infraestrutura ilimitados',
        'Servidor e banco dedicados',
        'Segurança e criptografia corporativa',
        'Integrações via API customizada',
        'Gestão multicampanha / partidos',
        'Gerente de conta exclusivo no DF',
      ],
      highlight: false,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, var(--cc-navy) 0%, #0f172a 100%)', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ color: 'var(--cc-teal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Voltar para o Login
          </Link>
          <h1 style={{ fontSize: '2.4rem', marginTop: 16, marginBottom: 12, fontWeight: 700 }}>
            Planos Comerciais Conecta Candidato SaaS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 650, margin: '0 auto' }}>
            Transforme a sua campanha em um Centro de Comando Digital. Escolha a capacidade ideal para o tamanho da sua operação no Distrito Federal.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {plans.map((p, idx) => (
            <div
              key={idx}
              className="cc-card"
              style={{
                background: p.highlight ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' : '#1e293b',
                border: p.highlight ? '2px solid var(--cc-teal)' : '1px solid #334155',
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: p.highlight ? '0 10px 30px rgba(13, 148, 136, 0.2)' : 'none',
              }}
            >
              {p.highlight && (
                <span
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 24,
                    background: 'var(--cc-teal)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {p.badge}
                </span>
              )}

              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{p.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8, marginBottom: 20, lineHeight: 1.4 }}>
                  {p.description}
                </p>

                <hr style={{ borderColor: '#334155', margin: '16px 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: '#cbd5e1' }}>
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--cc-teal)', fontWeight: 'bold' }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 32 }}>
                <Link
                  to="/login"
                  className="cc-btn"
                  style={{
                    width: '100%',
                    display: 'block',
                    textAlign: 'center',
                    background: p.highlight ? 'var(--cc-teal)' : '#334155',
                    color: '#fff',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Demonstração / Contratar
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60, textAlign: 'center', background: '#1e293b', padding: 32, borderRadius: 20, border: '1px solid #334155' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>🔒 Compromisso com Segurança & LGPD</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 700, margin: '12px auto 0 auto', lineHeight: 1.5 }}>
            A plataforma opera em conformidade total com a Lei Geral de Proteção de Dados (LGPD Art. 18) e com as diretrizes do Tribunal Superior Eleitoral. Todos os dados possuem registro de consentimento digital e auditoria completa de acessos.
          </p>
        </div>

      </div>
    </div>
  );
}
