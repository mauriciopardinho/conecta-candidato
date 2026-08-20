import React, { useState } from 'react';

export default function VoterHome() {
  const [selectedRegion, setSelectedRegion] = useState('Ceilândia (RA IX)');
  const [selectedItems, setSelectedItems] = useState(['arroz', 'feijao', 'leite', 'carne']);
  const [optimizerResult, setOptimizerResult] = useState(null);

  const availableProducts = [
    { id: 'arroz', name: 'Arroz Tipo 1 (5kg)', avgPrice: 19.90, bestMarket: 'Atacadão Ceilândia', bestPrice: 18.90 },
    { id: 'feijao', name: 'Feijão Carioca (1kg)', avgPrice: 7.50, bestMarket: 'Assaí Taguatinga', bestPrice: 6.89 },
    { id: 'leite', name: 'Leite Integral 1L (Caixa 12x)', avgPrice: 4.80, bestMarket: 'Carrefour Plano Piloto', bestPrice: 3.89 },
    { id: 'carne', name: 'Peito de Frango (1kg)', avgPrice: 16.90, bestMarket: 'Assaí Taguatinga', bestPrice: 11.90 },
    { id: 'oleo', name: 'Óleo de Soja 900ml', avgPrice: 6.50, bestMarket: 'Dona de Casa Águas Claras', bestPrice: 4.99 },
    { id: 'cafe', name: 'Café Torrado (500g)', avgPrice: 17.80, bestMarket: 'Supermercado Tatico Samambaia', bestPrice: 14.50 },
  ];

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleOptimizeCart = () => {
    let totalNormal = 0;
    let totalOptimum = 0;

    availableProducts.forEach((p) => {
      if (selectedItems.includes(p.id)) {
        totalNormal += p.avgPrice;
        totalOptimum += p.bestPrice;
      }
    });

    const grossSavings = totalNormal - totalOptimum;
    const estimatedGas = 4.50; // R$ 4,50 de deslocamento no DF
    const netSavings = grossSavings - estimatedGas;

    setOptimizerResult({
      totalNormal: totalNormal.toFixed(2),
      totalOptimum: totalOptimum.toFixed(2),
      grossSavings: grossSavings.toFixed(2),
      estimatedGas: estimatedGas.toFixed(2),
      netSavings: netSavings.toFixed(2),
      singleStore: 'Atacadão Ceilândia',
      twoStores: 'Assaí Taguatinga + Carrefour Asa Norte (Distância: 600m)',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Banner de Boas-Vindas */}
      <section className="cc-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#ffffff', borderRadius: 20, padding: 24 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
          Mercado IA DF — Economia Real no Bolso
        </span>
        <h2 style={{ color: '#ffffff', margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 800 }}>
          Olá, Consumidor(a)! 🛒
        </h2>
        <p style={{ opacity: 0.95, fontSize: '0.9rem', marginTop: 4, marginBottom: 0 }}>
          Compare os preços oficiais dos supermercados no DF e saiba exatamente onde sua feira sai mais barata.
        </p>

        {/* Badge de Economia Acumulada */}
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '12px 16px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>💰</span>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700 }}>Sua Economia Estimada Este Mês:</div>
            <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>R$ 342,80 de Dinheiro no Bolso</strong>
          </div>
        </div>
      </section>

      {/* Seleção de RA do DF */}
      <div className="cc-card" style={{ borderRadius: 16, padding: 18 }}>
        <label className="cc-label">Sua Região Administrativa no DF</label>
        <select
          className="cc-input"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="Ceilândia (RA IX)">Ceilândia (RA IX)</option>
          <option value="Samambaia (RA XII)">Samambaia (RA XII)</option>
          <option value="Taguatinga (RA III)">Taguatinga (RA III)</option>
          <option value="Plano Piloto - Brasília (RA I)">Plano Piloto (RA I)</option>
          <option value="Águas Claras (RA XX)">Águas Claras (RA XX)</option>
          <option value="Gama (RA II)">Gama (RA II)</option>
        </select>
      </div>

      {/* Otimizador de Carrinho Inteligente */}
      <section className="cc-card" style={{ borderRadius: 18, padding: 22 }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem' }}>⚡ Monte sua Lista & Compare na Hora</h3>
        <p style={{ margin: '0 0 16px 0', color: 'var(--cc-text-muted)', fontSize: '0.85rem' }}>
          Marque os itens que precisa comprar hoje e deixe a IA calcular o menor preço líquido do seu bairro:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
          {availableProducts.map((p) => {
            const isChecked = selectedItems.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleItem(p.id)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: isChecked ? '2px solid var(--cc-teal)' : '1px solid #e2e8f0',
                  background: isChecked ? '#ecfdf5' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isChecked ? '#047857' : 'var(--cc-navy)' }}>
                  {isChecked ? '✓ ' : ''}{p.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                  Menor: <strong style={{ color: '#10b981' }}>R$ {p.bestPrice.toFixed(2)}</strong>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="cc-btn cc-btn-primary"
          onClick={handleOptimizeCart}
          style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
        >
          🧠 Calcular Melhor Opção de Mercado
        </button>

        {/* Resultado da Otimizacao */}
        {optimizerResult && (
          <div style={{ marginTop: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--cc-navy)' }}>
              📊 Resultado da Otimização da IA:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Preço Médio Tradicional</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>R$ {optimizerResult.totalNormal}</div>
              </div>
              <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Preço Otimizado IA</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>R$ {optimizerResult.totalOptimum}</div>
              </div>
              <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Economia Líquida Real</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>R$ {optimizerResult.netSavings}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1px solid #a7f3d0', color: '#065f46' }}>
              💡 <strong>Recomendação da IA:</strong> Comprar no <strong>{optimizerResult.singleStore}</strong> economiza R$ {optimizerResult.grossSavings} no total. Descontando R$ {optimizerResult.estimatedGas} de combustível no deslocamento, seu <strong>lucro real líquido no bolso é de R$ {optimizerResult.netSavings}</strong>!
            </div>
          </div>
        )}
      </section>

      {/* Dicas de Ofertas do DF em Destaque */}
      <section className="cc-card" style={{ borderRadius: 18, padding: 20 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>🔥 Melhores Ofertas do DF Hoje (Registradas em Notas Oficiais)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {availableProducts.slice(0, 4).map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ fontSize: '0.88rem' }}>{p.name}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.bestMarket}</div>
              </div>
              <span style={{ background: '#10b981', color: '#fff', fontWeight: 800, padding: '4px 10px', borderRadius: 8, fontSize: '0.85rem' }}>
                R$ {p.bestPrice.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
