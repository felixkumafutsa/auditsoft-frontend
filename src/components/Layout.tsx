import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar, { Page } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const sidebarContent = (
    <Sidebar onNavigate={handleNavigate} onLogout={onLogout} />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar for mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: '#0F1A2B',
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AuditSoft
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box sx={{ width: 250, flexShrink: 0 }}>
          {sidebarContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8f9fa',
        }}
      >
        {/* Add top padding on mobile to account for AppBar */}
        {isMobile && <Box sx={{ height: 64 }} />}

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
