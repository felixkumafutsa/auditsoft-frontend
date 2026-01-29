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
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

interface ComplianceFramework {
  id: number;
  frameworkName: string;
  version: string;
  description: string;
}

const StandardsLibraryPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<ComplianceFramework | null>(null);
  const [formData, setFormData] = useState({
    frameworkName: '',
    version: '',
    description: ''
  });

  const fetchFrameworks = async () => {
    setLoading(true);
    try {
      const data = await api.getFrameworks();
      setFrameworks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch frameworks", error);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, []);

  // Search Logic
  const filteredFrameworks = useMemo(() => {
    if (!searchTerm) return frameworks;
    const lowerTerm = searchTerm.toLowerCase();
    return frameworks.filter(f => 
      f.frameworkName.toLowerCase().includes(lowerTerm) ||
      f.version.toLowerCase().includes(lowerTerm) ||
      (f.description && f.description.toLowerCase().includes(lowerTerm))
    );
  }, [frameworks, searchTerm]);

  // CRUD Handlers
  const handleOpenDialog = (framework?: ComplianceFramework) => {
    if (framework) {
      setEditingFramework(framework);
      setFormData({
        frameworkName: framework.frameworkName,
        version: framework.version,
        description: framework.description || ''
      });
    } else {
      setEditingFramework(null);
      setFormData({
        frameworkName: '',
        version: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingFramework) {
        await api.updateFramework(editingFramework.id, formData);
      } else {
        await api.createFramework(formData);
      }
      fetchFrameworks();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save framework", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this standard?')) {
      try {
        await api.deleteFramework(id);
        fetchFrameworks();
      } catch (error) {
        console.error("Failed to delete framework", error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'frameworkName', headerName: 'Framework Name', flex: 1, minWidth: 200 },
    { field: 'version', headerName: 'Version', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
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
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Standards Library
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add Standard
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search standards..."
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
            rows={filteredFrameworks}
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
        <DialogTitle>{editingFramework ? 'Edit Standard' : 'Add New Standard'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Framework Name"
              fullWidth
              value={formData.frameworkName}
              onChange={(e) => setFormData({ ...formData, frameworkName: e.target.value })}
            />
            <TextField
              label="Version"
              fullWidth
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.frameworkName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StandardsLibraryPage;
