// src/pages/AuditsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const styles: { [key: string]: React.CSSProperties } = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
  button: {
    padding: '10px 15px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

const AuditsPage: React.FC = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await api.getAudits();
        setAudits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  if (loading) return <p>Loading audits...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Audits</h2>
        <button style={styles.button}>Create Audit</button>
      </div>
      <p>Manage all audits in the system.</p>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Audit Name</th>
            <th style={styles.th}>Audit Type</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {audits.map(audit => (
            <tr key={audit.id}>
              <td style={styles.td}>{audit.auditName}</td>
              <td style={styles.td}>{audit.auditType}</td>
              <td style={styles.td}>{audit.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditsPage;
