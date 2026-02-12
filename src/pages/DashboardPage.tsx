import React, { useEffect, useState } from "react";
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
} from "@mui/material";
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
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
  }>({
    auditTrend: [],
    auditStatusDistribution: [],
    tasks: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardStats = await api.getDashboardStats();
        const tasks = await api.getMyTasks();
        const notifications = await (api as any).getNotifications?.();

        setStats({
          auditTrend: dashboardStats.auditTrend || [],
          auditStatusDistribution: dashboardStats.auditStatusDistribution || [],
          tasks: Array.isArray(tasks) ? tasks : [],
          notifications: Array.isArray(notifications) ? notifications : [],
        });
      } catch (e) {
        console.error("Failed to fetch manager data", e);
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

      {/* Top Section: Quick Links/Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 4,
        }}
      >
        <Card elevation={2}>
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

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.auditStatusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string | number;
                    percent?: number;
                  }) =>
                    `${name || ""} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.auditStatusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Middle Section: Quick Actions */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 3,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<AssignmentIcon />}
          onClick={() => onNavigate("audit-plans")}
          sx={{ py: 2, bgcolor: "#1976d2" }}
        >
          View All Audit Plans
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<DescriptionIcon />}
          onClick={() => onNavigate("audit-programs")}
          sx={{ py: 2, bgcolor: "#2e7d32" }}
        >
          Manage Audit Programs
        </Button>
      </Box>

      {/* Bottom Section: Tasks & Notifications */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Tasks
            </Typography>
            <List>
              {stats.tasks.length > 0 ? (
                stats.tasks.map((task: any, index) => (
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

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <List>
              {stats.notifications.length > 0 ? (
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
      </Box>
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
        console.error("Failed to fetch admin data", e);
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title="System Health"
            value={stats.systemHealth}
            icon={<SettingsIcon fontSize="large" />}
            color={stats.systemHealth === "Operational" ? "#2e7d32" : "#d32f2f"}
            onClick={() => onNavigate("system-settings")}
          />
        </Box>
        <Box>
          <StatCard
            title="Manage Users"
            value="→"
            icon={<GroupIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => onNavigate("users")}
          />
        </Box>
        <Box>
          <StatCard
            title="Manage Roles"
            value="→"
            icon={<SecurityIcon fontSize="large" />}
            color="#ed6c02"
            onClick={() => onNavigate("roles")}
          />
        </Box>
        <Box>
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
        </Box>
      </Box>

      {/* Charts Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
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
        console.error("Failed to fetch manager data", e);
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
    value: count,
  }));

  const severityData = Object.entries(findingsBySeverity).map(
    ([severity, count]) => ({
      name: severity,
      value: count,
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title="Assigned Audits"
            value={audits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate("audits")}
          />
        </Box>
        <Box>
          <StatCard
            title="Open Findings"
            value={findings.filter((f) => f.status !== "Closed").length}
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
            onClick={() => onNavigate("findings")}
          />
        </Box>
        <Box>
          <StatCard
            title="In Progress"
            value={audits.filter((a) => a.status === "In Progress").length}
            icon={<ScheduleIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Box>
        <Box>
          <StatCard
            title="Completed"
            value={
              audits.filter(
                (a) => a.status === "Closed" || a.status === "Finalized",
              ).length
            }
            icon={<CheckCircleIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Box>
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">
                No audit data available
              </Typography>
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
              <Typography color="textSecondary">
                No finding data available
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Recent Audits */}
      <Box sx={{ mt: 3 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
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
                            color={
                              audit.status === "Closed" ? "success" : "default"
                            }
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
        console.error("Failed to fetch auditor data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeAudits = myAudits.filter(
    (a) => a.status === "In Progress",
  ).length;
  const completedAudits = myAudits.filter(
    (a) => a.status === "Closed" || a.status === "Finalized",
  ).length;

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        My Audits Dashboard
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title="My Audits"
            value={myAudits.length}
            icon={<AssignmentIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate("execution")}
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
            value={myAudits.filter((a) => a.status === "Review").length}
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
            You have <strong>{activeAudits} active audits</strong> in progress.
            Click "My Audits" to view execution details.
          </Alert>
        )}
      </Paper>
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
        setKris(Array.isArray(krisData) ? krisData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setNotifications(
          Array.isArray(notificationsData) ? notificationsData : [],
        );
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
        console.error("Failed to fetch CAE data", e);
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
    ([name, value]) => ({ name, value }),
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
    <Box>
      <Typography
        variant="h4"
        sx={{ color: "#0F1A2B", fontWeight: "bold", mb: 3 }}
      >
        Chief Audit Executive Dashboard
      </Typography>

      {/* Navigation Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Box>
          <StatCard
            title="Audit Plans"
            value="View"
            icon={<DescriptionIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => onNavigate("audit-plans")}
          />
        </Box>
        <Box>
          <StatCard
            title="Risk Escalation"
            value={stats.overallRisk === "High" ? "Action Req" : "Stable"}
            icon={<WarningIcon fontSize="large" />}
            color={stats.overallRisk === "High" ? "#d32f2f" : "#ed6c02"}
            onClick={() => onNavigate("risk-register")}
          />
        </Box>
        <Box>
          <StatCard
            title="Compliance"
            value="Manage"
            icon={<GavelIcon fontSize="large" />}
            color="#2e7d32"
            onClick={() => onNavigate("compliance-standards")}
          />
        </Box>
        <Box>
          <StatCard
            title="Reports"
            value="View"
            icon={<BarChartIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => onNavigate("reports-executive")}
          />
        </Box>
      </Box>

      {/* Main Executive Summary Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* 1. Audit Progress Snapshot */}
        <Paper
          elevation={2}
          sx={{ p: 3, display: "flex", flexDirection: "column" }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <TrendingUpIcon color="primary" /> Audit Progress Snapshot
          </Typography>
          <Box sx={{ height: 300, width: "100%" }}>
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
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {auditStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography color="textSecondary">
                  No active audit data available.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 2. Risk Key Indicators (KRIs) */}
        <Paper
          elevation={2}
          sx={{ p: 3, display: "flex", flexDirection: "column" }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <WarningIcon color="error" /> Key Risk Indicators (KRIs)
          </Typography>
          <Box sx={{ height: 300, width: "100%" }}>
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
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {kriStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={KRI_COLORS[entry.name] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Typography color="textSecondary">
                  No Key Risk Indicators tracked yet.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 3. Pending Actions */}
        <Paper elevation={2} sx={{ p: 3, gridColumn: { md: "1 / -1" } }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <AssignmentIcon color="secondary" /> Pending Actions
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {/* Audits Pending Approval Column */}
            <Box>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Audits Pending Approval
              </Typography>
              {auditsPendingApproval.length > 0 ? (
                <List dense>
                  {auditsPendingApproval.slice(0, 5).map((audit: any) => (
                    <ListItem key={audit.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={audit.auditName}
                        secondary={`Due: ${audit.endDate || "N/A"}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No audits pending approval.
                </Alert>
              )}
            </Box>

            {/* Findings & Evidence for Review Column */}
            <Box>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Findings & Evidence for Review
              </Typography>
              {findingsForReview.length > 0 || evidenceForReview.length > 0 ? (
                <List dense>
                  {findingsForReview.slice(0, 3).map((notif: any) => (
                    <ListItem key={notif.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ErrorIcon
                          color={notif.read ? "disabled" : "error"}
                          fontSize="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={notif.message}
                        primaryTypographyProps={{
                          fontWeight: notif.read ? "normal" : "bold",
                        }}
                        secondary={`Finding: ${new Date(notif.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                  {evidenceForReview.slice(0, 2).map((item: any) => (
                    <ListItem key={item.id}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <DescriptionIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Evidence for ${item.auditProgramId}`}
                        secondary={`Status: ${item.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success" sx={{ mt: 1 }}>
                  No items require review.
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// ========== PROCESS OWNER DASHBOARD ==========
const ProcessOwnerDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(
    null,
  );
  const [actionPlansOpen, setActionPlansOpen] = useState(false);
  const [stats, setStats] = useState({
    assignedFindings: 0,
    openActionPlans: 0,
    overdueItems: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const [allFindings, allAudits] = await Promise.all([
        (api as any).getFindings?.() || Promise.resolve([]),
        api.getAudits()
      ]);

      // Filter findings where the user is assigned or related to their entity's audits
      const myFindings = Array.isArray(allFindings) ? allFindings.filter((f: any) => {
        // If the finding is assigned to this user
        if (f.assignedToId === currentUser?.id) return true;
        // Or if the finding belongs to an audit that is owned by this process owner
        const relatedAudit = allAudits.find((a: any) => a.id === f.auditId);
        return relatedAudit?.auditUniverse?.ownerId === currentUser?.id;
      }) : [];

      const overdueActionPlans = await api.getOverdueActionPlans?.() || [];

      setFindings(myFindings);

      setStats({
        assignedFindings: myFindings.length,
        openActionPlans: 0, // Would need to fetch action plans count
        overdueItems: Array.isArray(overdueActionPlans) ? overdueActionPlans.length : 0,
      });
    } catch (error) {
      console.error("Failed to fetch process owner data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionPlans = (findingId: number) => {
    setSelectedFindingId(findingId);
    setActionPlansOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 200 },
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === "Critical"
              ? "error"
              : params.value === "High"
                ? "warning"
                : "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenActionPlans(params.row.id)}
            sx={{ fontSize: "0.75rem" }}
          >
            Remediation / Evidence
          </Button>
        </Box>
      ),
    },
  ];

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
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Assigned Findings"
          value={stats.assignedFindings}
          icon={<AssignmentIcon fontSize="large" />}
          color="#1976d2"
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

      {/* Findings Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          My Assigned Findings
        </Typography>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={findings}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            loading={loading}
          />
        </Box>
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
        console.error("Failed to fetch board data", error);
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
