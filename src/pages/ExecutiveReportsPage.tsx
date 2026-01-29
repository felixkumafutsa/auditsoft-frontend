import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const SEVERITY_COLORS: Record<string, string> = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
  Critical: '#d32f2f',
};

interface ReportData {
  auditStatusDistribution: { status: string; count: number }[];
  findingsBySeverity: { severity: string; count: number }[];
  criticalOpenFindings: {
    id: number;
    description: string;
    severity: string;
    status: string;
    audit: { auditName: string };
  }[];
  auditProgress: {
    total: number;
    completed: number;
    percentage: number;
  };
  riskOverview: { level: string; count: number }[];
}

const ExecutiveReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getExecutiveReport();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch executive report:', error);
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
        Executive Audit Report
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        High-level overview of audit activities, risks, and compliance status.
      </Typography>

      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Audit Plan Completion
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {data.auditProgress.percentage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={data.auditProgress.percentage} 
                sx={{ mt: 2, height: 8, borderRadius: 5 }} 
              />
              <Typography variant="caption" display="block" mt={1}>
                {data.auditProgress.completed} of {data.auditProgress.total} audits completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Critical Findings
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="error">
                {data.criticalOpenFindings.length}
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                Requires immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 } as any}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Risks Monitored
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {data.riskOverview.reduce((acc, curr) => acc + curr.count, 0)}
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                Across all categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Row 1 */}
        <Grid size={{ xs: 12, md: 6 } as any}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Audit Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.auditStatusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label
                >
                  {data.auditStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 } as any}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Findings by Severity
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.findingsBySeverity}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Findings">
                  {data.findingsBySeverity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SEVERITY_COLORS[entry.severity] || '#8884d8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Overview & Critical List */}
        <Grid size={{ xs: 12, md: 6 } as any}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Risk Profile (By Impact)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.riskOverview}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="level" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff9800" name="Risks" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 } as any}>
          <Paper sx={{ p: 0, height: 400, overflow: 'auto' }}>
            <Box p={2} borderBottom={1} borderColor="divider">
               <Typography variant="h6" fontWeight="bold">
                Critical Open Findings
              </Typography>
            </Box>
            <List>
              {data.criticalOpenFindings.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No critical open findings." />
                </ListItem>
              ) : (
                data.criticalOpenFindings.map((finding) => (
                  <React.Fragment key={finding.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {finding.description.length > 50 ? `${finding.description.substring(0, 50)}...` : finding.description}
                            </Typography>
                            <Chip 
                              label={finding.severity} 
                              size="small" 
                              color={finding.severity === 'Critical' ? 'error' : 'warning'} 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {finding.audit.auditName}
                            </Typography>
                            {" — "}{finding.status}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveReportsPage;
