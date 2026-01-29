import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
}

interface AuditProgram {
  id: number;
  auditId: number;
  procedureName: string;
  controlReference: string;
  expectedOutcome: string;
}

const AuditProgramsPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AuditProgram | null>(null);
  const [formData, setFormData] = useState({
    procedureName: '',
    controlReference: '',
    expectedOutcome: ''
  });

  // Fetch Audits on Mount
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await api.getAudits();
        const mappedAudits = Array.isArray(data) ? data.map((a: any) => ({
          id: a.id,
          auditName: a.auditName || a.audit_name
        })) : [];
        setAudits(mappedAudits);
        
        // Default to first audit if available
        if (mappedAudits.length > 0) {
          setSelectedAuditId(mappedAudits[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch audits", error);
      }
    };
    fetchAudits();
  }, []);

  // Fetch Programs when Audit Changes
  useEffect(() => {
    if (!selectedAuditId) return;

    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const data = await api.getAuditPrograms(Number(selectedAuditId));
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch programs", error);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [selectedAuditId]);

  // Search Logic
  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    const lowerTerm = searchTerm.toLowerCase();
    return programs.filter(p => 
      p.procedureName.toLowerCase().includes(lowerTerm) ||
      (p.controlReference && p.controlReference.toLowerCase().includes(lowerTerm)) ||
      (p.expectedOutcome && p.expectedOutcome.toLowerCase().includes(lowerTerm))
    );
  }, [programs, searchTerm]);

  // CRUD Handlers
  const handleOpenDialog = (program?: AuditProgram) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        procedureName: program.procedureName,
        controlReference: program.controlReference || '',
        expectedOutcome: program.expectedOutcome || ''
      });
    } else {
      setEditingProgram(null);
      setFormData({
        procedureName: '',
        controlReference: '',
        expectedOutcome: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAuditId) return;
    try {
      if (editingProgram) {
        await api.updateAuditProgram(editingProgram.id, formData);
      } else {
        await api.createAuditProgram({
          auditId: Number(selectedAuditId),
          ...formData
        });
      }
      // Refresh
      const data = await api.getAuditPrograms(Number(selectedAuditId));
      setPrograms(Array.isArray(data) ? data : []);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save program", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.deleteAuditProgram(id);
        // Refresh
        const data = await api.getAuditPrograms(Number(selectedAuditId));
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to delete program", error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'procedureName', headerName: 'Procedure Name', flex: 1, minWidth: 250 },
    { field: 'controlReference', headerName: 'Control Ref', width: 150 },
    { field: 'expectedOutcome', headerName: 'Expected Outcome', flex: 1, minWidth: 200 },
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
          Audit Programs
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          disabled={!selectedAuditId}
        >
          Add Program
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 250 }} size="small">
            <InputLabel>Select Audit</InputLabel>
            <Select
              value={selectedAuditId}
              label="Select Audit"
              onChange={(e) => setSelectedAuditId(e.target.value as number)}
            >
              {audits.map((audit) => (
                <MenuItem key={audit.id} value={audit.id}>
                  {audit.auditName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300, ml: 'auto' }}
          />
        </Box>
      </Paper>
      
      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : selectedAuditId ? (
          <DataGrid
            rows={filteredPrograms}
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
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="textSecondary">Please select an audit to view its programs.</Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProgram ? 'Edit Audit Program' : 'Add New Audit Program'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Procedure Name"
              fullWidth
              multiline
              rows={3}
              value={formData.procedureName}
              onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
            />
            <TextField
              label="Control Reference"
              fullWidth
              value={formData.controlReference}
              onChange={(e) => setFormData({ ...formData, controlReference: e.target.value })}
            />
            <TextField
              label="Expected Outcome"
              fullWidth
              multiline
              rows={3}
              value={formData.expectedOutcome}
              onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.procedureName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditProgramsPage;
