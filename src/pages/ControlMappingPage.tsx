import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
}

interface AuditProgram {
  id: number;
  procedureName: string;
  controlReference: string;
}

interface ComplianceFramework {
  id: number;
  frameworkName: string;
  version: string;
}

interface ControlMapping {
  id: number;
  auditProgramId: number;
  frameworkId: number;
  coverageStatus: string;
  framework?: ComplianceFramework; // Joined data
}

const ControlMappingPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog State
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<AuditProgram | null>(null);
  const [currentMappings, setCurrentMappings] = useState<ControlMapping[]>([]);
  const [newMapping, setNewMapping] = useState({
    frameworkId: '' as number | '',
    coverageStatus: 'Covered'
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch Audits & Frameworks on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const [auditsData, frameworksData] = await Promise.all([
          api.getAudits(),
          api.getFrameworks()
        ]);
        
        const mappedAudits = Array.isArray(auditsData) ? auditsData.map((a: any) => ({
          id: a.id,
          auditName: a.auditName || a.audit_name
        })) : [];
        setAudits(mappedAudits);
        
        if (mappedAudits.length > 0) {
          setSelectedAuditId(mappedAudits[0].id);
        }

        setFrameworks(Array.isArray(frameworksData) ? frameworksData : []);
      } catch (error) {
        console.error("Failed to initialize control mapping page", error);
      }
    };
    init();
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

  // Open Mapping Dialog
  const handleOpenMappings = async (program: AuditProgram) => {
    setSelectedProgram(program);
    setMappingDialogOpen(true);
    setNewMapping({ frameworkId: '', coverageStatus: 'Covered' });
    setError(null);
    
    // Fetch existing mappings for this program
    try {
      const data = await api.getControlMappings(program.id);
      // We need to ensure framework details are included or manually joined
      // Assuming backend returns framework object inside mapping or we find it
      const mappingsWithFrameworks = Array.isArray(data) ? data.map((m: any) => ({
        ...m,
        framework: m.framework || frameworks.find(f => f.id === m.frameworkId)
      })) : [];
      setCurrentMappings(mappingsWithFrameworks);
    } catch (error) {
      console.error("Failed to fetch mappings", error);
      setCurrentMappings([]);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedProgram || !newMapping.frameworkId) return;
    setError(null);
    
    try {
      await api.createControlMapping({
        auditProgramId: selectedProgram.id,
        frameworkId: Number(newMapping.frameworkId),
        coverageStatus: newMapping.coverageStatus
      });
      
      // Refresh mappings
      const data = await api.getControlMappings(selectedProgram.id);
      const mappingsWithFrameworks = Array.isArray(data) ? data.map((m: any) => ({
        ...m,
        framework: m.framework || frameworks.find(f => f.id === m.frameworkId)
      })) : [];
      setCurrentMappings(mappingsWithFrameworks);
      
      // Reset form
      setNewMapping({ frameworkId: '', coverageStatus: 'Covered' });
    } catch (error: any) {
      console.error("Failed to add mapping", error);
      if (error.response && error.response.status === 409) {
        setError("This mapping already exists.");
      } else {
        setError("Failed to add mapping. Please try again.");
      }
    }
  };

  const handleDeleteMapping = async (id: number) => {
    try {
      await api.deleteControlMapping(id);
      setCurrentMappings(currentMappings.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete mapping", error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'procedureName', headerName: 'Procedure Name', flex: 1, minWidth: 250 },
    { field: 'controlReference', headerName: 'Control Ref', width: 150 },
    {
      field: 'actions',
      headerName: 'Mappings',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          startIcon={<LinkIcon />}
          size="small"
          variant="outlined"
          onClick={() => handleOpenMappings(params.row)}
        >
          Manage
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Control Mapping
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 300 }} size="small">
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
        </Box>
      </Paper>
      
      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : selectedAuditId ? (
          <DataGrid
            rows={programs}
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
            <Typography color="textSecondary">Please select an audit to view programs.</Typography>
          </Box>
        )}
      </Paper>

      {/* Manage Mappings Dialog */}
      <Dialog open={mappingDialogOpen} onClose={() => setMappingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Control Mappings for: {selectedProgram?.procedureName}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box sx={{ mb: 3, mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Add New Mapping</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Standard / Framework</InputLabel>
                <Select
                  value={newMapping.frameworkId}
                  label="Standard / Framework"
                  onChange={(e) => setNewMapping({ ...newMapping, frameworkId: e.target.value as number })}
                >
                  {frameworks.map((fw) => (
                    <MenuItem key={fw.id} value={fw.id}>
                      {fw.frameworkName} ({fw.version})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Coverage</InputLabel>
                <Select
                  value={newMapping.coverageStatus}
                  label="Coverage"
                  onChange={(e) => setNewMapping({ ...newMapping, coverageStatus: e.target.value })}
                >
                  <MenuItem value="Covered">Covered</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                  <MenuItem value="Not Covered">Not Covered</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleAddMapping}
                disabled={!newMapping.frameworkId}
              >
                Add
              </Button>
            </Box>
          </Box>

          <List>
            {currentMappings.length === 0 ? (
              <Typography color="textSecondary" align="center">No mappings found.</Typography>
            ) : (
              currentMappings.map((mapping, index) => (
                <React.Fragment key={mapping.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={mapping.framework?.frameworkName || `Framework ID: ${mapping.frameworkId}`}
                      secondary={`Version: ${mapping.framework?.version || 'N/A'}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={mapping.coverageStatus} 
                        color={mapping.coverageStatus === 'Covered' ? 'success' : mapping.coverageStatus === 'Partial' ? 'warning' : 'error'}
                        size="small"
                      />
                      <IconButton edge="end" color="error" onClick={() => handleDeleteMapping(mapping.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ControlMappingPage;
