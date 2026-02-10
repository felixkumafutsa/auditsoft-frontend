import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import api from '../services/api';

interface WorkflowConfig {
  statuses: string[];
  transitions: Record<string, string[]>;
}

const WorkflowConfigPage: React.FC = () => {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getWorkflowConfig();
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch workflow config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return <Typography color="error">Failed to load workflow configuration.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <AccountTreeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Workflow Configuration
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        This page displays the current lifecycle and allowed transitions for Audit entities. 
        Configurations are currently managed via system defaults to ensure data integrity.
      </Typography>

      <Grid container spacing={3}>
        {config.statuses.map((status) => (
          <Grid key={status} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {status}
                  </Typography>
                  <Chip 
                    label={config.transitions[status]?.length ? 'Active State' : 'Terminal State'} 
                    color={config.transitions[status]?.length ? 'primary' : 'success'} 
                    size="small" 
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Allowed Transitions:
                </Typography>
                
                {config.transitions[status] && config.transitions[status].length > 0 ? (
                  <List dense>
                    {config.transitions[status].map((target) => (
                      <ListItem key={target}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <ArrowForwardIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText primary={target} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', py: 1 }}>
                    No further transitions allowed.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorkflowConfigPage;