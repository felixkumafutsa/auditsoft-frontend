import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';
import { Audit, AuditProgram } from '../types/audit';

interface AuditProgramsModuleProps {
  audit: any;
  onBack: () => void;
}

const AuditProgramsModule: React.FC<AuditProgramsModuleProps> = ({ audit, onBack }) => {
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AuditProgram | null>(null);
  const [formData, setFormData] = useState({
    procedureName: '',
    controlReference: '',
    expectedOutcome: ''
  });

  const userRole = localStorage.getItem('userRole');
  const canEdit = userRole === 'Manager' || userRole === 'Audit Manager' || userRole === 'Admin' || userRole === 'System Admin' || userRole === 'CAE';

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAuditPrograms(audit.id);
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch programs', error);
    } finally {
      setLoading(false);
    }
  }, [audit.id]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

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
    try {
      if (editingProgram) {
        await api.updateAuditProgram(editingProgram.id, formData);
      } else {
        await api.createAuditProgram({
          auditId: audit.id,
          ...formData
        });
      }
      setDialogOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error('Failed to save program', error);
      alert('Failed to save program.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.deleteAuditProgram(id);
        fetchPrograms();
      } catch (error) {
        console.error('Failed to delete program', error);
        alert('Failed to delete program.');
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back
      </Button>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F1A2B' }}>
          Manage Audit Programs: {audit.auditName}
        </Typography>
        {canEdit && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
          >
            Add Program
          </Button>
        )}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={1}>
          <List>
            {programs.length === 0 ? (
              <ListItem>
                <ListItemText primary="No audit programs found. Add one to get started." />
              </ListItem>
            ) : (
              programs.map((program, index) => (
                <React.Fragment key={program.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={program.procedureName}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" display="block">
                            <strong>Control Ref:</strong> {program.controlReference || 'N/A'}
                          </Typography>
                          <Typography variant="body2" component="span" display="block">
                            <strong>Expected Outcome:</strong> {program.expectedOutcome || 'N/A'}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {canEdit && (
                        <>
                          <IconButton edge="end" onClick={() => handleOpenDialog(program)} sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDelete(program.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProgram ? 'Edit Audit Program' : 'Add New Audit Program'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Procedure Name"
              fullWidth
              multiline
              rows={2}
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
              rows={2}
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

export default AuditProgramsModule;
