// src/components/Layout.tsx
import React from 'react';
import Sidebar from './Sidebar';

const styles: { [key: string]: React.CSSProperties } = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    backgroundColor: '#f8f9fa',
  },
};

type Page = 'dashboard' | 'audits' | 'users' | 'roles';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onLogout }) => {
  return (
    <div style={styles.layout}>
      <Sidebar onNavigate={onNavigate} onLogout={onLogout} />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
