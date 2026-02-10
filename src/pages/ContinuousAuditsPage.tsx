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
  CircularProgress,
  Tooltip,
  Paper
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, PlayArrow as RunIcon, History as HistoryIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../services/api';

interface AutomatedControl {
  id: number;
  name: string;
  description: string;
  frequency: string;
  script: string;
  status: string;
  createdAt: string;
  lastRun?: string;
  lastStatus?: string;
}

interface ControlRun {
  id: number;
  runDate: string;
  status: string;
  resultSummary: string;
}

const ContinuousAuditsPage: React.FC = () => {
  const [controls, setControls] = useState<AutomatedControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [currentControlRuns, setCurrentControlRuns] = useState<ControlRun[]>([]);
  const [selectedControl, setSelectedControl] = useState<AutomatedControl | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'Daily',
    script: '',
    status: 'active'
  });

  const userRole = localStorage.getItem('userRole');
  // Assume Auditors are view-only, others can edit/run
  const canEdit = userRole !== 'Auditor';

  const fetchControls = async () => {
    setLoading(true);
    try {
      const data = await api.getAutomatedControls();
      setControls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch automated controls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const handleOpenDialog = (control?: AutomatedControl) => {
    if (control) {
      setSelectedControl(control);
      setFormData({
        name: control.name,
        description: control.description,
        frequency: control.frequency,
        script: control.script,
        status: control.status
      });
    } else {
      setSelectedControl(null);
      setFormData({
        name: '',
        description: '',
        frequency: 'Daily',
        script: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedControl(null);
  };

  const handleSave = async () => {
    try {
      if (selectedControl) {
        await api.updateAutomatedControl(selectedControl.id, formData);
        alert("Control updated successfully!");
      } else {
        await api.createAutomatedControl(formData);
        alert("Control created successfully!");
      }
      handleCloseDialog();
      fetchControls();
    } catch (error) {
      console.error('Failed to save control:', error);
      alert("Failed to save control.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this automated control?")) {
      try {
        await api.deleteAutomatedControl(id);
        alert("Control deleted successfully!");
        handleCloseDialog();
        fetchControls();
      } catch (error) {
        console.error("Failed to delete control:", error);
        alert("Failed to delete control.");
      }
    }
  };

  const handleRunNow = async (id: number) => {
    try {
      await api.runControl(id);
      alert('Control run initiated successfully');
      fetchControls();
    } catch (error) {
      console.error('Failed to run control:', error);
      alert('Failed to initiate control run');
    }
  };

  const handleViewHistory = async (control: AutomatedControl) => {
    setSelectedControl(control);
    setOpenHistoryDialog(true);
    try {
      const runs = await api.getControlRuns(control.id);
      setCurrentControlRuns(Array.isArray(runs) ? runs : []);
    } catch (error) {
      console.error('Failed to fetch control runs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'success': return 'success';
      case 'failure': return 'error';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Control Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1.5 },
    { field: 'frequency', headerName: 'Frequency', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value as string) as any} 
          size="small" 
          variant="outlined"
        />
      )
    }
  ];

  const historyColumns: GridColDef[] = [
    { field: 'id', headerName: 'Run ID', width: 90 },
    { field: 'runDate', headerName: 'Date', width: 180, valueFormatter: (value: string) => new Date(value).toLocaleString() },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value as string) as any} 
          size="small" 
        />
      )
    },
    { field: 'resultSummary', headerName: 'Summary', flex: 1 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Continuous Audits
        </Typography>
        <Box>
           <Button startIcon={<RefreshIcon />} onClick={fetchControls} sx={{ mr: 1 }}>
            Refresh
          </Button>
          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              New Automated Control
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={controls}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={(params) => handleOpenDialog(params.row as AutomatedControl)}
          sx={{ cursor: 'pointer' }}
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedControl ? 'Edit Control' : 'New Automated Control'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Control Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              select
              label="Frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              fullWidth
            >
              <MenuItem value="Hourly">Hourly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </TextField>
            <TextField
              label="Script / Logic Reference"
              value={formData.script}
              onChange={(e) => setFormData({ ...formData, script: e.target.value })}
              fullWidth
              multiline
              rows={4}
              helperText="Enter the script logic or reference ID for the backend scheduler."
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {selectedControl && (
            <>
              {canEdit && (
                <Button 
                  color="error" 
                  startIcon={<AddIcon sx={{ transform: 'rotate(45deg)' }} />} 
                  onClick={() => handleDelete(selectedControl.id)}
                >
                  Delete
                </Button>
              )}
              <Button 
                startIcon={<HistoryIcon />} 
                onClick={() => {
                  handleCloseDialog();
                  handleViewHistory(selectedControl);
                }}
              >
                View History
              </Button>
              {canEdit && (
                <Button 
                  color="primary" 
                  startIcon={<RunIcon />} 
                  onClick={() => {
                    handleRunNow(selectedControl.id);
                  }}
                >
                  Run Now
                </Button>
              )}
            </>
          )}
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run History: {selectedControl?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
             <DataGrid
              rows={currentControlRuns}
              columns={historyColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
                sorting: { sortModel: [{ field: 'runDate', sort: 'desc' }] }
              }}
              pageSizeOptions={[5, 10]}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContinuousAuditsPage;
