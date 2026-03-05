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
  useTheme,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);

interface Risk {
  id: number;
  riskId: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  likelihood: string;
  status: string;
  inherentScore?: number;
  residualScore?: number;
  owner?: { name: string };
  residualImpact?: string;
  residualLikelihood?: string;
  inherentImpact?: string;
  inherentLikelihood?: string;
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
    likelihood: 'Possible',
    inherentImpact: 'Medium',
    inherentLikelihood: 'Possible',
    residualImpact: 'Low',
    residualLikelihood: 'Unlikely',
    status: 'Identified'
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
        inherentImpact: risk.inherentImpact || risk.impact,
        inherentLikelihood: risk.inherentLikelihood || risk.likelihood,
        residualImpact: risk.residualImpact || risk.impact,
        residualLikelihood: risk.residualLikelihood || risk.likelihood,
        status: risk.status
      });
    } else {
      setEditingRisk(null);
      setFormData({
        title: '',
        description: '',
        category: 'Operational',
        impact: 'Medium',
        likelihood: 'Possible',
        inherentImpact: 'Medium',
        inherentLikelihood: 'Possible',
        residualImpact: 'Low',
        residualLikelihood: 'Unlikely',
        status: 'Identified'
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
      MySwal.fire('Saved', 'Risk updated successfully', 'success');
    } catch (error: any) {
      console.error('Failed to save risk:', error);
      MySwal.fire('Error', error.message || 'Failed to save risk', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Delete Risk?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteRisk(id);
        MySwal.fire('Deleted', 'Risk has been deleted.', 'success');
        fetchRisks();
      } catch (error: any) {
        console.error('Failed to delete risk:', error);
        MySwal.fire('Error', error.message || 'Failed to delete risk', 'error');
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
    // Map backend likelihood scale to visual severity
    switch (likelihood) {
      case 'Certain':
        return 'error';
      case 'Likely':
        return 'error';
      case 'Possible':
        return 'warning';
      case 'Unlikely':
        return 'success';
      case 'Rare':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identified':
        return 'primary';
      case 'Assessed':
        return 'info';
      case 'Mitigated':
        return 'success';
      case 'Accepted':
        return 'warning';
      case 'Closed':
        return 'default';
      default:
        return 'default';
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
      field: 'inherentScore',
      headerName: 'Inherent',
      width: 90,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'residualScore',
      headerName: 'Residual',
      width: 90,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value || '-'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as string) as any}
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
                  <MenuItem value="Identified">Identified</MenuItem>
                  <MenuItem value="Assessed">Assessed</MenuItem>
                  <MenuItem value="Mitigated">Mitigated</MenuItem>
                  <MenuItem value="Accepted">Accepted</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}><Chip label="Inherent Risk Assessment" size="small" /></Divider>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Inherent Impact"
                  value={formData.inherentImpact}
                  onChange={(e) => setFormData({ ...formData, inherentImpact: e.target.value })}
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
                  label="Inherent Likelihood"
                  value={formData.inherentLikelihood}
                  onChange={(e) => setFormData({ ...formData, inherentLikelihood: e.target.value })}
                >
                  <MenuItem value="Rare">Rare</MenuItem>
                  <MenuItem value="Unlikely">Unlikely</MenuItem>
                  <MenuItem value="Possible">Possible</MenuItem>
                  <MenuItem value="Likely">Likely</MenuItem>
                  <MenuItem value="Certain">Certain</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}><Chip label="Residual Risk Assessment" size="small" /></Divider>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Residual Impact"
                  value={formData.residualImpact}
                  onChange={(e) => setFormData({ ...formData, residualImpact: e.target.value })}
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
                  label="Residual Likelihood"
                  value={formData.residualLikelihood}
                  onChange={(e) => setFormData({ ...formData, residualLikelihood: e.target.value })}
                >
                  <MenuItem value="Rare">Rare</MenuItem>
                  <MenuItem value="Unlikely">Unlikely</MenuItem>
                  <MenuItem value="Possible">Possible</MenuItem>
                  <MenuItem value="Likely">Likely</MenuItem>
                  <MenuItem value="Certain">Certain</MenuItem>
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
