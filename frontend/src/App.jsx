import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyWhatsappPage from './pages/VerifyWhatsappPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import VoterLayout from './pages/voter/VoterLayout';
import VoterHome from './pages/voter/VoterHome';
import ProposalsPage from './pages/voter/ProposalsPage';
import SuggestionsPage from './pages/voter/SuggestionsPage';
import RequestsPage from './pages/voter/RequestsPage';

import AgentDashboard from './pages/agent/AgentDashboard';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AgentProductionPage from './pages/admin/AgentProductionPage';
import RegionsMapPage from './pages/admin/RegionsMapPage';
import AgentsPage from './pages/admin/AgentsPage';
import AdminSuggestionsPage from './pages/admin/AdminSuggestionsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import MLPage from './pages/admin/MLPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-whatsapp" element={<VerifyWhatsappPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Área do eleitor */}
        <Route path="/app" element={<ProtectedRoute role="voter"><VoterLayout /></ProtectedRoute>}>
          <Route index element={<VoterHome />} />
          <Route path="propostas" element={<ProposalsPage />} />
          <Route path="sugestoes" element={<SuggestionsPage />} />
          <Route path="solicitacoes" element={<RequestsPage />} />
        </Route>

        {/* Área do cabo eleitoral */}
        <Route path="/agent" element={<ProtectedRoute role="field_agent"><AgentDashboard /></ProtectedRoute>} />

        {/* Painel administrativo */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="producao" element={<AgentProductionPage />} />
          <Route path="regioes" element={<RegionsMapPage />} />
          <Route path="cabos" element={<AgentsPage />} />
          <Route path="sugestoes" element={<AdminSuggestionsPage />} />
          <Route path="solicitacoes" element={<AdminRequestsPage />} />
          <Route path="ml" element={<MLPage />} />
          <Route path="auditoria" element={<AuditLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
