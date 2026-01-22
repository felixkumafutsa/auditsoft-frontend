// src/App.tsx
import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuditsPage from './pages/AuditsPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import FindingsPage from './pages/FindingsPage';
import AuditExecutionModule from './components/AuditExecutionModule';
import AuditLogsPage from './pages/AuditLogsPage';
import api from './services/api';
import { Page } from './components/Sidebar';

function App() {
  // Check for a token in localStorage to maintain session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));
  const [page, setPage] = useState<Page>('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setPage('dashboard');
  };

  const handleLogout = () => {
    api.logout(); // This clears the token from the api client and localStorage
    setIsAuthenticated(false);
  };

  const handleNavigate = (newPage: Page) => {
    setPage(newPage);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'audits':
        return <AuditsPage />;
      case 'users':
        return <UsersPage />;
      case 'roles':
        return <RolesPage />;
      case 'findings':
        return <FindingsPage />;
      case 'execution':
        return <AuditExecutionModule />;
      case 'audit-logs':
        return <AuditLogsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;
