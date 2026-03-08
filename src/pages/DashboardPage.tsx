import React, { useEffect, useState, useMemo } from "react";
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Grid from '@mui/material/Grid';
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
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import { Page } from "../types/navigation";
import ActionPlansModule from "../components/ActionPlansModule";
import { getStatusColor, getStatusHexColor } from "../utils/statusColors";
import RiskHeatmap from "../components/RiskHeatmap";

type UserRole =
  | "Admin"
  | "System Administrator"
  | "Executive"
  | "Manager"
  | "Auditor"
  | "ProcessOwner"
  | "CAE";


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
      height: "100%",
      borderLeft: `5px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": onClick
        ? {
          transform: "translateY(-4px)",
          boxShadow: 4,
        }
        : {},
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
        <Box sx={{ color: color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

// ========== AUDIT MANAGER DASHBOARD ==========
const AuditManagerDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<{
    auditTrend: any[];
    auditStatusDistribution: any[];
    tasks: any[];
    notifications: any[];
    auditPlansCount: number;
    programsCount: number;
    remediationCount: number;
  }>({
    auditTrend: [],
    auditStatusDistribution: [],
    tasks: [],
    notifications: [],
    auditPlansCount: 0,
    programsCount: 0,
    remediationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, tasks, notifications] = await Promise.all([
          api.getDashboardStats(),
          api.getMyTasks(),
          (api as any).getNotifications?.() || Promise.resolve([]),
        ]);

        // Get counts for cards
        const audits = await api.getAudits();
        const auditPlansCount = Array.isArray(audits) ? audits.filter(a => a.status === 'Planned' || a.status === 'Approved' || a.status === 'In Progress').length : 0;
        const programsCount = dashboardStats.auditStatusDistribution?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;
        const remediationCount = 0; // TODO: Add actual remediation count when available

        setStats({
          auditTrend: dashboardStats.auditTrend || [],
          auditStatusDistribution: dashboardStats.auditStatusDistribution || [],
          tasks: Array.isArray(tasks) ? tasks : [],
          notifications: Array.isArray(notifications) ? notifications : [],
          auditPlansCount,
          programsCount,
          remediationCount,
        });
      } catch (e) {
        console.error('Error fetching audit manager dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Audit Manager Dashboard
      </Typography>

      {/* Top Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={3} 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 6 
              } 
            }}
            onClick={() => onNavigate("audit-plans")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.auditPlansCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Audit Plans
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={3} 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 6 
              } 
            }}
            onClick={() => onNavigate("audit-programs")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.programsCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Programs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card 
            elevation={3} 
            sx={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 6 
              } 
            }}
            onClick={() => onNavigate("remediation")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <GavelIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.remediationCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Remediation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <BarChartIcon sx={{ fontSize: 48, color: '#388e3c', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.auditTrend.reduce((sum: number, item: any) => sum + (item.audits || 0), 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Audits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area - Charts stacked on left, tasks/notifications on right */}
      <Grid container spacing={3}>
        {/* Charts Section - 8 columns wide */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Audit Planning Snapshot */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Planning Snapshot
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.auditTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="audits"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Audit Status Distribution */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Status Distribution
              </Typography>
              <Box sx={{ width: "100%", py: 2 }}>
                {stats.auditStatusDistribution.length > 0 ? (
                  <Grid container spacing={2} justifyContent="center" alignItems="center">
                    {stats.auditStatusDistribution.map((status) => {
                      const totalAudits = stats.auditStatusDistribution.reduce((sum: number, item: any) => sum + (item.value as number), 0);
                      return (
                        <Grid size={{ xs: 6, sm: 4, md: 4 }} key={status.name}>
                          <GaugeChart
                            title={status.name}
                            value={status.value as number}
                            total={totalAudits}
                            color={getStatusHexColor(status.name)}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={150}>
                    <Typography color="textSecondary">No data for audit status.</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side Section - 4 columns wide */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* My Tasks */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Tasks
              </Typography>
              <List>
                {loading ? (
                  <CircularProgress />
                ) : stats.tasks.length > 0 ? (
                  stats.tasks.slice(0, 5).map((task: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={task.dueDate}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No pending tasks" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Notifications
              </Typography>
              <List>
                {loading ? (
                  <CircularProgress />
                ) : stats.notifications.length > 0 ? (
                  stats.notifications.slice(0, 5).map((n: any) => {
                    const isAuditReport =
                      typeof n.title === "string" &&
                      (n.title.toLowerCase().includes("audit closed") ||
                        n.title.toLowerCase().includes("report"));
                    const Icon =
                      n.type === "action_required"
                        ? WarningIcon
                        : n.type === "success"
                          ? CheckCircleIcon
                          : n.type === "error"
                            ? ErrorIcon
                            : n.type === "warning"
                              ? WarningIcon
                              : DescriptionIcon;
                    return (
                      <ListItem key={n.id}>
                        <ListItemIcon>
                          <Icon
                            color={
                              n.type === "success"
                                ? "success"
                                : n.type === "error"
                                  ? "error"
                                  : n.type === "warning" || n.type === "action_required"
                                    ? "warning"
                                    : "primary"
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={n.title}
                          secondary={
                            <>
                              {n.message}
                              {isAuditReport && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ display: "block" }}
                                >
                                  A report was generated after an audit closed.
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    );
                  })
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent notifications" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// ========== ADMIN DASHBOARD ==========
interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const AdminDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    users: 0,
    audits: 0,
    findings: 0,
    systemHealth: "Checking...",
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
          systemHealth: "Operational",
        });
      } catch (e) {
        setStats((prev) => ({ ...prev, systemHealth: "Error" }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activityData = [
    { name: "Mon", audits: 4, findings: 2 },
    { name: "Tue", audits: 3, findings: 5 },
    { name: "Wed", audits: 7, findings: 3 },
    { name: "Thu", audits: 5, findings: 4 },
    { name: "Fri", audits: 8, findings: 6 },
    { name: "Sat", audits: 2, findings: 1 },
    { name: "Sun", audits: 3, findings: 2 },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        System Administration Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="System Health"
            value={stats.systemHealth}
            icon={<SettingsIcon fontSize="large" />}
            color={stats.systemHealth === "Operational" ? "#2e7d32" : "#d32f2f"}
            onClick={() => onNavigate("system-settings")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Manage Users"
            value="→"
            icon={<GroupIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => onNavigate("users")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Manage Roles"
            value="→"
            icon={<SecurityIcon fontSize="large" />}
            color="#ed6c02"
            onClick={() => onNavigate("roles")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Integrations"
            value={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  mt: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("system-settings");
                  }}
                >
                  <LinkIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Connected
                  Systems
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.875rem",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("system-settings");
                  }}
                >
                  <LinkIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Data Imports
                </Typography>
              </Box>
            }
            icon={<HubIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Weekly Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="audits" stroke="#1976d2" name="Audits Created" strokeWidth={2} />
                <Line type="monotone" dataKey="findings" stroke="#d32f2f" name="Findings Logged" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => onNavigate("users")}
                startIcon={<GroupIcon />}
              >
                Manage Users
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => onNavigate("roles")}
                startIcon={<SecurityIcon />}
              >
                Manage Roles
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => onNavigate("audit-logs")}
                startIcon={<HistoryIcon />}
              >
                View Audit Logs
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
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
        // Error handling without logging
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const auditsByStatus = audits.reduce((acc: any, audit: any) => {
    const status = audit.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const findingsBySeverity = findings.reduce((acc: any, finding: any) => {
    const severity = finding.severity || "unknown";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(auditsByStatus).map(([status, count]) => ({
    name: status,
    value: count as number,
  }));

  const severityData = Object.entries(findingsBySeverity).map(
    ([severity, count]) => ({
      name: severity,
      value: count as number,
    }),
  );

  const COLORS = ["#2e7d32", "#1976d2", "#ed6c02", "#d32f2f", "#9c27b0"];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Audit Manager Dashboard
      </Typography>

      {/* Stats Grid */}
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assigned Audits"
            value={audits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate("audits")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Open Findings"
            value={findings.filter((f) => f.status !== "Closed").length}
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
            onClick={() => onNavigate("findings")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={audits.filter((a) => a.status === "In Progress").length}
            icon={<ScheduleIcon fontSize="large" />}
            color={getStatusHexColor("In Progress")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={
              audits.filter(
                (a) => a.status === "Closed" || a.status === "Finalized",
              ).length
            }
            icon={<CheckCircleIcon fontSize="large" />}
            color={getStatusHexColor("Completed")}
          />
        </Grid>
      </Grid>

      {/* Resource Management */}
      <Box sx={{ mb: 4 }}>
        {/* Time logging removed - access via navigation */}
      </Box>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon color="primary" /> Audit Process & Performance
            </Typography>
            <Box sx={{ width: "100%", py: 2 }}>
              {statusData.length > 0 ? (
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                  {statusData.map((status) => (
                    <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={status.name}>
                      <GaugeChart
                        title={status.name}
                        value={status.value}
                        total={audits.length}
                        color={getStatusHexColor(status.name)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={150}>
                  <Typography color="textSecondary">No data for audit status.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
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
              <Typography color="textSecondary">
                No finding data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Audits */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight="bold">
                Recent Audits
              </Typography>
              <Button onClick={() => onNavigate("audits")} size="small">
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
                          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                            <Chip label={audit.auditType} size="small" />
                            <Chip
                              label={audit.status}
                              size="small"
                              color={getStatusColor(audit.status)}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                No audits assigned yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box >
  );
};

// ========== AUDITOR DASHBOARD ==========
const AuditorDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [myAudits, setMyAudits] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditsData, notificationsData, tasksData] = await Promise.all([
          api.getAudits(),
          api.getNotifications?.() || Promise.resolve([]),
          api.getMyTasks?.() || Promise.resolve([]),
        ]);
        
        // Debug: Log the received data
        console.log('Auditor Dashboard - Received audits:', auditsData);
        console.log('Auditor Dashboard - Current user:', JSON.parse(localStorage.getItem('user') || '{}'));
        
        setMyAudits(Array.isArray(auditsData) ? auditsData : []);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (e) {
        console.error('Error fetching auditor dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process weekly audit data for the line chart
  const weeklyAuditData = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const weeklyCounts = [0, 0, 0, 0];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    myAudits.forEach(audit => {
      if (audit.createdAt) {
        const auditDate = new Date(audit.createdAt);
        // Only include audits from current month
        if (auditDate.getMonth() === currentMonth && auditDate.getFullYear() === currentYear) {
          const dayOfMonth = auditDate.getDate();
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
          if (weekOfMonth >= 1 && weekOfMonth <= 4) {
            weeklyCounts[weekOfMonth - 1]++;
          }
        }
      }
    });

    return weeks.map((week, index) => ({
      week,
      audits: weeklyCounts[index]
    }));
  }, [myAudits]);

  // Process audit distribution data for pie chart
  const auditDistributionData = useMemo(() => {
    const distribution = {
      'In Progress': 0,
      'Completed': 0,
      'Under Review': 0,
      'Planned': 0
    };

    myAudits.forEach(audit => {
      if (audit.status === 'Closed' || audit.status === 'Finalized') {
        distribution['Completed']++;
      } else if (distribution.hasOwnProperty(audit.status)) {
        distribution[audit.status as keyof typeof distribution]++;
      }
    });

    // Filter out categories with zero values for better pie chart display
    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: getStatusHexColor(name === 'Completed' ? 'Closed' : name)
      }));
  }, [myAudits]);

  const activeAudits = myAudits.filter(
    (a) => a.status === "In Progress",
  ).length;
  const completedAudits = myAudits.filter(
    (a) => a.status === "Closed" || a.status === "Finalized",
  ).length;

  const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f'];

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Auditor Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="My Audits"
            value={myAudits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate("execution")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={activeAudits}
            icon={<ScheduleIcon fontSize="large" />}
            color={getStatusHexColor("In Progress")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={completedAudits}
            icon={<CheckCircleIcon fontSize="large" />}
            color={getStatusHexColor("Completed")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Review"
            value={myAudits.filter((a) => a.status === "Under Review").length}
            icon={<TrendingUpIcon fontSize="large" />}
            color={getStatusHexColor("Under Review")}
          />
        </Grid>
      </Grid>

      {/* Main Content Area - Charts wider than right side */}
      <Grid container spacing={3}>
        {/* Charts Section - 8 columns wide */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Weekly Audit Logs Chart */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Audit Logs
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyAuditData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="audits" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  name="Number of Audits"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Audit Distribution Pie Chart */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Audit Distribution
            </Typography>
            {auditDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={auditDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const name = props.name || '';
                      const percent = props.percent || 0;
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {auditDistributionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="textSecondary" textAlign="center">
                  No audit data available for distribution chart
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Side Section - 4 columns wide */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Recent Tasks */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Recent Tasks
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <CircularProgress />
            ) : tasks.length > 0 ? (
              <List dense>
                {tasks.slice(0, 5).map((task: any, index: number) => (
                  <React.Fragment key={task.id || index}>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title || task.auditName || 'Audit Task'}
                        secondary={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : task.status}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You have <strong>{activeAudits} active audits</strong> in progress.
                Click "My Audits" to view execution details.
              </Alert>
            )}
          </Paper>

          {/* Notifications */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Recent Notifications
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loading ? (
              <CircularProgress />
            ) : notifications.length > 0 ? (
              <List dense>
                {notifications.slice(0, 5).map((n: any) => {
                  const Icon =
                    n.type === "action_required"
                      ? WarningIcon
                      : n.type === "success"
                        ? CheckCircleIcon
                        : n.type === "error"
                          ? ErrorIcon
                          : n.type === "warning"
                            ? WarningIcon
                            : DescriptionIcon;
                  return (
                    <React.Fragment key={n.id}>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Icon
                            color={
                              n.type === "success"
                                ? "success"
                                : n.type === "error"
                                  ? "error"
                                  : n.type === "warning" || n.type === "action_required"
                                    ? "warning"
                                    : "primary"
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={n.title}
                          secondary={n.message}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: n.isRead ? 'normal' : 'bold'
                          }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                No recent notifications.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Custom Gauge component utilizing Recharts PieChart
// Custom Authentic SVG Speed Gauge
const GaugeChart = ({ value, total, title, color }: { value: number, total: number, title: string, color: string }) => {
  const percentage = total > 0 ? value / total : 0;

  const dashArray = 157.1; // Circumference of semicircle (r=50) -> Math.PI * 50
  const dashOffset = dashArray - (percentage * dashArray);

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // Animation duration in milliseconds
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutCubic easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(startValue + easeProgress * (endValue - startValue));

      setDisplayValue(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue); // Ensure it ends exactly on the value
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 140, mx: 'auto', my: 1 }}>
      <svg width="140" height="90" viewBox="0 0 140 90">
        {/* Background track */}
        <path
          d="M 20 80 A 50 50 0 0 1 120 80"
          fill="none"
          stroke="#f0f2f5"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value track */}
        <path
          d="M 20 80 A 50 50 0 0 1 120 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dashArray} ${dashArray}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <Box sx={{ textAlign: 'center', mt: -3 }}>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#0F1A2B', lineHeight: 1 }}>
          {displayValue}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

const CAEDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalAudits: 0,
    criticalFindings: 0,
    openIssues: 0,
    overallRisk: "Medium",
  });
  const [audits, setAudits] = useState<any[]>([]);
  const [kris, setKris] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          auditsData,
          findingsData,
          krisData,
          tasksData,
          notificationsData,
          evidenceData,
        ] = await Promise.all([
          api.getAudits(),
          api.getFindings?.() || Promise.resolve([]),
          api.getKris?.() || Promise.resolve([]),
          api.getMyTasks?.() || Promise.resolve([]),
          api.getNotifications?.() || Promise.resolve([]),
          api.getEvidenceList?.(0) || Promise.resolve([]), // Fetching all evidence, assuming programId 0 means all
        ]);

        const auditsArray = Array.isArray(auditsData) ? auditsData : [];
        setAudits(auditsArray);
        setNotifications(
          Array.isArray(notificationsData) ? notificationsData : [],
        );
        const risksArray = Array.isArray(krisData) ? krisData : [];
        setKris(risksArray);
        const allRisks = await api.getRisks();
        setRisks(Array.isArray(allRisks) ? allRisks : []);
        setEvidence(Array.isArray(evidenceData) ? evidenceData : []);

        const criticalCount = (findingsData || []).filter(
          (f: any) => f.severity === "Critical",
        ).length;
        setStats({
          totalAudits: auditsArray.length,
          criticalFindings: criticalCount,
          openIssues: (findingsData || []).filter(
            (f: any) => f.status !== "Closed",
          ).length,
          overallRisk: criticalCount > 5 ? "High" : "Medium",
        });
      } catch (e) {
        // Error handling without logging
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare Audit Progress Data
  const auditStatusCounts = audits.reduce((acc: any, audit: any) => {
    const status = audit.status || "Planned";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const auditStatusData = Object.entries(auditStatusCounts).map(
    ([name, value]) => ({ name, value: value as number }),
  );
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Prepare KRI Data
  const kriStatusCounts = kris.reduce((acc: any, kri: any) => {
    const status = kri.status || "Stable";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const kriStatusData = Object.entries(kriStatusCounts).map(
    ([name, value]) => ({ name, value }),
  );
  const KRI_COLORS: Record<string, string> = {
    Critical: "#d32f2f",
    Warning: "#ed6c02",
    Stable: "#2e7d32",
    Low: "#2e7d32",
    Medium: "#ed6c02",
    High: "#d32f2f",
  };

  const auditsPendingApproval = audits.filter(
    (audit) =>
      audit.status === "Planned" || audit.status === "Pending Approval",
  );
  const findingsForReview = notifications.filter(
    (notification) => notification.type === "finding_review_request",
  );
  const evidenceForReview = evidence.filter(
    (item) => item.status === "Pending Review",
  );

  return (
    <Box sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ color: "#0F1A2B", fontWeight: "bold" }}
          >
            Chief Audit Executive Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time organizational risk and audit lifecycle overview.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => onNavigate("reports-executive")}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#1A237E', '&:hover': { bgcolor: '#0D1440' } }}
          >
            Executive Summary
          </Button>
        </Box>
      </Box>

      {/* Top Section: High Impact Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Strategic Audit Plans"
            value={stats.totalAudits}
            icon={<DescriptionIcon fontSize="large" />}
            color="#1A237E"
            onClick={() => onNavigate("audit-plans")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Audit Coverage Range"
            value="Inter-Dept"
            icon={<BusinessIcon fontSize="large" />}
            color="#006064"
            onClick={() => onNavigate("audit-universe")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Escalated Critical Findings"
            value={stats.criticalFindings}
            icon={<ErrorIcon fontSize="large" />}
            color={stats.criticalFindings > 0 ? "#D32F2F" : "#2E7D32"}
            onClick={() => onNavigate("findings")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Organizational Risk Rating"
            value={stats.overallRisk}
            icon={<SecurityIcon fontSize="large" />}
            color={stats.overallRisk === "High" ? "#D32F2F" : "#ED6C02"}
            onClick={() => onNavigate("risk-register")}
          />
        </Grid>
      </Grid>

      {/* Main Governance Content */}
      <Grid container spacing={4}>
        {/* Left Column: Risk & Strategy */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ mb: 4 }}>
            <RiskHeatmap risks={risks} />
          </Box>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon color="primary" /> Audit Process & Performance
            </Typography>
            <Box sx={{ width: "100%", py: 2 }}>
              {auditStatusData.length > 0 ? (
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                  {auditStatusData.map((status, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <GaugeChart
                        title={status.name}
                        value={status.value}
                        total={stats.totalAudits}
                        color={getStatusHexColor(status.name)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={150}>
                  <Typography color="textSecondary">No data for audit status.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Execution & Pending Actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
            >
              <AssignmentIcon color="primary" /> Executive Pending Actions
            </Typography>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ borderBottom: '2px solid #1A237E', pb: 1, mb: 2 }}>
                Audit Plans for Approval ({auditsPendingApproval.length})
              </Typography>
              {auditsPendingApproval.length > 0 ? (
                <List dense sx={{ mb: 3 }}>
                  {auditsPendingApproval.slice(0, 4).map((audit: any) => (
                    <ListItem key={audit.id} sx={{ mb: 1, border: '1px solid #f0f0f0', borderRadius: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ScheduleIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={audit.auditName}
                        sx={{ '& .MuiListItemText-primary': { fontSize: '0.85rem', fontWeight: 'bold' } }}
                        secondary={`Created: ${audit.startDate ? new Date(audit.startDate).toLocaleDateString() : "N/A"}`}
                      />
                      <Button size="small" variant="outlined" onClick={() => onNavigate("audit-plans")}>Review</Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Clean Slate: No pending plans.</Alert>
              )}

              <Typography variant="subtitle2" color="error" fontWeight="bold" sx={{ borderBottom: '2px solid #D32F2F', pb: 1, mb: 2 }}>
                Critical Review Requests ({findingsForReview.length + evidenceForReview.length})
              </Typography>

              <List dense>
                {findingsForReview.slice(0, 2).map((notif: any) => (
                  <ListItem key={notif.id} sx={{ mb: 1, bgcolor: '#fff5f5', borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <WarningIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={notif.message}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.8rem' } }}
                      secondary="Finding Validation"
                    />
                  </ListItem>
                ))}
                {evidenceForReview.slice(0, 2).map((item: any) => (
                  <ListItem key={item.id} sx={{ mb: 1, bgcolor: '#f5f7ff', borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <DescriptionIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sign-off: ${item.auditProgramId}`}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '0.8rem' } }}
                      secondary="Evidence Quality Check"
                    />
                  </ListItem>
                ))}
              </List>

              {(findingsForReview.length === 0 && evidenceForReview.length === 0) && (
                <Box textAlign="center" py={4}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.light', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">All caught up!</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onNavigate("notifications")}
              sx={{ py: 1, borderRadius: 2 }}
            >
              All Governance Alerts
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ========== PROCESS OWNER DASHBOARD ==========
const ProcessOwnerDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [findings, setFindings] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(
    null,
  );
  const [actionPlansOpen, setActionPlansOpen] = useState(false);
  const [stats, setStats] = useState({
    assignedFindings: 0,
    openActionPlans: 0,
    overdueItems: 0,
    totalAudits: 0,
    completedAudits: 0,
    inProgressAudits: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const [allFindings, ownerAudits] = await Promise.all([
        (api as any).getFindings?.() || Promise.resolve([]),
        api.getOwnerAudits() // Get audits owned by this process owner
      ]);

      // Filter findings where the user is assigned or related to their entity's audits
      const myFindings = Array.isArray(allFindings) ? allFindings.filter((f: any) => {
        // If the finding is assigned to this user
        if (f.assignedToId === currentUser?.id) return true;
        // Or if the finding belongs to an audit that is owned by this process owner
        const relatedAudit = ownerAudits.find((a: any) => a.id === f.auditId);
        return relatedAudit?.auditUniverse?.ownerId === currentUser?.id;
      }) : [];

      const overdueActionPlans = await api.getOverdueActionPlans?.() || Promise.resolve([]);

      setFindings(myFindings);
      setAudits(ownerAudits || []);

      // Calculate audit statistics
      const auditStats = (ownerAudits || []).reduce((acc: any, audit: any) => {
        acc.total += 1;
        if (audit.status === 'Completed' || audit.status === 'Closed') {
          acc.completed += 1;
        } else if (audit.status === 'In Progress') {
          acc.inProgress += 1;
        }
        return acc;
      }, { total: 0, completed: 0, inProgress: 0 });

      setStats({
        assignedFindings: myFindings.length,
        openActionPlans: 0, // Would need to fetch action plans count
        overdueItems: Array.isArray(overdueActionPlans) ? overdueActionPlans.length : 0,
        totalAudits: auditStats.total,
        completedAudits: auditStats.completed,
        inProgressAudits: auditStats.inProgress,
      });
    } catch (error) {
      // Error handling without logging
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionPlans = (findingId: number) => {
    setSelectedFindingId(findingId);
    setActionPlansOpen(true);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Process Owner Dashboard
      </Typography>

      {/* Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Audits"
          value={stats.totalAudits}
          icon={<AssessmentIcon fontSize="large" />}
          color="#1976d2"
        />
        <StatCard
          title="Completed Audits"
          value={stats.completedAudits}
          icon={<CheckCircleIcon fontSize="large" />}
          color="#2e7d32"
        />
        <StatCard
          title="In Progress Audits"
          value={stats.inProgressAudits}
          icon={<TrendingUpIcon fontSize="large" />}
          color="#ed6c02"
        />
        <StatCard
          title="Assigned Findings"
          value={stats.assignedFindings}
          icon={<AssignmentIcon fontSize="large" />}
          color="#9c27b0"
        />
        <StatCard
          title="Open Action Plans"
          value={stats.openActionPlans}
          icon={<TrendingUpIcon fontSize="large" />}
          color="#ed6c02"
        />
        <StatCard
          title="Overdue Items"
          value={stats.overdueItems}
          icon={<WarningIcon fontSize="large" />}
          color="#d32f2f"
        />
      </Box>

      {/* Recent Audits Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Audits on Your Entities
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Audit Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.slice(0, 5).map((audit: any) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.auditName}</TableCell>
                  <TableCell>{audit.auditType}</TableCell>
                  <TableCell>
                    <Chip
                      label={audit.status}
                      size="small"
                      color={
                        audit.status === 'Completed' || audit.status === 'Closed' ? 'success' :
                          audit.status === 'In Progress' ? 'warning' :
                            audit.status === 'Planned' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>{audit.auditUniverse?.entityName || 'N/A'}</TableCell>
                  <TableCell>{audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onNavigate("audits")}
                    >
                      View Details
                    </Button>
                  </TableCell>
                  {/* Audit details navigation - fixed for dynamic paths */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {audits.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="text.secondary">
              No audits found for your entities
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Findings by Severity Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Findings by Severity
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={findings.reduce((acc: any[], finding) => {
                  const severity = finding.severity || 'Unknown';
                  const existing = acc.find(item => item.name === severity);
                  if (existing) {
                    existing.value += 1;
                  } else {
                    acc.push({ name: severity, value: 1 });
                  }
                  return acc;
                }, [])}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'].map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Findings by Status Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Findings by Status
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={findings.reduce((acc: any[], finding) => {
              const status = finding.status || 'Unknown';
              const existing = acc.find(item => item.status === status);
              if (existing) {
                existing.count += 1;
              } else {
                acc.push({ status, count: 1 });
              }
              return acc;
            }, [])}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Action Plans Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Remediation Progress
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h4" color="success.dark" fontWeight="bold">
              {findings.filter(f => f.status === 'Closed' || f.status === 'Completed').length}
            </Typography>
            <Typography variant="body2" color="success.dark">
              Completed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h4" color="warning.dark" fontWeight="bold">
              {findings.filter(f => f.status === 'In Progress' || f.status === 'Action Assigned').length}
            </Typography>
            <Typography variant="body2" color="warning.dark">
              In Progress
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="h4" color="error.dark" fontWeight="bold">
              {findings.filter(f => f.status === 'Open' || f.status === 'Identified').length}
            </Typography>
            <Typography variant="body2" color="error.dark">
              Pending
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Recent Findings List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Recent Findings
        </Typography>
        <List>
          {findings.slice(0, 5).map((finding) => (
            <ListItem key={finding.id} divider>
              <ListItemIcon>
                <AssignmentIcon color={finding.severity === 'Critical' ? 'error' : finding.severity === 'High' ? 'warning' : 'primary'} />
              </ListItemIcon>
              <ListItemText
                primary={finding.description}
                secondary={`Severity: ${finding.severity} | Status: ${finding.status}`}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenActionPlans(finding.id)}
              >
                View Details
              </Button>
            </ListItem>
          ))}
          {findings.length === 0 && (
            <ListItem>
              <ListItemText primary="No findings assigned to you" />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Action Plans Module (Dialog) */}
      {selectedFindingId && (
        <ActionPlansModule
          findingId={selectedFindingId}
          open={actionPlansOpen}
          onClose={() => setActionPlansOpen(false)}
        />
      )}
    </Box>
  );
};

// ========== BOARD VIEWER DASHBOARD ==========
const BoardDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    audits: [] as any[],
    programs: [] as any[],
    findings: [] as any[],
    risks: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [audits, programs, findings, risks] = await Promise.all([
          api.getAudits(),
          api.getAllAuditPrograms(),
          api.getFindings(),
          api.getRisks(),
        ]);

        setStats({
          audits: Array.isArray(audits) ? audits : [],
          programs: Array.isArray(programs) ? programs : [],
          findings: Array.isArray(findings) ? findings : [],
          risks: Array.isArray(risks) ? risks : [],
        });
      } catch (error) {
        // Error handling without logging
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aggregations
  const auditStatusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    stats.audits.forEach((a) => {
      const status = a.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [stats.audits]);

  const findingSeverityData = React.useMemo(() => {
    const severityCounts: Record<string, number> = {};
    stats.findings.forEach((f) => {
      const severity = f.severity || "Unknown";
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });
    return Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
  }, [stats.findings]);

  const riskLevelData = React.useMemo(() => {
    const levelCounts: Record<string, number> = {};
    stats.risks.forEach(r => {
      // Assuming risk calculation or field exists, e.g., inherentRiskScore or just a level field
      // If not, we can rely on 'impact' or 'likelihood' or a combined score
      const level = r.riskLevel || r.rating || "Unknown";
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    return Object.entries(levelCounts).map(([name, value]) => ({ name, value }));
  }, [stats.risks]);

  const programData = React.useMemo(() => {
    // Maybe visualize programs by area or simply total count vs items
    return [
      { name: 'Total Programs', value: stats.programs.length },
      { name: 'Active Programs', value: stats.programs.filter(p => p.status === 'Active').length }
    ];
  }, [stats.programs]);


  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Executive Board Dashboard
      </Typography>

      <Box sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        <StatCard title="Total Audits" value={stats.audits.length} icon={<AssignmentIcon fontSize="large" />} color="#1976d2" onClick={() => onNavigate('audits')} />
        <StatCard title="Total Risks" value={stats.risks.length} icon={<WarningIcon fontSize="large" />} color="#d32f2f" onClick={() => onNavigate('risk-register')} />
        <StatCard title="Open Findings" value={stats.findings.filter(f => f.status !== 'Closed').length} icon={<WarningIcon fontSize="large" />} color="#ed6c02" onClick={() => onNavigate('findings')} />
        <StatCard title="Audit Programs" value={stats.programs.length} icon={<DescriptionIcon fontSize="large" />} color="#2e7d32" onClick={() => onNavigate('audit-programs')} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

        {/* Audit Status Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Audit Status Overview</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={auditStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {auditStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Findings Severity Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Findings by Severity</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={findingSeverityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Findings" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Risk Distribution Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Risk Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskLevelData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#82ca9d"
                label={({ name, value }) => `${name}: ${value}`}
                dataKey="value"
              >
                {riskLevelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Audit Programs Chart */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Audit Programs Status</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

      </Box>
    </Box>
  );
};

const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = (user?.role || "Auditor") as UserRole;

  const renderDashboard = () => {
    switch (userRole) {
      case "System Administrator":
      case "Admin":
        return <AdminDashboard onNavigate={onNavigate} />;
      case "Manager":
        return <AuditManagerDashboard onNavigate={onNavigate} />;
      case "Auditor":
        return <AuditorDashboard onNavigate={onNavigate} />;
      case "CAE":
        return <CAEDashboard onNavigate={onNavigate} />;
      case "Executive":
        return <BoardDashboard onNavigate={onNavigate} />;
      case "ProcessOwner":
        return <ProcessOwnerDashboard onNavigate={onNavigate} />;
      default:
        return <AuditorDashboard onNavigate={onNavigate} />;
    }
  };

  return <Box sx={{ width: "100%" }}>{renderDashboard()}</Box>;
};

export default DashboardPage;
