// src/pages/LoginPage.tsx
import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import { LoginForm } from '../components/LoginForm';
import { useColorMode } from '../contexts/ColorModeContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        position: 'relative',
        transition: 'background 0.3s ease'
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton onClick={toggleColorMode} color="inherit" sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 2,
            '&:hover': { bgcolor: 'action.hover' }
          }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>
      <LoginForm onLoginSuccess={onLoginSuccess} />
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          px: 3,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Typography variant="body2" color="text.primary" sx={{ order: { xs: 2, sm: 1 } }}>
          © 2026 Auditsoft. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ order: { xs: 1, sm: 2 } }}>
          Developed by Kapeleta
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
