import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RiskHeatmap from '../components/RiskHeatmap';
import api from '../services/api';

const RiskHeatmapPage: React.FC = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRisks = async () => {
      setLoading(true);
      try {
        const data = await api.getRisks();
        setRisks(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to fetch risks:', err);
        setError(err.message || 'Failed to load risk data');
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header Area */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Risk Management</Typography>
          <Typography color="text.primary">Heatmap</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F1A2B' }}>
          Risk Heatmap Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualizing risk exposure across the organization with inherent and residual perspectives.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Heatmap Component */}
      <Box sx={{ mb: 4 }}>
        <RiskHeatmap
          risks={risks}
          title="Enterprise Risk Exposure Grid"
        />
      </Box>

      <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, border: '1px solid #e0e0e0', mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Analysis Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          The heatmap above displays the distribution of risks based on their impact and likelihood.
          Use the toggle to switch between <strong>Inherent Risk</strong> (before controls) and
          <strong>Residual Risk</strong> (remaining risk after control implementation).
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef5350' }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>High Exposure (Critical/High)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fbc02d' }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Medium Exposure</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#66bb6a' }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Low Exposure</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RiskHeatmapPage;
