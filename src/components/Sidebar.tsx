import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 250;

export type Page = 'dashboard' | 'audits' | 'users' | 'roles' | 'findings' | 'execution' | 'audit-logs';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout }) => {
  const userRole = localStorage.getItem('userRole') || 'Auditor';

  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' as Page, roles: ['Admin', 'Executive', 'Manager', 'Auditor', 'ProcessOwner'] },
    { text: 'My Audits', icon: <AssignmentIcon />, page: 'execution' as Page, roles: ['Auditor'] },
    { text: 'Findings', icon: <ReportProblemIcon />, page: 'findings' as Page, roles: ['Manager', 'Auditor', 'ProcessOwner'] },
    { text: 'Audits', icon: <FactCheckIcon />, page: 'audits' as Page, roles: ['Admin', 'Manager', 'Executive'] },
    { text: 'Users', icon: <PeopleIcon />, page: 'users' as Page, roles: ['Admin'] },
    { text: 'Roles', icon: <SecurityIcon />, page: 'roles' as Page, roles: ['Admin'] },
    { text: 'Audit Logs', icon: <HistoryIcon />, page: 'audit-logs' as Page, roles: ['Admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0F1A2B',
          color: 'white',
          position: 'relative',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="inherit">
          AuditSoft
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton
              onClick={() => onNavigate(item.page)}
              sx={{
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: 1,
            justifyContent: 'center',
            '&:hover': { backgroundColor: '#c82333' },
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 'auto', mr: 1 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ flex: 'none' }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
