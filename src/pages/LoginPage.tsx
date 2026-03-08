// src/pages/LoginPage.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { LoginForm } from '../components/LoginForm';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >
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
