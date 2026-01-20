// src/components/Sidebar.tsx
import React, { useState } from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '250px',
    backgroundColor: '#343a40',
    color: 'white',
    padding: '20px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '24px',
    marginBottom: '30px',
    textAlign: 'center',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    textDecoration: 'none',
    marginBottom: '10px',
  },
  logoutButton: {
    width: '100%',
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
    marginTop: 'auto',
  },
  icon: {
    marginRight: '10px',
  },
};

type Page = 'dashboard' | 'audits' | 'users' | 'roles';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface NavItemProps {
  page: Page;
  label: string;
  onNavigate: (page: Page) => void;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ page, label, onNavigate, icon }) => {
  const [hover, setHover] = useState(false);

  return (
    <a
      href="#"
      style={{
        ...styles.navItem,
        backgroundColor: hover ? '#495057' : 'transparent',
      }}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(page);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={styles.icon}>{icon}</span>
      <span>{label}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout }) => {
  const [logoutHover, setLogoutHover] = useState(false);

  const icons = {
    dashboard: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    audits: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    users: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    roles: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  };

  return (
    <div style={styles.sidebar}>
      <h1 style={styles.title}>AuditSoft</h1>
      <nav style={styles.navList}>
        <NavItem page="dashboard" label="Dashboard" onNavigate={onNavigate} icon={icons.dashboard} />
        <NavItem page="audits" label="Audits" onNavigate={onNavigate} icon={icons.audits} />
        <NavItem page="users" label="Users" onNavigate={onNavigate} icon={icons.users} />
        <NavItem page="roles" label="Roles" onNavigate={onNavigate} icon={icons.roles} />
      </nav>
      <a
        href="#"
        style={{
          ...styles.logoutButton,
          backgroundColor: logoutHover ? '#c82333' : '#dc3545',
        }}
        onClick={(e) => {
          e.preventDefault();
          onLogout();
        }}
        onMouseEnter={() => setLogoutHover(true)}
        onMouseLeave={() => setLogoutHover(false)}
      >
        Logout
      </a>
    </div>
  );
};

export default Sidebar;

