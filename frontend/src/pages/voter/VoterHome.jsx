import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VoterHome() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section className="cc-card" style={{ background: 'linear-gradient(135deg, var(--cc-teal), var(--cc-teal-dark))', color: '#fff' }}>
        <h2 style={{ color: '#fff' }}>Bem-vindo(a) 👋</h2>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
          Acompanhe as propostas, envie sugestões e ajude a melhorar sua região.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button className="cc-btn cc-btn-primary" onClick={() => navigate('/app/sugestoes')}>Enviar sugestão</button>
        <button className="cc-btn cc-btn-secondary" onClick={() => navigate('/app/solicitacoes')}>Solicitar atendimento</button>
        <button className="cc-btn cc-btn-amber" style={{ gridColumn: '1 / -1' }} onClick={() => navigate('/app/solicitacoes')}>
          Solicitar ação em minha região
        </button>
      </div>

      <section className="cc-card">
        <h3>Sobre o candidato</h3>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>
          Espaço reservado para apresentação do candidato, trajetória e propósito de campanha.
        </p>
      </section>

      <section className="cc-card">
        <h3>Notícias</h3>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>Nenhuma notícia publicada ainda.</p>
      </section>

      <section className="cc-card">
        <h3>Agenda</h3>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>Nenhum evento agendado no momento.</p>
      </section>

      <section className="cc-card">
        <h3>Canais de contato</h3>
        <p style={{ color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>WhatsApp · E-mail · Redes sociais (configurar).</p>
      </section>
    </div>
  );
}
