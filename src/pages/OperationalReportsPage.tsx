import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import api from '../services/api';

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
  Critical: '#d32f2f',
};

interface OperationalData {
  auditsByStatus: { status: string; count: number }[];
  findingsBySeverity: { severity: string; status: string; count: number }[];
  remediationProgress: { status: string; count: number }[];
  auditVolume: { month: string; count: number }[];
}

const OperationalReportsPage: React.FC = () => {
  const [data, setData] = useState<OperationalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getOperationalReports();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch operational report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Typography color="error">Failed to load report data.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Operational Audit Reports
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Detailed breakdown of audit throughput, finding trends, and remediation activity.
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: Audit Volume Trend */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Audit Volume Trend (Last 12 Months)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.auditVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Audits Started" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Row 2: Status Breakdowns */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Audits by Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.auditsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Remediation Action Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.remediationProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" name="Action Plans" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Row 3: Finding Distribution */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Findings by Severity and Status
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.findingsBySeverity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Findings Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperationalReportsPage;
