import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

interface Risk {
  id: number;
  riskId: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  likelihood: string;
  status: string;
  owner?: { name: string };
  createdAt: string;
}

const RiskRegisterPage: React.FC = () => {
  const theme = useTheme();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Operational',
    impact: 'Medium',
    likelihood: 'Medium',
    status: 'open'
  });

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const data = await api.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Failed to fetch risks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleOpenDialog = (risk?: Risk) => {
    if (risk) {
      setEditingRisk(risk);
      setFormData({
        title: risk.title,
        description: risk.description || '',
        category: risk.category,
        impact: risk.impact,
        likelihood: risk.likelihood,
        status: risk.status
      });
    } else {
      setEditingRisk(null);
      setFormData({
        title: '',
        description: '',
        category: 'Operational',
        impact: 'Medium',
        likelihood: 'Medium',
        status: 'open'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRisk(null);
  };

  const handleSave = async () => {
    try {
      if (editingRisk) {
        await api.updateRisk(editingRisk.id, formData);
      } else {
        await api.createRisk(formData);
      }
      handleCloseDialog();
      fetchRisks();
    } catch (error) {
      console.error('Failed to save risk:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await api.deleteRisk(id);
        fetchRisks();
      } catch (error) {
        console.error('Failed to delete risk:', error);
      }
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'riskId', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Risk Title', flex: 1 },
    { field: 'category', headerName: 'Category', width: 150 },
    { 
      field: 'impact', 
      headerName: 'Impact', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getImpactColor(params.value as string) as any} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'likelihood', 
      headerName: 'Likelihood', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getLikelihoodColor(params.value as string) as any} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={params.value === 'open' ? 'primary' : 'default'} 
          size="small" 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Risk Register
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Risk
        </Button>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={risks}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRisk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Risk Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Compliance">Compliance</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Strategic">Strategic</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="mitigated">Mitigated</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Impact"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Likelihood"
                  value={formData.likelihood}
                  onChange={(e) => setFormData({ ...formData, likelihood: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskRegisterPage;
