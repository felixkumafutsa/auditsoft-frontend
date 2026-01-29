import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { Page } from '../types/navigation';

// --- Types ---
type UserRole = 'Admin' | 'Executive' | 'Manager' | 'Auditor' | 'ProcessOwner';

// --- Shared Components ---
const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <Card elevation={2} sx={{ height: '100%', borderLeft: `5px solid ${color}` }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// --- Sub-Dashboards ---

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ users: 0, roles: 0, logs: 0, systemHealth: 'Checking...' });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch real data from the API
        const [sysStats, auditLogs] = await Promise.all([
          api.getSystemStats(),
          api.getAuditLogs() // Assuming backend supports a limit
        ]);
        
        setStats({
          users: sysStats.totalUsers || 0,
          roles: sysStats.totalRoles || 0,
          logs: sysStats.totalLogs || 0,
          systemHealth: 'Operational' // This could be derived from an API health check
        });
        setLogs(auditLogs || []);
      } catch (e) { 
        console.error("Failed to fetch admin data", e);
        setStats(prev => ({ ...prev, systemHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Total Users" value={loading ? <CircularProgress size={20} /> : stats.users} icon={<GroupIcon fontSize="large" />} color="#1976d2" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Active Roles" value={stats.roles} icon={<SecurityIcon fontSize="large" />} color="#9c27b0" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="System Health" value={stats.systemHealth} icon={<SettingsIcon fontSize="large" />} color="#2e7d32" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard title="Total Audit Logs" value={loading ? <CircularProgress size={20} /> : stats.logs} icon={<HistoryIcon fontSize="large" />} color="#ed6c02" />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">System Configuration & Management</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Quick access to core administrative functions.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button onClick={() => onNavigate('users')} variant="outlined" fullWidth startIcon={<GroupIcon />} sx={{ py: 2, justifyContent: 'flex-start' }}>
                Manage Users
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button onClick={() => onNavigate('roles')} variant="outlined" fullWidth startIcon={<SecurityIcon />} sx={{ py: 2, justifyContent: 'flex-start' }}>
                Manage Roles
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button variant="outlined" fullWidth startIcon={<SettingsIcon />} sx={{ py: 2, justifyContent: 'flex-start' }}>
                System Settings
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button onClick={() => onNavigate('audit-logs')} variant="outlined" fullWidth startIcon={<HistoryIcon />} sx={{ py: 2, justifyContent: 'flex-start' }}>
                View Audit Logs
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight="bold">Recent System Activity</Typography>
            <Button onClick={() => onNavigate('audit-logs')} size="small" endIcon={<HistoryIcon />}>View All</Button>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {loading ? <CircularProgress /> : (
            <List dense>
              {logs.map((log, index) => (
                <React.Fragment key={log.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <HistoryIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={log.action} 
                      secondary={`User ID: ${log.userId} - ${new Date(log.timestamp).toLocaleString()}`}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const ExecutiveDashboard: React.FC = () => {
  const data = [
    { name: 'Strategic', risk: 80 },
    { name: 'Operational', risk: 45 },
    { name: 'Financial', risk: 30 },
    { name: 'Compliance', risk: 60 },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 3 }}>
        <StatCard title="Overall Risk Score" value="High" icon={<WarningIcon fontSize="large" />} color="#d32f2f" />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <StatCard title="Open Audits" value="4" icon={<AssignmentIcon fontSize="large" />} color="#1976d2" />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <StatCard title="Critical Findings" value="2" icon={<WarningIcon fontSize="large" />} color="#ed6c02" />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <StatCard title="Compliance" value="85%" icon={<CheckCircleIcon fontSize="large" />} color="#2e7d32" />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Paper elevation={2} sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Risk Exposure by Category</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk" fill="#d32f2f" name="Risk Score" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={2} sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Audit Plan Status</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Completed', value: 5, color: '#2e7d32' },
                  { name: 'In Progress', value: 3, color: '#1976d2' },
                  { name: 'Planned', value: 4, color: '#9e9e9e' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {[
                  { name: 'Completed', value: 5, color: '#2e7d32' },
                  { name: 'In Progress', value: 3, color: '#1976d2' },
                  { name: 'Planned', value: 4, color: '#9e9e9e' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

interface ManagerDashboardProps {
  onNavigate: (page: Page) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({ toPlan: 0, toReview: 0, utilization: '85%' });
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const audits = await api.getAudits();
        if (Array.isArray(audits)) {
          const planned = audits.filter((a: any) => a.status === 'Planned');
          const inReview = audits.filter((a: any) => a.status === 'Review');
          
          setStats({
            toPlan: planned.length,
            toReview: inReview.length,
            utilization: '85%' // Mock for now
          });
          setReviews(inReview);
        }
      } catch (error) {
        console.error("Failed to fetch manager data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Audits to Plan" value={stats.toPlan} icon={<ScheduleIcon fontSize="large" />} color="#1976d2" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Fieldwork Reviews" value={stats.toReview} icon={<AssignmentIcon fontSize="large" />} color="#ed6c02" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Team Utilization" value={stats.utilization} icon={<GroupIcon fontSize="large" />} color="#2e7d32" />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Pending Reviews</Typography>
          {loading ? <CircularProgress /> : (
            <List>
              {reviews.length === 0 ? <Typography sx={{p:2}}>No pending reviews.</Typography> : reviews.map((audit) => (
                <React.Fragment key={audit.id}>
                  <ListItem>
                    <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary={`${audit.audit_name} - Fieldwork`} 
                      secondary={`Status: ${audit.status} | Due: ${audit.end_date}`} 
                    />
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => onNavigate('execution')}
                    >
                      Review
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const AuditorDashboard: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard title="My Active Audits" value="2" icon={<AssignmentIcon fontSize="large" />} color="#1976d2" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard title="Pending Tasks" value="5" icon={<ScheduleIcon fontSize="large" />} color="#ed6c02" />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">My Tasks</Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Review IT General Controls Evidence" 
                secondary="Due: 2023-11-15 | Priority: High" 
              />
              <Button size="small" variant="outlined">Start</Button>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="action" /></ListItemIcon>
              <ListItemText 
                primary="Draft Findings for Q3 Financial Audit" 
                secondary="Due: 2023-11-20 | Priority: Medium" 
              />
              <Button size="small" variant="outlined">Resume</Button>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

const ProcessOwnerDashboard: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Assigned Findings" value="3" icon={<WarningIcon fontSize="large" />} color="#d32f2f" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Action Plans Due" value="1" icon={<ScheduleIcon fontSize="large" />} color="#ed6c02" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard title="Closed Items" value="12" icon={<CheckCircleIcon fontSize="large" />} color="#2e7d32" />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">Remediation Actions Required</Typography>
          <List>
            <ListItem>
              <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="Update Password Policy Configuration" 
                secondary="Finding #102 | Due: Tomorrow" 
              />
              <Button size="small" variant="contained" color="primary">Update Status</Button>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Provide Evidence for Backup Restoration" 
                secondary="Finding #105 | Due: Next Week" 
              />
              <Button size="small" variant="outlined">Upload Evidence</Button>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<UserRole>('Admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const renderDashboard = () => {
    switch (role) {
      case 'Admin': return <AdminDashboard onNavigate={onNavigate} />;
      case 'Executive': return <ExecutiveDashboard />;
      case 'Manager': return <ManagerDashboard onNavigate={onNavigate} />;
      case 'Auditor': return <AuditorDashboard />;
      case 'ProcessOwner': return <ProcessOwnerDashboard />;
      default: return <AdminDashboard onNavigate={function (page: Page): void {
        throw new Error('Function not implemented.');
      } } />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header & Role Switcher */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#0F1A2B">
            {role === 'Executive' ? 'Executive' : role} Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Overview & Key Metrics
          </Typography>
        </Box>
        
        <Box display="flex" gap={1} alignItems="center">
          <IconButton onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        renderDashboard()
      )}
    </Box>
  );
};

export default DashboardPage;