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
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    <AppBar position="fixed" sx={{ bgcolor: '#0F1A2B', zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {isMobile && (
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
        )}
        
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4, cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
           <Box component="span" sx={{ bgcolor: '#1976d2', width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1, fontWeight: 'bold', color: 'white' }}>A</Box>
           <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
             AUDITSOFT
           </Typography>
        </Box>

        {/* Global Navigation - Could be broad sections if needed, for now spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={() => onNavigate('notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenu}>
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
