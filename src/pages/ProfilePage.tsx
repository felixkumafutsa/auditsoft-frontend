import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProfilePage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
                My Profile
            </Typography>
            <Paper sx={{p: 3, mt: 2}}>
                <Typography>User profile details and settings will be displayed here.</Typography>
            </Paper>
        </Box>
    );
};

export default ProfilePage;