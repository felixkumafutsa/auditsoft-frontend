import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import api from '../services/api';

interface Integration {
  id: number;
  systemName: string;
  type: string;
  apiEndpoint: string;
  status: string;
  lastSyncDate?: string;
}

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    systemName: '',
    type: 'ISSUE_TRACKER',
    apiEndpoint: '',
    status: 'active'
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await api.getIntegrations();
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch integrations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (integration?: Integration) => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        systemName: integration.systemName,
        type: integration.type,
        apiEndpoint: integration.apiEndpoint || '',
        status: integration.status
      });
    } else {
      setEditingIntegration(null);
      setFormData({
        systemName: '',
        type: 'ISSUE_TRACKER',
        apiEndpoint: '',
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingIntegration) {
        await api.updateIntegration(editingIntegration.id, formData);
      } else {
        await api.createIntegration(formData);
      }
      setDialogOpen(false);
      fetchIntegrations();
    } catch (error) {
      console.error("Failed to save integration", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      try {
        await api.deleteIntegration(id);
        fetchIntegrations();
      } catch (error) {
        console.error("Failed to delete integration", error);
      }
    }
  };

  const handleSync = async (id: number) => {
    try {
      await api.syncIntegration(id);
      alert('Sync started successfully');
      fetchIntegrations();
    } catch (error) {
      console.error("Failed to sync integration", error);
      alert('Failed to sync integration');
    }
  };

  // Search Logic
  const filteredIntegrations = useMemo(() => {
    if (!searchTerm) return integrations;
    const lowerTerm = searchTerm.toLowerCase();
    return integrations.filter(i => 
      i.systemName.toLowerCase().includes(lowerTerm) ||
      i.type.toLowerCase().includes(lowerTerm)
    );
  }, [integrations, searchTerm]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'systemName', headerName: 'System Name', flex: 1, minWidth: 150 },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    { field: 'apiEndpoint', headerName: 'Endpoint', width: 250 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'active' ? 'success' : 'default'}
          size="small" 
        />
      )
    },
    { 
      field: 'lastSyncDate', 
      headerName: 'Last Sync', 
      width: 180,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleString() : 'Never'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
           <Tooltip title="Sync Now">
            <IconButton onClick={() => handleSync(params.row.id)} color="primary" size="small">
              <SyncIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)} color="primary" size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          System Integrations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: "#0F1A2B" }}
        >
          Add Integration
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search integrations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Paper>
      
      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredIntegrations}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
          />
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIntegration ? 'Edit Integration' : 'Add New Integration'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="System Name"
              fullWidth
              value={formData.systemName}
              onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="ISSUE_TRACKER">Issue Tracker (Jira, etc.)</MenuItem>
                <MenuItem value="MESSAGING">Messaging (Slack, Teams)</MenuItem>
                <MenuItem value="ERP">ERP (SAP, Oracle)</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="API Endpoint"
              fullWidth
              value={formData.apiEndpoint}
              onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
            />
             <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationsPage;
