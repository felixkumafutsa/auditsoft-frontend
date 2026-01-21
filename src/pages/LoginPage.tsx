// src/pages/LoginPage.tsx
import React from 'react';
import { Box } from '@mui/material';
import { LoginForm } from '../components/LoginForm';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      <LoginForm onLoginSuccess={onLoginSuccess} />
    </Box>
  );
};

export default LoginPage;
