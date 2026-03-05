import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import logo from '../assets/logo.png';
import { useColorMode } from '../contexts/ColorModeContext';

interface GlobalTopBarProps {
  user: { name: string; role: string } | null;
  onDrawerToggle: () => void;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  unreadCount?: number;
}

const GlobalTopBar: React.FC<GlobalTopBarProps> = ({
  user,
  onDrawerToggle,
  onLogout,
  onNavigate,
  unreadCount = 0
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  const isDark = mode === 'dark';

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    onNavigate('profile');
  };

  const handleLogoutClick = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onDrawerToggle}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4, cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
          <Box
            component="img"
            src={logo}
            alt="AuditSoft Logo"
            sx={{ height: 32, mr: 1, objectFit: 'contain' }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'inherit' }}>
            AUDITSOFT
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

          {/* 🔔 Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={() => onNavigate('notifications')}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 🌙 / ☀️ Dark / Light Mode Toggle */}
          <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              color="inherit"
              onClick={toggleColorMode}
              aria-label="toggle dark/light mode"
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'rotate(20deg)' },
              }}
            >
              {isDark ? (
                <LightModeIcon sx={{ color: '#FFD54F' }} />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
          </Tooltip>

          {/* User Avatar / Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 0.5 }} onClick={handleMenu}>
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{user?.name}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{user?.role}</Typography>
            </Box>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircle />}
            </Avatar>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GlobalTopBar;
