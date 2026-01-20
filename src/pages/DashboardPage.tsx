// src/pages/DashboardPage.tsx
import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  cardNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
  },
};

const DashboardPage: React.FC = () => {
  // Dummy data for the cards
  const summaryData = {
    totalAudits: 12,
    openFindings: 5,
    overdueActionPlans: 2,
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Audits</h3>
          <p style={styles.cardNumber}>{summaryData.totalAudits}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Open Findings</h3>
          <p style={styles.cardNumber}>{summaryData.openFindings}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Overdue Action Plans</h3>
          <p style={styles.cardNumber}>{summaryData.overdueActionPlans}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
