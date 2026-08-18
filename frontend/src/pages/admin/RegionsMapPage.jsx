import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../../services/api';
import 'leaflet/dist/leaflet.css';

export default function RegionsMapPage() {
  const [regions, setRegions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/admin/regions').then(({ data }) => setRegions(data));
  }, []);

  const center = regions.length
    ? [regions[0].latitude, regions[0].longitude]
    : [-15.7942, -47.8822]; // Coordenadas de Brasília / DF

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--cc-text)' }}>🗺️ Mapa Geográfico de Campo - Distrito Federal</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--cc-text-muted)', fontSize: '0.9rem' }}>
          Visualização espacial da atuação das lideranças e engajamento eleitoral nas Regiões Administrativas do DF.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div className="cc-card" style={{ padding: 0, overflow: 'hidden', height: 500, borderRadius: 16 }}>
          <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {regions.map((r) => (
              <CircleMarker
                key={r.id}
                center={[r.latitude, r.longitude]}
                radius={10 + Math.min(r.registrationsCount / 10, 16)}
                pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.6 }}
                eventHandlers={{ click: () => setSelected(r) }}
              >
                <Popup>
                  <strong>{r.name}</strong><br />
                  📍 {r.registrationsCount} apoiadores cadastrados
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="cc-card" style={{ borderRadius: 16, padding: 20 }}>
          {selected ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>📍</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{selected.name}</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Cadastros totais:</span> <strong>{selected.registrationsCount} eleitores</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Lideranças de Campo:</span> <strong>{selected.agentsCount} cabos</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Produção hoje:</span> <strong>{selected.todayProd} registros</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Produção na semana:</span> <strong>{selected.weekProd} registros</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Produção no mês:</span> <strong>{selected.monthProd} registros</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 6 }}>
                  <span>Solicitações recebidas:</span> <strong>{selected.requestsReceived} pedidos</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6 }}>
                  <span>Solicitações concluídas:</span> <strong>{selected.requestsCompleted} atendidos</strong>
                </li>
              </ul>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--cc-text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🗺️</span>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Clique no marcador de uma Região Administrativa no mapa para ver o panorama detalhado de campo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
