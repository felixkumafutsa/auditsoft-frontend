import React, { useState } from 'react';
import {
  Box,
  Drawer,
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
  Settings as SettingsIcon
} from '@mui/icons-material';

export type Page = 
  | 'dashboard' 
  | 'audits' 
  | 'audits-new' 
  | 'audits-executed' 
  | 'findings' 
  | 'findings-draft' 
  | 'profile' 
  | 'users' 
  | 'roles' 
  | 'audit-logs'
  | 'execution';

interface SidebarProps {
  userRole: string;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, currentPage, onNavigate, mobileOpen, onDrawerToggle }) => {
  const [auditsOpen, setAuditsOpen] = useState(true);
  const [findingsOpen, setFindingsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const isAuditor = userRole === 'Auditor' || userRole === 'auditor';
  const canSeeAdmin = ['Admin', 'Manager', 'CAE', 'Chief Audit Executive'].includes(userRole);
  const drawerWidth = 240;

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
        <ListItemButton selected={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')}>
          <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setAuditsOpen(!auditsOpen)}>
          <ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Audits" />
          {auditsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={auditsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audits'} onClick={() => onNavigate('audits')}>
              <ListItemIcon><ListIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
              <ListItemText primary="All Audits" />
            </ListItemButton>
            {isAuditor && (
              <>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audits-new'} onClick={() => onNavigate('audits-new')}>
                  <ListItemIcon><AddIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="New Audits" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audits-executed'} onClick={() => onNavigate('audits-executed')}>
                  <ListItemIcon><CheckCircleIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Executed Audits" />
                </ListItemButton>
              </>
            )}
          </List>
        </Collapse>

        <ListItemButton onClick={() => setFindingsOpen(!findingsOpen)}>
          <ListItemIcon><FactCheckIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Findings" />
          {findingsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={findingsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'findings'} onClick={() => onNavigate('findings')}>
              <ListItemIcon><ListIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
              <ListItemText primary="All Findings" />
            </ListItemButton>
            {isAuditor && (
              <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'findings-draft'} onClick={() => onNavigate('findings-draft')}>
                <ListItemIcon><DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                <ListItemText primary="Draft Findings" />
              </ListItemButton>
            )}
          </List>
        </Collapse>

        {canSeeAdmin && (
          <>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <ListItemButton onClick={() => setAdminOpen(!adminOpen)}>
              <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Administration" />
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
                <ListItemButton sx={{ pl: 4 }} selected={currentPage === 'audit-logs'} onClick={() => onNavigate('audit-logs')}>
                  <ListItemIcon><HistoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
                  <ListItemText primary="Audit Logs" />
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
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0F1A2B', color: 'white' },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0F1A2B', color: 'white' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;