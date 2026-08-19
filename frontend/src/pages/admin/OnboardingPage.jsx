import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    candidateName: 'Campanha DF 2026',
    cargo: 'Deputado Distrital',
    partido: 'Partido / Coligação DF',
    mainRegion: 'Ceilândia (RA IX)',
    targetGoal: 15000,
    whatsappContact: '+55 (61) 99999-0000',
    lgpdConsent: true,
  });

  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else navigate('/admin');
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div style={{ maxWidth: 720, margin: '20px auto', padding: '0 10px' }}>
      <div className="cc-card" style={{ borderRadius: 20, padding: 32 }}>
        
        {/* Header do Wizard */}
        <div style={{ marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cc-teal)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Configuração de Campanha SaaS — Passo {step} de 5
          </span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', color: 'var(--cc-text)' }}>
            {step === 1 && '1. Dados Principais da Candidatura'}
            {step === 2 && '2. Regiões Administrativas Prioritárias'}
            {step === 3 && '3. Estrutura da Equipe e Lideranças'}
            {step === 4 && '4. Comunicação & Integração WhatsApp'}
            {step === 5 && '5. Conformidade LGPD & Conclusão'}
          </h2>
        </div>

        {/* Progresso visual */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: i <= step ? 'var(--cc-teal)' : '#e2e8f0',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Conteúdo do Passo */}
        <div style={{ minHeight: 240 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="cc-label">Nome da Campanha / Candidato(a)</label>
                <input
                  className="cc-input"
                  value={campaignData.candidateName}
                  onChange={(e) => setCampaignData({ ...campaignData, candidateName: e.target.value })}
                />
              </div>
              <div>
                <label className="cc-label">Cargo Concorrido</label>
                <select
                  className="cc-input"
                  value={campaignData.cargo}
                  onChange={(e) => setCampaignData({ ...campaignData, cargo: e.target.value })}
                >
                  <option value="Deputado Distrital">Deputado Distrital (CLDF)</option>
                  <option value="Deputado Federal">Deputado Federal (DF)</option>
                  <option value="Governador(a)">Governador(a) do DF</option>
                  <option value="Senador(a)">Senador(a) do DF</option>
                </select>
              </div>
              <div>
                <label className="cc-label">Meta Global de Apoiadores</label>
                <input
                  type="number"
                  className="cc-input"
                  value={campaignData.targetGoal}
                  onChange={(e) => setCampaignData({ ...campaignData, targetGoal: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                Selecione a Região Administrativa de maior relevância eleitoral para centralizar o plano inicial de ação:
              </p>
              <select
                className="cc-input"
                value={campaignData.mainRegion}
                onChange={(e) => setCampaignData({ ...campaignData, mainRegion: e.target.value })}
              >
                <option value="Ceilândia (RA IX)">Ceilândia (RA IX)</option>
                <option value="Samambaia (RA XII)">Samambaia (RA XII)</option>
                <option value="Taguatinga (RA III)">Taguatinga (RA III)</option>
                <option value="Plano Piloto - Brasília (RA I)">Plano Piloto (RA I)</option>
                <option value="Águas Claras (RA XX)">Águas Claras (RA XX)</option>
                <option value="Gama (RA II)">Gama (RA II)</option>
                <option value="Santa Maria (RA XIII)">Santa Maria (RA XIII)</option>
              </select>
              <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                💡 <strong>Dica Estratégica:</strong> Todas as 13 principais Regiões Administrativas do DF já estão cadastradas e prontas para uso no seu mapa.
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                Estrutura de lideranças de campo prontas para acesso mobile:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>👑 Conta Administrador</span> <strong>admin (Senha: Admin@123)</strong>
                </li>
                <li style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>📱 Cabos Eleitorais (13 RAs)</span> <strong>cabo1..cabo13 (Senha: Cabo@123)</strong>
                </li>
              </ul>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="cc-label">Telefone Oficial de Atendimento WhatsApp</label>
                <input
                  className="cc-input"
                  value={campaignData.whatsappContact}
                  onChange={(e) => setCampaignData({ ...campaignData, whatsappContact: e.target.value })}
                />
              </div>
              <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0', fontSize: '0.85rem', color: '#065f46' }}>
                ✓ Arquitetura <code>WhatsAppService</code> ativa para notificações de confirmação de cadastro e acompanhamento de demandas.
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>✓ Rastreabilidade LGPD & Privacy by Design</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--cc-text-muted)', lineHeight: 1.5 }}>
                  A campanha operará com coleta de consentimento digital em cada formulário de abordagem, armazenamento de logs de auditoria com IP e timestamp, e portal de portabilidade de dados para o eleitor.
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={campaignData.lgpdConsent}
                  onChange={(e) => setCampaignData({ ...campaignData, lgpdConsent: e.target.checked })}
                />
                Confirmar inicialização do Centro de Comando Digital da Campanha
              </label>
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <button
            className="cc-btn cc-btn-secondary"
            onClick={handleBack}
            disabled={step === 1}
          >
            Voltar
          </button>
          <button
            className="cc-btn cc-btn-primary"
            onClick={handleNext}
          >
            {step === 5 ? 'Concluir & Ir para o Painel' : 'Avançar'}
          </button>
        </div>

      </div>
    </div>
  );
}
