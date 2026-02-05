import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface UserProfile {
  name: string;
  email: string;
  profilePicture?: string;
  userRoles?: { role: { roleName: string } }[];
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        setName(userProfile.name);
        setEmail(userProfile.email);
        if (userProfile.profilePicture) {
          setPreviewUrl(userProfile.profilePicture);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setSnackbar({ open: true, message: 'Failed to load profile.', severity: 'error' });
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const list = await api.getMyTasks();
        setTasks(Array.isArray(list) ? list : []);
      } catch (e) {
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('name', name);
    if (password) {
        if (password !== confirmPassword) {
            setSnackbar({ open: true, message: 'Passwords do not match.', severity: 'error' });
            return;
        }
        formData.append('password', password);
    }
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      await api.updateProfile(formData);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      // Optionally refetch profile to get new profile picture URL from server
    } catch (error) {
      console.error('Failed to update profile', error);
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  const roles = (profile?.userRoles || []).map(r => r.role?.roleName).filter(Boolean);
  const roleSet = new Set(roles);
  const isAuditor = roleSet.has('Auditor');
  const isManager = roleSet.has('Audit Manager') || roleSet.has('Manager');
  const isCAE = roleSet.has('Chief Audit Executive') || roleSet.has('Chief Audit Executive (CAE)') || roleSet.has('CAE');
  const isSysAdmin = roleSet.has('System Administrator');

  const quickLinks = useMemo(() => {
    const items: { label: string; description: string; action: () => void }[] = [];
    if (isAuditor) {
      items.push(
        { label: 'My Audits', description: 'View and execute assigned audits', action: () => navigate('/audits?filter=my') },
        { label: 'Evidence', description: 'Upload and manage audit evidence', action: () => navigate('/evidence') },
        { label: 'Messages', description: 'Open your conversations', action: () => navigate('/messages') },
      );
    }
    if (isManager) {
      items.push(
        { label: 'Audit Plans', description: 'Create and manage audit plans', action: () => navigate('/audit-plans') },
        { label: 'Audit Programs', description: 'Manage audit programs', action: () => navigate('/audit-programs') },
        { label: 'Findings', description: 'Review and assign actions', action: () => navigate('/findings') },
      );
    }
    if (isCAE) {
      items.push(
        { label: 'Approve Plans', description: 'Review and approve audit plans', action: () => navigate('/audit-plans') },
        { label: 'Executive Reports', description: 'View aggregated reports', action: () => navigate('/reports/executive') },
        { label: 'Risk Register', description: 'Review risks and escalations', action: () => navigate('/risk-register') },
      );
    }
    if (isSysAdmin) {
      items.push(
        { label: 'Manage Users', description: 'Create and manage user accounts', action: () => navigate('/users') },
        { label: 'Manage Roles', description: 'Assign and edit roles', action: () => navigate('/roles') },
        { label: 'Integrations', description: 'Configure connected systems', action: () => navigate('/integrations') },
      );
    }
    return items;
  }, [isAuditor, isManager, isCAE, isSysAdmin, navigate]);

  if (!profile) {
    return <Typography>Loading profile...</Typography>;
  }


  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>
      <Paper sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar src={previewUrl || undefined} sx={{ width: 120, height: 120, mb: 2 }} />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-picture-upload"
            type="file"
            onChange={handlePictureChange}
          />
          <label htmlFor="profile-picture-upload">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <TextField
          label="Full Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email Address"
          fullWidth
          value={email}
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          helperText="Leave blank to keep your current password."
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button variant="contained" onClick={handleUpdateProfile} sx={{ bgcolor: '#0F1A2B' }}>
          Save Changes
        </Button>
      </Paper>

      <Box sx={{ mt: 4, maxWidth: '900px', mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>My Roles</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {roles.length > 0 ? roles.map((r, idx) => (
            <Paper key={`${r}-${idx}`} sx={{ px: 2, py: 1 }}>
              <Typography variant="body2">{r}</Typography>
            </Paper>
          )) : (
            <Typography variant="body2">No roles assigned</Typography>
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Quick Links</Typography>
        <Grid container spacing={2}>
          {quickLinks.map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 } as any}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{item.description}</Typography>
                  <Button variant="outlined" onClick={item.action}>Open</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {quickLinks.length === 0 && (
            <Grid size={{ xs: 12 } as any}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2">No role-specific links available.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      <Box sx={{ mt: 4, maxWidth: '900px', mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>My Tasks</Typography>
        <Paper sx={{ p: 2 }}>
          {tasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No tasks assigned.</Typography>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((t) => (
                <Grid key={t.id} size={{ xs: 12, sm: 6 } as any}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{t.title}</Typography>
                    <Typography variant="caption" color="text.secondary">Due: {t.dueDate || 'N/A'}</Typography>
                    {t.link && (
                      <Box sx={{ mt: 1 }}>
                        <Button variant="outlined" size="small" onClick={() => navigate(t.link)}>
                          Open
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
