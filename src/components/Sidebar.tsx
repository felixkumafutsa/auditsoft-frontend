import React from 'react';
import {
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
import ChecklistIcon from '@mui/icons-material/Checklist';

export type Page = 'dashboard' | 'audits' | 'users' | 'roles' | 'findings' | 'execution' | 'audit-logs' | 'audit-universe';

interface SidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout }) => {
  const userRole = localStorage.getItem('userRole') || 'Auditor';

  // Role-based menu configuration
  const allMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' as Page, roles: ['Admin', 'Executive', 'Manager', 'Auditor', 'ProcessOwner', 'CAE'] },
    { text: 'Audit Universe', icon: <ChecklistIcon />, page: 'audit-universe' as Page, roles: ['Admin', 'Manager', 'CAE'] },
    { text: 'Audits', icon: <FactCheckIcon />, page: 'audits' as Page, roles: ['Admin', 'Manager', 'Executive', 'CAE'] },
    { text: 'My Audits', icon: <AssignmentIcon />, page: 'execution' as Page, roles: ['Auditor'] },
    { text: 'Findings', icon: <ReportProblemIcon />, page: 'findings' as Page, roles: ['Manager', 'Auditor', 'ProcessOwner', 'CAE'] },
    { text: 'Users', icon: <PeopleIcon />, page: 'users' as Page, roles: ['Admin'] },
    { text: 'Roles', icon: <SecurityIcon />, page: 'roles' as Page, roles: ['Admin'] },
    { text: 'Audit Logs', icon: <HistoryIcon />, page: 'audit-logs' as Page, roles: ['Admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: '#0F1A2B',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" color="inherit">
          AuditSoft
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, display: 'block' }}>
          {userRole}
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton
              onClick={() => onNavigate(item.page)}
              sx={{
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  paddingLeft: 3,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            backgroundColor: 'rgba(220, 53, 69, 0.8)',
            color: 'white',
            borderRadius: 1,
            justifyContent: 'center',
            '&:hover': { backgroundColor: '#dc3545' },
            transition: 'background-color 0.3s ease',
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 'auto', mr: 1 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
