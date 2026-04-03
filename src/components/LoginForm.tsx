import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../services/api';
import logo from '../assets/logo.png';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

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
      else if (backendRoleName === 'Chief Audit Executive (CAE)' || backendRoleName === 'Chief Auditor') role = 'CAE';
      else if (backendRoleName === 'Executive / Board Viewer' || backendRoleName === 'Board Member') role = 'Executive';
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
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 5, 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AuditSoft Logo"
            sx={{
              height: 80,
              width: 80,
              mb: 2,
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold', 
              color: 'primary.main',
              letterSpacing: '-0.5px'
            }}
          >
            AuditSoft
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
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 14px 0 rgba(144, 202, 249, 0.39)' : '0 4px 14px 0 rgba(15, 26, 43, 0.39)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};