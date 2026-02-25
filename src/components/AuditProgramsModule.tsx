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
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl
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
    expectedOutcome: '',
    // Enhanced Operational Fields
    samplingApproach: '',
    sampleSize: '',
    confidenceLevel: '',
    materialityThreshold: '',
    testMethod: '',
    evidenceRequired: '',
    documentationReq: '',
    stepByStepProcedure: ''
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
        expectedOutcome: program.expectedOutcome || '',
        // Enhanced Operational Fields
        samplingApproach: program.samplingApproach || '',
        sampleSize: program.sampleSize?.toString() || '',
        confidenceLevel: program.confidenceLevel?.toString() || '',
        materialityThreshold: program.materialityThreshold?.toString() || '',
        testMethod: program.testMethod || '',
        evidenceRequired: program.evidenceRequired || '',
        documentationReq: program.documentationReq || '',
        stepByStepProcedure: program.stepByStepProcedure || ''
      });
    } else {
      setEditingProgram(null);
      setFormData({
        procedureName: '',
        controlReference: '',
        expectedOutcome: '',
        // Enhanced Operational Fields
        samplingApproach: '',
        sampleSize: '',
        confidenceLevel: '',
        materialityThreshold: '',
        testMethod: '',
        evidenceRequired: '',
        documentationReq: '',
        stepByStepProcedure: ''
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
                        </>
                      )}
                      {(userRole === 'Manager' || userRole === 'Audit Manager' || userRole === 'Admin' || userRole === 'System Admin') && (
                        <IconButton edge="end" onClick={() => handleDelete(program.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
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
            
            {/* Enhanced Operational Fields */}
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
              Testing Details
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Sampling Approach"
                fullWidth
                select
                value={formData.samplingApproach}
                onChange={(e) => setFormData({ ...formData, samplingApproach: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Statistical">Statistical</MenuItem>
                <MenuItem value="Judgmental">Judgmental</MenuItem>
                <MenuItem value="Random">Random</MenuItem>
                <MenuItem value="Systematic">Systematic</MenuItem>
              </TextField>
              <TextField
                label="Sample Size"
                fullWidth
                type="number"
                value={formData.sampleSize}
                onChange={(e) => setFormData({ ...formData, sampleSize: e.target.value })}
                helperText="Number of items to test"
              />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Confidence Level (%)"
                fullWidth
                type="number"
                value={formData.confidenceLevel}
                onChange={(e) => setFormData({ ...formData, confidenceLevel: e.target.value })}
                inputProps={{ min: 90, max: 99.9, step: 0.1 }}
                helperText="Statistical confidence level"
              />
              <TextField
                label="Materiality Threshold"
                fullWidth
                type="number"
                value={formData.materialityThreshold}
                onChange={(e) => setFormData({ ...formData, materialityThreshold: e.target.value })}
                helperText="Materiality threshold for testing"
              />
            </Box>
            
            <TextField
              label="Test Method"
              fullWidth
              select
              value={formData.testMethod}
              onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Inquiry">Inquiry</MenuItem>
              <MenuItem value="Observation">Observation</MenuItem>
              <MenuItem value="Inspection">Inspection</MenuItem>
              <MenuItem value="Reperformance">Reperformance</MenuItem>
              <MenuItem value="Analytical">Analytical Procedures</MenuItem>
            </TextField>
            
            <TextField
              label="Evidence Required"
              fullWidth
              multiline
              rows={2}
              value={formData.evidenceRequired}
              onChange={(e) => setFormData({ ...formData, evidenceRequired: e.target.value })}
              helperText="Specific evidence requirements for this test"
            />
            
            <TextField
              label="Documentation Requirements"
              fullWidth
              multiline
              rows={2}
              value={formData.documentationReq}
              onChange={(e) => setFormData({ ...formData, documentationReq: e.target.value })}
              helperText="Documentation requirements for this test"
            />
            
            <TextField
              label="Step-by-Step Procedure"
              fullWidth
              multiline
              rows={3}
              value={formData.stepByStepProcedure}
              onChange={(e) => setFormData({ ...formData, stepByStepProcedure: e.target.value })}
              helperText="Detailed step-by-step testing procedures"
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
