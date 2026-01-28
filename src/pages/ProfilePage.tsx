import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../services/api';

interface UserProfile {
  name: string;
  email: string;
  profilePicture?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  if (!profile) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>
      <Paper sx={{ p: 4, maxWidth: '600px', mx: 'auto' }}>
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
          disabled // Email is typically not user-editable
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
