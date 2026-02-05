import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ExecutiveSummary {
  auditProgress?: { total: number; completed: number; percentage: number };
  findingsBySeverity?: { severity: string; count: number }[];
}

const BoardViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ExecutiveSummary>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getExecutiveReport();
        setSummary({
          auditProgress: data?.auditProgress,
          findingsBySeverity: data?.findingsBySeverity,
        });
      } catch (e) {
        console.error('Failed to fetch executive summary', e);
      }
    };
    fetch();
  }, []);

  const criticalCount = (summary.findingsBySeverity || []).find(f => f.severity === 'Critical')?.count || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0F1A2B', mb: 2 }}>
        Board Viewer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        High-level analytics and reports for board-level oversight.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Audit Plan Completion</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {summary.auditProgress?.percentage ?? 0}%
              </Typography>
              <Typography variant="caption">
                {summary.auditProgress?.completed ?? 0} of {summary.auditProgress?.total ?? 0} audits completed
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/reports-executive')}>Open Executive Reports</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Critical Open Findings</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {criticalCount}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/reports-executive')}>View Details</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Risk Heatmap</Typography>
              <Typography variant="body2" color="text.secondary">
                Visual distribution of risk by impact and likelihood.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/risk-heatmaps')}>Open Risk Heatmap</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BoardViewerPage;
