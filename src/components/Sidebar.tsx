import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  FactCheck as FactCheckIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
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
  Chat as ChatIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { Page } from '../types/navigation';

interface SidebarProps {
  userRole: string;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, currentPage, onNavigate, mobileOpen, onDrawerToggle }) => {
  // State for collapsible menus
  const [auditsOpen, setAuditsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [fieldWorkOpen, setFieldWorkOpen] = useState(false);

  const isSystemAdmin = userRole === 'System Administrator' || userRole === 'Admin';
  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isManager = userRole === 'Manager' || userRole === 'Audit Manager' || userRole === 'manager';
  const isAuditor = userRole === 'Auditor';

  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64, bgcolor: '#0a121e' }}>
        {/* System Logo */}
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Box component="span" sx={{ bgcolor: '#1976d2', width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A</Box>
           AuditSoft
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      <List component="nav">
        {/* Dashboard - Common */}
        <ListItemButton selected={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')}>
          <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton selected={currentPage === 'messaging'} onClick={() => onNavigate('messaging')}>
          <ListItemIcon><ChatIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Messages" />
        </ListItemButton>

        <ListItemButton selected={currentPage === 'comments'} onClick={() => onNavigate('comments')}>
          <ListItemIcon><QuestionAnswerIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Comments" />
        </ListItemButton>

        {/* Auditor Specific Menu */}
        {isAuditor && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <ListItemButton selected={currentPage === 'audits'} onClick={() => onNavigate('audits')}>
              <ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="My Audits" />
            </ListItemButton>
          </>
        )}

        {/* ================= SYSTEM ADMIN MENU ================= */}
        {isSystemAdmin && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            {/* Users & Roles */}
            <ListItemButton onClick={() => setAdminOpen(!adminOpen)}>
              <ListItemIcon><GroupIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Users & Roles" />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'users'} onClick={() => onNavigate('users')}>
                  <ListItemIcon><GroupIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Users" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'roles'} onClick={() => onNavigate('roles')}>
                  <ListItemIcon><SecurityIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Roles" />
                </ListItemButton>
              </List>
            </Collapse>

            <ListItemButton selected={currentPage === 'workflow-config'} onClick={() => onNavigate('workflow-config')}>
              <ListItemIcon><TuneIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Workflow Config" />
            </ListItemButton>

            <ListItemButton selected={currentPage === 'audit-logs'} onClick={() => onNavigate('audit-logs')}>
              <ListItemIcon><HistoryIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Audit Logs" />
            </ListItemButton>

            <ListItemButton selected={currentPage === 'system-settings'} onClick={() => onNavigate('system-settings')}>
              <ListItemIcon><SystemSettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="System Settings" />
            </ListItemButton>
          </>
        )}

        {/* ================= CAE MENU ================= */}
        {isCAE && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />

            {/* Audits */}
            <ListItemButton onClick={() => setAuditsOpen(!auditsOpen)}>
              <ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Audits" />
              {auditsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={auditsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-plans'} onClick={() => onNavigate('audit-plans')}>
                  <ListItemIcon><DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Audit Plans" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-programs'} onClick={() => onNavigate('audit-programs')}>
                  <ListItemIcon><LibraryBooksIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Audit Programs" />
                </ListItemButton>
                {(isCAE || isManager) && (
                  <>
                    <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-universe'} onClick={() => onNavigate('audit-universe')}>
                      <ListItemIcon><HubIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                      <ListItemText primary="Audit Universe" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'continuous-audits'} onClick={() => onNavigate('continuous-audits')}>
                      <ListItemIcon><HistoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                      <ListItemText primary="Continuous Audits" />
                    </ListItemButton>
                  </>
                )}
              </List>
            </Collapse>

            {/* Reports */}
            <ListItemButton onClick={() => setReportsOpen(!reportsOpen)}>
              <ListItemIcon><BarChartIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="View Reports" />
              {reportsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'reports-executive'} onClick={() => onNavigate('reports-executive')}>
                  <ListItemIcon><PieChartIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Executive" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'reports-operational'} onClick={() => onNavigate('reports-operational')}>
                  <ListItemIcon><BarChartIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Operational" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'reports-custom'} onClick={() => onNavigate('reports-custom')}>
                  <ListItemIcon><TuneIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Custom Builder" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Risk Management */}
            <ListItemButton onClick={() => setRiskOpen(!riskOpen)}>
              <ListItemIcon><WarningIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Risk Management" />
              {riskOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={riskOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'risk-register'} onClick={() => onNavigate('risk-register')}>
                  <ListItemIcon><ListIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Register Risk" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'risk-kri'} onClick={() => onNavigate('risk-kri')}>
                  <ListItemIcon><TimelineIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="KRIs" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'risk-heatmaps'} onClick={() => onNavigate('risk-heatmaps')}>
                  <ListItemIcon><MapIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Heatmaps" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Compliance */}
            <ListItemButton onClick={() => setComplianceOpen(!complianceOpen)}>
              <ListItemIcon><GavelIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Compliance" />
              {complianceOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={complianceOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'compliance-standards'} onClick={() => onNavigate('compliance-standards')}>
                  <ListItemIcon><LibraryBooksIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Standards" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'compliance-controls'} onClick={() => onNavigate('compliance-controls')}>
                  <ListItemIcon><RuleIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Controls" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'compliance-coverage'} onClick={() => onNavigate('compliance-coverage')}>
                  <ListItemIcon><ShieldIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Coverage" />
                </ListItemButton>
              </List>
            </Collapse>

            <ListItemButton selected={currentPage === 'findings'} onClick={() => onNavigate('findings')}>
              <ListItemIcon><FactCheckIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Findings" />
            </ListItemButton>

            <ListItemButton selected={currentPage === 'evidence'} onClick={() => onNavigate('evidence')}>
              <ListItemIcon><FolderIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Evidence" />
            </ListItemButton>
          </>
        )}

        {/* ================= DEFAULT / OTHER ROLES (e.g. Process Owner) ================= */}
        {!isSystemAdmin && !isCAE && !isAuditor && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            <ListItemButton onClick={() => setAuditsOpen(!auditsOpen)}>
              <ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Audits" />
              {auditsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={auditsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-plans'} onClick={() => onNavigate('audit-plans')}>
                  <ListItemIcon><DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Audit Plans" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-programs'} onClick={() => onNavigate('audit-programs')}>
                  <ListItemIcon><LibraryBooksIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Audit Programs" />
                </ListItemButton>
                {(isCAE || isManager) && (
                  <>
                    <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-universe'} onClick={() => onNavigate('audit-universe')}>
                      <ListItemIcon><HubIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                      <ListItemText primary="Audit Universe" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'continuous-audits'} onClick={() => onNavigate('continuous-audits')}>
                      <ListItemIcon><HistoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                      <ListItemText primary="Continuous Audits" />
                    </ListItemButton>
                  </>
                )}
              </List>
            </Collapse>

            <ListItemButton onClick={() => setFieldWorkOpen(!fieldWorkOpen)}>
              <ListItemIcon><WorkIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Field Work" />
              {fieldWorkOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={fieldWorkOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'findings'} onClick={() => onNavigate('findings')}>
                  <ListItemIcon><FactCheckIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Findings" />
                </ListItemButton>
                {isAuditor && (
                  <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'findings-draft'} onClick={() => onNavigate('findings-draft')}>
                    <ListItemIcon><DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                    <ListItemText primary="Draft Findings" />
                  </ListItemButton>
                )}
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'evidence'} onClick={() => onNavigate('evidence')}>
                  <ListItemIcon><FolderIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Evidence" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ListItemButton selected={currentPage === 'profile'} onClick={() => onNavigate('profile')}>
          <ListItemIcon><PersonIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <Box sx={{ height: '100%', bgcolor: '#0F1A2B', color: 'white' }}>
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
