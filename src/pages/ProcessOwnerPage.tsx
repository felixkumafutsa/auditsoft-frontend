import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Audit } from '../types/audit';

interface User {
  id: number;
  name: string;
  email: string;
  auditUniverseEntities?: { id: number; entityName: string; entityType: string }[];
}

const ProcessOwnerPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [version] = useState(Date.now()); // Force re-render
  const navigate = useNavigate();

  // Dashboard Loading

  useEffect(() => {
    const fetchCurrentUserAndAudits = async () => {
      try {
        // Get current user info
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        }

        // Get all audits
        const allAudits = await api.getOwnerAudits();
        const auditsArray = Array.isArray(allAudits) ? allAudits : [];

        // Filter audits by user's audit universe entities
        if (currentUser?.auditUniverseEntities && currentUser.auditUniverseEntities.length > 0) {
          const userEntityIds = currentUser.auditUniverseEntities.map((entity: any) => entity.id);
          const filteredAudits = auditsArray.filter((audit: any) =>
            audit.auditUniverseItemId && userEntityIds.includes(audit.auditUniverseItemId)
          );
          setAudits(filteredAudits);
        } else {
          setAudits(auditsArray);
        }
      } catch (e) {
        console.error('Failed to fetch process owner audits', e);
      }
    };
    fetchCurrentUserAndAudits();
  }, [currentUser?.auditUniverseEntities]);

  // Calculate statistics
  const stats = {
    totalAudits: audits.length,
    completedAudits: audits.filter(audit => audit.status === 'Closed').length,
    inProgressAudits: audits.filter(audit => audit.status === 'In Progress').length,
    plannedAudits: audits.filter(audit => audit.status === 'Planned').length,
    totalFindings: audits.reduce((sum, audit) => sum + (audit.findings?.length || 0), 0),
    highRiskFindings: audits.reduce((sum, audit) =>
      sum + (audit.findings?.filter((f: any) => f.riskLevel === 'High').length || 0), 0
    ),
  };

  // Status distribution for pie chart
  const statusData = [
    { name: 'Planned', value: stats.plannedAudits, color: '#FFA500' },
    { name: 'In Progress', value: stats.inProgressAudits, color: '#2196F3' },
    { name: 'Closed', value: stats.completedAudits, color: '#4CAF50' },
  ].filter(item => item.value > 0);

  // Monthly trend data for line chart
  const monthlyData = React.useMemo(() => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthAudits = audits.filter(audit => {
        const auditDate = new Date(audit.startDate || (audit as any).createdAt || '');
        return auditDate.getMonth() === month.getMonth() &&
          auditDate.getFullYear() === month.getFullYear();
      });

      last6Months.push({
        month: monthName,
        audits: monthAudits.length,
        findings: monthAudits.reduce((sum, audit) => sum + (audit.findings?.length || 0), 0)
      });
    }

    return last6Months;
  }, [audits]);

  return (
    <Box key={version} sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0F1A2B', mb: 3 }}>
        Process Owner Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Audit statistics and trends for your assigned business entities.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Statistics Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Audits
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.totalAudits}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completedAudits}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.inProgressAudits}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Findings
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.totalFindings}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Audit Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Audit Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="audits"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Audits"
                />
                <Line
                  type="monotone"
                  dataKey="findings"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Findings"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Report Files Section */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Report Files
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/reports-executive')}>
              View Executive Reports
            </Button>
            <Button variant="outlined" onClick={() => navigate('/reports-files')}>
              View Report Files
            </Button>
          </Box>
        </Paper>

      </Box>
    </Box>
  );
};

export default ProcessOwnerPage;
