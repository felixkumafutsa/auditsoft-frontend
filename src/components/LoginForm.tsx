import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import api from '../services/api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const response = await api.login(email, password);
      const user = response.user || response;
      const token = response.token || 'mock-token';
      
      // --- Robust Role Mapping ---
      // This logic handles different possible shapes of the user object from the backend.
      let role = 'Auditor'; // Default fallback
      let backendRoleName = '';

      if (user.role) { // Case 1: A simple 'role' string is returned
        backendRoleName = typeof user.role === 'string' ? user.role : user.role.roleName || '';
      } else if (user.userRoles && user.userRoles.length > 0 && user.userRoles[0].role) { // Case 2: A nested object from Prisma 'include'
        backendRoleName = user.userRoles[0].role.roleName;
      }
      
      if (backendRoleName === 'System Administrator') role = 'Admin';
      else if (backendRoleName === 'Chief Audit Executive (CAE)') role = 'CAE';
      else if (backendRoleName === 'Executive / Board Viewer') role = 'Executive';
      else if (backendRoleName === 'Audit Manager') role = 'Manager';
      else if (backendRoleName === 'Process Owner') role = 'ProcessOwner';
      else if (backendRoleName === 'Auditor') role = 'Auditor';
      else if (['Admin', 'Manager', 'Auditor', 'Executive', 'ProcessOwner', 'CAE'].includes(backendRoleName)) role = backendRoleName;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, role }));
      localStorage.setItem('userRole', role);
      setStatus('Login successful!');
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0F1A2B' }}>
            AuditSoft Login
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {status && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{status}</Alert>}

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: '#0F1A2B' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};