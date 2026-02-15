import React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  List as ListIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  FactCheck as FactCheckIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  SettingsApplications as SystemSettingsIcon,
  LibraryBooks as LibraryBooksIcon,
  BarChart as BarChartIcon,
  Warning as WarningIcon,
  Gavel as GavelIcon,
  Folder as FolderIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Rule as RuleIcon,
  Shield as ShieldIcon,
  PieChart as PieChartIcon,
  Hub as HubIcon,
  Work as WorkIcon,
  RateReview as RateReviewIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Page } from '../types/navigation';

interface ContextualTopBarProps {
  userRole: string;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const ContextualTopBar: React.FC<ContextualTopBarProps> = ({ userRole, currentPage, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Menu States
  const [auditsAnchor, setAuditsAnchor] = React.useState<null | HTMLElement>(null);
  const [reportsAnchor, setReportsAnchor] = React.useState<null | HTMLElement>(null);
  const [riskAnchor, setRiskAnchor] = React.useState<null | HTMLElement>(null);
  const [complianceAnchor, setComplianceAnchor] = React.useState<null | HTMLElement>(null);
  const [adminAnchor, setAdminAnchor] = React.useState<null | HTMLElement>(null);
  const [usersAnchor, setUsersAnchor] = React.useState<null | HTMLElement>(null);
  const [fieldWorkAnchor, setFieldWorkAnchor] = React.useState<null | HTMLElement>(null);

  const isSystemAdmin = userRole === 'System Administrator' || userRole === 'Admin';
  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isAuditor = userRole === 'Auditor';
  const isManager = userRole === 'Manager' || userRole === 'Audit Manager';
  const isProcessOwner = userRole === 'ProcessOwner' || userRole === 'Process Owner';
  const isBoardViewer = userRole === 'BoardViewer' || userRole === 'Board Viewer' || userRole === 'Executive' || userRole === 'Executive / Board Viewer';
  const isRestricted = isProcessOwner || isBoardViewer;

  if (isMobile) return null; // Hide on mobile

  if (isRestricted) {
    return (
      <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1, zIndex: theme.zIndex.drawer }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<DashboardIcon />}
              color={currentPage === 'dashboard' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              startIcon={<PieChartIcon />}
              color={currentPage === 'reports-executive' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('reports-executive')}
            >
              Executive Reports
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // =========================================================================
  // AUDITOR VIEW
  // =========================================================================
  if (isAuditor) {
    return (
      <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1, zIndex: theme.zIndex.drawer }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<DashboardIcon />}
              color={currentPage === 'dashboard' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              startIcon={<AssignmentIcon />}
              color={currentPage === 'audits' || currentPage === 'my-audits' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('audits')}
            >
              My Audits
            </Button>
            <Button
              startIcon={<RateReviewIcon />}
              color={currentPage === 'comments' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('comments')}
            >
              Comments
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // =========================================================================
  // SYSTEM ADMINISTRATOR VIEW
  // =========================================================================
  if (isSystemAdmin) {
    return (
      <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1, zIndex: theme.zIndex.drawer }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* 1. Dashboard */}
            <Button
              startIcon={<DashboardIcon />}
              color={currentPage === 'dashboard' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>

            {/* 2. User Roles & Permissions */}
            <Button
              startIcon={<GroupIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['users', 'roles'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setUsersAnchor(e.currentTarget)}
            >
              Users & Roles
            </Button>
            <Menu
              anchorEl={usersAnchor}
              open={Boolean(usersAnchor)}
              onClose={() => setUsersAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('users'); setUsersAnchor(null); }}>
                <ListItemIcon><GroupIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Users</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('roles'); setUsersAnchor(null); }}>
                <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Roles & Permissions</ListItemText>
              </MenuItem>
            </Menu>

            {/* 3. Workflow Configuration */}
            <Button
              startIcon={<TuneIcon />}
              color={currentPage === 'workflow-config' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('workflow-config')}
            >
              Workflow Config
            </Button>

            {/* 4. Audit Logs */}
            <Button
              startIcon={<HistoryIcon />}
              color={currentPage === 'audit-logs' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('audit-logs')}
            >
              Audit Logs
            </Button>

            {/* 5. System Settings */}
            <Button
              startIcon={<SystemSettingsIcon />}
              color={currentPage === 'system-settings' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('system-settings')}
            >
              System Settings
            </Button>
            <Button
              startIcon={<RateReviewIcon />}
              color={currentPage === 'comments' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('comments')}
            >
              Comments
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // =========================================================================
  // CHIEF AUDIT EXECUTIVE (CAE) VIEW
  // =========================================================================
  if (isCAE) {
    return (
      <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1, zIndex: theme.zIndex.drawer }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* 1. Dashboard */}
            <Button
              startIcon={<DashboardIcon />}
              color={currentPage === 'dashboard' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </Button>

            {/* 2. Audits (Audit Plans, Audit Programs) */}
            <Button
              startIcon={<AssignmentIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['audit-plans', 'audit-programs', 'audit-universe', 'continuous-audits'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setAuditsAnchor(e.currentTarget)}
            >
              Audits
            </Button>
            <Menu
              anchorEl={auditsAnchor}
              open={Boolean(auditsAnchor)}
              onClose={() => setAuditsAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('audit-plans'); setAuditsAnchor(null); }}>
                <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Audit Plans</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('audit-programs'); setAuditsAnchor(null); }}>
                <ListItemIcon><LibraryBooksIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Audit Programs</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('audit-universe'); setAuditsAnchor(null); }}>
                <ListItemIcon><HubIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Audit Universe</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('continuous-audits'); setAuditsAnchor(null); }}>
                <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Continuous Audits</ListItemText>
              </MenuItem>
            </Menu>

            {/* 3. View Reports */}
            <Button
              startIcon={<BarChartIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['reports-executive', 'reports-operational', 'reports-custom'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setReportsAnchor(e.currentTarget)}
            >
              View Reports
            </Button>
            <Menu
              anchorEl={reportsAnchor}
              open={Boolean(reportsAnchor)}
              onClose={() => setReportsAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('reports-executive'); setReportsAnchor(null); }}>
                <ListItemIcon><PieChartIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Executive Reports</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('reports-operational'); setReportsAnchor(null); }}>
                <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Operational Reports</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('reports-custom'); setReportsAnchor(null); }}>
                <ListItemIcon><TuneIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Custom Report Builder</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('reports-files'); setReportsAnchor(null); }}>
                <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Stored Files</ListItemText>
              </MenuItem>
            </Menu>

            {/* 4. Risk Management */}
            <Button
              startIcon={<WarningIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['risk-register', 'risk-kri', 'risk-heatmaps'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setRiskAnchor(e.currentTarget)}
            >
              Risk Management
            </Button>
            <Menu
              anchorEl={riskAnchor}
              open={Boolean(riskAnchor)}
              onClose={() => setRiskAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('risk-register'); setRiskAnchor(null); }}>
                <ListItemIcon><ListIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Register Risk</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('risk-kri'); setRiskAnchor(null); }}>
                <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
                <ListItemText>KRIs</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('risk-heatmaps'); setRiskAnchor(null); }}>
                <ListItemIcon><MapIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Risk Heatmaps</ListItemText>
              </MenuItem>
            </Menu>

            {/* 5. Compliance & Frameworks */}
            <Button
              startIcon={<GavelIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['compliance-standards', 'compliance-controls', 'compliance-coverage'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setComplianceAnchor(e.currentTarget)}
            >
              Compliance & Frameworks
            </Button>
            <Menu
              anchorEl={complianceAnchor}
              open={Boolean(complianceAnchor)}
              onClose={() => setComplianceAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('compliance-standards'); setComplianceAnchor(null); }}>
                <ListItemIcon><LibraryBooksIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Standards Library</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('compliance-controls'); setComplianceAnchor(null); }}>
                <ListItemIcon><RuleIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Control Mapping</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('compliance-coverage'); setComplianceAnchor(null); }}>
                <ListItemIcon><ShieldIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Coverage Analysis</ListItemText>
              </MenuItem>
            </Menu>

            {/* 6. Field Work */}
            <Button
              startIcon={<WorkIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              color={['findings', 'evidence'].includes(currentPage) ? 'primary' : 'inherit'}
              onClick={(e) => setFieldWorkAnchor(e.currentTarget)}
            >
              Field Work
            </Button>
            <Menu
              anchorEl={fieldWorkAnchor}
              open={Boolean(fieldWorkAnchor)}
              onClose={() => setFieldWorkAnchor(null)}
            >
              <MenuItem onClick={() => { onNavigate('findings'); setFieldWorkAnchor(null); }}>
                <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Findings</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { onNavigate('evidence'); setFieldWorkAnchor(null); }}>
                <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Evidence</ListItemText>
              </MenuItem>
            </Menu>

            <Button
              startIcon={<RateReviewIcon />}
              color={currentPage === 'comments' ? 'primary' : 'inherit'}
              onClick={() => onNavigate('comments')}
            >
              Comments
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // =========================================================================
  // DEFAULT / OTHER ROLES VIEW (e.g. Manager)
  // =========================================================================
  return (
    <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1, zIndex: theme.zIndex.drawer }}>
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* 1. Dashboard */}
          <Button
            startIcon={<DashboardIcon />}
            color={currentPage === 'dashboard' ? 'primary' : 'inherit'}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </Button>

          {/* 2. Audits (Audit Plans, Audit Programs, Audit Universe) */}
          <Button
            startIcon={<AssignmentIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            color={['audit-plans', 'audit-programs', 'audit-universe', 'continuous-audits', 'my-audits'].includes(currentPage) ? 'primary' : 'inherit'}
            onClick={(e) => setAuditsAnchor(e.currentTarget)}
          >
            Audits
          </Button>
          <Menu
            anchorEl={auditsAnchor}
            open={Boolean(auditsAnchor)}
            onClose={() => setAuditsAnchor(null)}
          >
            {/* "My Audits" for Managers */}
            {isManager && (
              <MenuItem onClick={() => { onNavigate('my-audits'); setAuditsAnchor(null); }}>
                <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                <ListItemText>My Audits</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={() => { onNavigate('audit-plans'); setAuditsAnchor(null); }}>
              <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Audit Plans</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('audit-programs'); setAuditsAnchor(null); }}>
              <ListItemIcon><LibraryBooksIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Audit Programs</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('audit-universe'); setAuditsAnchor(null); }}>
              <ListItemIcon><HubIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Audit Universe</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('continuous-audits'); setAuditsAnchor(null); }}>
              <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Continuous Audits</ListItemText>
            </MenuItem>
          </Menu>

          {/* 3. Reports (New for Managers) */}
          <Button
            startIcon={<BarChartIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            color={['reports-executive', 'reports-operational', 'reports-custom', 'reports-files'].includes(currentPage) ? 'primary' : 'inherit'}
            onClick={(e) => setReportsAnchor(e.currentTarget)}
          >
            Reports
          </Button>
          <Menu
            anchorEl={reportsAnchor}
            open={Boolean(reportsAnchor)}
            onClose={() => setReportsAnchor(null)}
          >
            <MenuItem onClick={() => { onNavigate('reports-executive'); setReportsAnchor(null); }}>
              <ListItemIcon><PieChartIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Executive</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('reports-operational'); setReportsAnchor(null); }}>
              <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Operational</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('reports-custom'); setReportsAnchor(null); }}>
              <ListItemIcon><TuneIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Custom Builder</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('reports-files'); setReportsAnchor(null); }}>
              <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Stored Files</ListItemText>
            </MenuItem>
          </Menu>

          {/* 4. Field Work */}
          <Button
            startIcon={<WorkIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            color={['findings', 'evidence'].includes(currentPage) ? 'primary' : 'inherit'}
            onClick={(e) => setFieldWorkAnchor(e.currentTarget)}
          >
            Field Work
          </Button>
          <Menu
            anchorEl={fieldWorkAnchor}
            open={Boolean(fieldWorkAnchor)}
            onClose={() => setFieldWorkAnchor(null)}
          >
            <MenuItem onClick={() => { onNavigate('findings'); setFieldWorkAnchor(null); }}>
              <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Findings</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { onNavigate('evidence'); setFieldWorkAnchor(null); }}>
              <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Evidence</ListItemText>
            </MenuItem>
          </Menu>

          <Button
            startIcon={<RateReviewIcon />}
            color={currentPage === 'comments' ? 'primary' : 'inherit'}
            onClick={() => onNavigate('comments')}
          >
            Comments
          </Button>
        </Box>
      </Toolbar>
    </AppBar >
  );
};

export default ContextualTopBar;
