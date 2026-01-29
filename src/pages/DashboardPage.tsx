import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
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
  Security as SecurityIcon,
  Error as ErrorIcon,
  Hub as HubIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { Page } from '../types/navigation';

type UserRole = 'Admin' | 'System Administrator' | 'Executive' | 'Manager' | 'Auditor' | 'ProcessOwner' | 'CAE';

// ========== STAT CARD COMPONENT ==========
const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, onClick }) => (
  <Card
    elevation={2}
    sx={{
      height: '100%',
      borderLeft: `5px solid ${color}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      } : {},
    }}
    onClick={onClick}
  >
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

// ========== ADMIN DASHBOARD ==========
interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const AdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    users: 0,
    audits: 0,
    findings: 0,
    systemHealth: 'Checking...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const audits = await api.getAudits();
        setStats({
          users: 0,
          audits: audits?.length || 0,
          findings: 0,
          systemHealth: 'Operational',
        });
      } catch (e) {
        console.error('Failed to fetch admin data', e);
        setStats(prev => ({ ...prev, systemHealth: 'Error' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activityData = [
    { name: 'Mon', audits: 4, findings: 2 },
    { name: 'Tue', audits: 3, findings: 5 },
    { name: 'Wed', audits: 7, findings: 3 },
    { name: 'Thu', audits: 5, findings: 4 },
    { name: 'Fri', audits: 8, findings: 6 },
    { name: 'Sat', audits: 2, findings: 1 },
    { name: 'Sun', audits: 3, findings: 2 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        System Administration Dashboard
      </Typography>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <StatCard
            title="System Health"
            value={stats.systemHealth}
            icon={<SettingsIcon fontSize="large" />}
            color={stats.systemHealth === 'Operational' ? '#2e7d32' : '#d32f2f'}
            onClick={() => onNavigate('system-settings')}
          />
        </Box>
        <Box>
          <StatCard
            title="Manage Users"
            value="→"
            icon={<GroupIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => onNavigate('users')}
          />
        </Box>
        <Box>
          <StatCard
            title="Manage Roles"
            value="→"
            icon={<SecurityIcon fontSize="large" />}
            color="#ed6c02"
            onClick={() => onNavigate('roles')}
          />
        </Box>
        <Box>
          <StatCard
            title="Integrations"
            value={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    '&:hover': { textDecoration: 'underline', color: 'primary.main' } 
                  }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('system-settings'); }}
                >
                  <LinkIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Connected Systems
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    '&:hover': { textDecoration: 'underline', color: 'primary.main' } 
                  }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('system-settings'); }}
                >
                  <LinkIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Data Imports
                </Typography>
              </Box>
            }
            icon={<HubIcon fontSize="large" />}
            color="#1976d2"
          />
        </Box>
      </Box>

      {/* Charts Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Weekly Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="audits" fill="#1976d2" name="Audits Created" />
                <Bar dataKey="findings" fill="#d32f2f" name="Findings Logged" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Box>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" fullWidth onClick={() => onNavigate('users')} startIcon={<GroupIcon />}>
                Manage Users
              </Button>
              <Button variant="contained" fullWidth onClick={() => onNavigate('roles')} startIcon={<SecurityIcon />}>
                Manage Roles
              </Button>
              <Button variant="outlined" fullWidth onClick={() => onNavigate('audit-logs')} startIcon={<HistoryIcon />}>
                View Audit Logs
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

// ========== MANAGER DASHBOARD ==========
const ManagerDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditData, findingData] = await Promise.all([
          api.getAudits(),
          api.getFindings?.(),
        ]);
        setAudits(Array.isArray(auditData) ? auditData : []);
        setFindings(Array.isArray(findingData) ? findingData : []);
      } catch (e) {
        console.error('Failed to fetch manager data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const auditsByStatus = audits.reduce((acc: any, audit: any) => {
    const status = audit.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const findingsBySeverity = findings.reduce((acc: any, finding: any) => {
    const severity = finding.severity || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(auditsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const severityData = Object.entries(findingsBySeverity).map(([severity, count]) => ({
    name: severity,
    value: count,
  }));

  const COLORS = ['#2e7d32', '#1976d2', '#ed6c02', '#d32f2f', '#9c27b0'];

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        Audit Manager Dashboard
      </Typography>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <StatCard
            title="Assigned Audits"
            value={audits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate('audits')}
          />
        </Box>
        <Box>
          <StatCard
            title="Open Findings"
            value={findings.filter(f => f.status !== 'Closed').length}
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
            onClick={() => onNavigate('findings')}
          />
        </Box>
        <Box>
          <StatCard
            title="In Progress"
            value={audits.filter(a => a.status === 'In Progress').length}
            icon={<ScheduleIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Box>
        <Box>
          <StatCard
            title="Completed"
            value={audits.filter(a => a.status === 'Closed' || a.status === 'Finalized').length}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Box>
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Audit Status Overview
            </Typography>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No audit data available</Typography>
            )}
          </Paper>
        </Box>

        <Box>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Findings by Severity
            </Typography>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d32f2f" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No finding data available</Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Recent Audits */}
      <Box sx={{ mt: 3 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Audits
            </Typography>
            <Button onClick={() => onNavigate('audits')} size="small">
              View All
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <CircularProgress />
          ) : audits.slice(0, 5).length > 0 ? (
            <List>
              {audits.slice(0, 5).map((audit, idx) => (
                <React.Fragment key={audit.id}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={audit.auditName}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={audit.auditType} size="small" />
                          <Chip label={audit.status} size="small" color={audit.status === 'Closed' ? 'success' : 'default'} />
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No audits assigned yet</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

// ========== AUDITOR DASHBOARD ==========
const AuditorDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [myAudits, setMyAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAudits();
        setMyAudits(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch auditor data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeAudits = myAudits.filter(a => a.status === 'In Progress').length;
  const completedAudits = myAudits.filter(a => a.status === 'Closed' || a.status === 'Finalized').length;

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        My Audits Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <StatCard
            title="My Audits"
            value={myAudits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate('execution')}
          />
        </Box>
        <Box>
          <StatCard
            title="In Progress"
            value={activeAudits}
            icon={<ScheduleIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Box>
        <Box>
          <StatCard
            title="Completed"
            value={completedAudits}
            icon={<CheckCircleIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Box>
        <Box>
          <StatCard
            title="Pending Review"
            value={myAudits.filter(a => a.status === 'Review').length}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      {/* My Tasks */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          My Current Tasks
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <CircularProgress />
        ) : (
          <Alert severity="info">
            You have <strong>{activeAudits} active audits</strong> in progress. Click "My Audits" to view execution details.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

// ========== CAE DASHBOARD ==========
const CAEDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalAudits: 0,
    criticalFindings: 0,
    openIssues: 0,
    overallRisk: 'Medium',
  });
  const [audits, setAudits] = useState<any[]>([]);
  const [kris, setKris] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditsData, findingsData, krisData, tasksData, notificationsData] = await Promise.all([
          api.getAudits(),
          api.getFindings?.() || Promise.resolve([]),
          api.getKris?.() || Promise.resolve([]),
          api.getMyTasks?.() || Promise.resolve([]),
          api.getNotifications?.() || Promise.resolve([]),
        ]);

        const auditsArray = Array.isArray(auditsData) ? auditsData : [];
        setAudits(auditsArray);
        setKris(Array.isArray(krisData) ? krisData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);

        const criticalCount = (findingsData || []).filter((f: any) => f.severity === 'Critical').length;
        setStats({
          totalAudits: auditsArray.length,
          criticalFindings: criticalCount,
          openIssues: (findingsData || []).filter((f: any) => f.status !== 'Closed').length,
          overallRisk: criticalCount > 5 ? 'High' : 'Medium',
        });
      } catch (e) {
        console.error('Failed to fetch CAE data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare Audit Progress Data
  const auditStatusCounts = audits.reduce((acc: any, audit: any) => {
    const status = audit.status || 'Planned';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const auditStatusData = Object.entries(auditStatusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare KRI Data
  const kriStatusCounts = kris.reduce((acc: any, kri: any) => {
    const status = kri.status || 'Stable';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const kriStatusData = Object.entries(kriStatusCounts).map(([name, value]) => ({ name, value }));
  const KRI_COLORS: Record<string, string> = {
    'Critical': '#d32f2f',
    'Warning': '#ed6c02',
    'Stable': '#2e7d32',
    'Low': '#2e7d32',
    'Medium': '#ed6c02',
    'High': '#d32f2f'
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        Chief Audit Executive Dashboard
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Overall Risk Level: {stats.overallRisk}</strong> - Review critical findings and escalations below.
      </Alert>

      {/* Navigation Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Box>
          <StatCard
            title="Audit Plans"
            value="View"
            icon={<DescriptionIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate('audit-plans')}
          />
        </Box>
        <Box>
          <StatCard
            title="Risk Escalation"
            value={stats.overallRisk === 'High' ? 'Action Req' : 'Stable'}
            icon={<WarningIcon fontSize="large" />}
            color={stats.overallRisk === 'High' ? '#d32f2f' : '#ed6c02'}
            onClick={() => onNavigate('risk-register')}
          />
        </Box>
        <Box>
          <StatCard
            title="Compliance"
            value="Manage"
            icon={<GavelIcon fontSize="large" />}
            color="#2e7d32"
            onClick={() => onNavigate('compliance-standards')}
          />
        </Box>
        <Box>
          <StatCard
            title="Reports"
            value="View"
            icon={<BarChartIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => onNavigate('reports-executive')}
          />
        </Box>
      </Box>

      {/* Main Executive Summary Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        
        {/* 1. Audit Progress Snapshot */}
        <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" /> Audit Progress Snapshot
          </Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            {auditStatusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={auditStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {auditStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">No active audit data available.</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 2. Risk Key Indicators (KRIs) */}
        <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" /> Key Risk Indicators (KRIs)
          </Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            {kriStatusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={kriStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {kriStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={KRI_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">No Key Risk Indicators tracked yet.</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 3. Tasks & Alerts */}
        <Paper elevation={2} sx={{ p: 3, gridColumn: { md: '1 / -1' } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="secondary" /> Tasks & Alerts
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            
            {/* Tasks Column */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                My Pending Tasks
              </Typography>
              {tasks.length > 0 ? (
                <List dense>
                  {tasks.slice(0, 5).map((task: any) => (
                    <ListItem key={task.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={task.title} secondary={task.dueDate ? `Due: ${task.dueDate}` : 'No due date'} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>No pending tasks assigned to you.</Alert>
              )}
            </Box>

            {/* Alerts/Notifications Column */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Recent Alerts
              </Typography>
              {notifications.length > 0 ? (
                <List dense>
                  {notifications.slice(0, 5).map((notif: any) => (
                    <ListItem key={notif.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ErrorIcon color={notif.read ? 'disabled' : 'error'} fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={notif.message} 
                        primaryTypographyProps={{ fontWeight: notif.read ? 'normal' : 'bold' }}
                        secondary={new Date(notif.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ mt: 1 }}>No new alerts or notifications.</Alert>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// ========== MAIN DASHBOARD COMPONENT ==========
const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const userRole = (localStorage.getItem('userRole') || 'Auditor') as UserRole;

  const renderDashboard = () => {
    switch (userRole) {
      case 'System Administrator':
      case 'Admin':
        return <AdminDashboard onNavigate={onNavigate} />;
      case 'Manager':
        return <ManagerDashboard onNavigate={onNavigate} />;
      case 'Auditor':
        return <AuditorDashboard onNavigate={onNavigate} />;
      case 'CAE':
        return <CAEDashboard onNavigate={onNavigate} />;
      case 'Executive':
        return <CAEDashboard onNavigate={onNavigate} />;
      default:
        return <AuditorDashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderDashboard()}
    </Box>
  );
};

export default DashboardPage;
