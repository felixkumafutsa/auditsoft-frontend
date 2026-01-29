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
  LinearProgress,
  useTheme
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import api from '../services/api';

interface KRI {
  id: number;
  kriId: string;
  name: string;
  description: string;
  metricType: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  currentValue: number;
  status: string;
  frequency: string;
  risk?: { id: number; title: string };
}

const RiskKRIsPage: React.FC = () => {
  const [kris, setKris] = useState<KRI[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingKri, setEditingKri] = useState<KRI | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metricType: 'Number',
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0,
    currentValue: 0,
    frequency: 'Monthly',
    riskId: ''
  });

  const [risks, setRisks] = useState<any[]>([]);

  const fetchKris = async () => {
    try {
      setLoading(true);
      const data = await api.getKris();
      setKris(data);
    } catch (error) {
      console.error('Failed to fetch KRIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRisks = async () => {
    try {
      const data = await api.getRisks();
      setRisks(data);
    } catch (error) {
      console.error('Failed to fetch risks:', error);
    }
  };

  useEffect(() => {
    fetchKris();
    fetchRisks();
  }, []);

  const handleOpenDialog = (kri?: KRI) => {
    if (kri) {
      setEditingKri(kri);
      setFormData({
        name: kri.name,
        description: kri.description || '',
        metricType: kri.metricType,
        targetValue: kri.targetValue,
        warningThreshold: kri.warningThreshold,
        criticalThreshold: kri.criticalThreshold,
        currentValue: kri.currentValue,
        frequency: kri.frequency,
        riskId: kri.risk ? kri.risk.id.toString() : ''
      });
    } else {
      setEditingKri(null);
      setFormData({
        name: '',
        description: '',
        metricType: 'Number',
        targetValue: 0,
        warningThreshold: 0,
        criticalThreshold: 0,
        currentValue: 0,
        frequency: 'Monthly',
        riskId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingKri(null);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        targetValue: Number(formData.targetValue),
        warningThreshold: Number(formData.warningThreshold),
        criticalThreshold: Number(formData.criticalThreshold),
        currentValue: Number(formData.currentValue),
        riskId: formData.riskId ? Number(formData.riskId) : undefined
      };

      if (editingKri) {
        await api.updateKri(editingKri.id, payload);
      } else {
        await api.createKri(payload);
      }
      handleCloseDialog();
      fetchKris();
    } catch (error) {
      console.error('Failed to save KRI:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this KRI?')) {
      try {
        await api.deleteKri(id);
        fetchKris();
      } catch (error) {
        console.error('Failed to delete KRI:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'error';
      case 'amber': return 'warning';
      case 'green': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'kriId', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'KRI Name', flex: 1 },
    { field: 'frequency', headerName: 'Frequency', width: 120 },
    { 
      field: 'currentValue', 
      headerName: 'Current Value', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center" width="100%">
          <Typography variant="body2" mr={1}>{params.value}</Typography>
          {/* Simple progress bar relative to critical threshold for visualization */}
          {params.row.metricType === 'Percentage' && (
             <LinearProgress 
               variant="determinate" 
               value={Number(params.value)} 
               color={getStatusColor(params.row.status) as any}
               sx={{ width: 50, height: 6, borderRadius: 3 }}
             />
          )}
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value?.toUpperCase()} 
          color={getStatusColor(params.value) as any} 
          size="small" 
          variant="filled"
        />
      )
    },
    {
      field: 'risk',
      headerName: 'Linked Risk',
      width: 200,
      valueGetter: (value: any, row: any) => row.risk?.title || '-'
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
          Key Risk Indicators (KRIs)
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add KRI
        </Button>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={kris}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick={true}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingKri ? 'Edit KRI' : 'Add New KRI'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="KRI Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Metric Type"
                  value={formData.metricType}
                  onChange={(e) => setFormData({ ...formData, metricType: e.target.value })}
                >
                  <MenuItem value="Number">Number</MenuItem>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="Currency">Currency</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Linked Risk"
                  select
                  value={formData.riskId}
                  onChange={(e) => setFormData({ ...formData, riskId: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {risks.map((risk) => (
                    <MenuItem key={risk.id} value={risk.id}>
                      {risk.riskId} - {risk.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Value"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>Thresholds</Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Value (Green)"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                  helperText="Ideal value"
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Warning Threshold (Amber)"
                  value={formData.warningThreshold}
                  onChange={(e) => setFormData({ ...formData, warningThreshold: Number(e.target.value) })}
                  helperText="Signal early warning"
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Critical Threshold (Red)"
                  value={formData.criticalThreshold}
                  onChange={(e) => setFormData({ ...formData, criticalThreshold: Number(e.target.value) })}
                  helperText="Signal critical risk"
                />
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

export default RiskKRIsPage;
