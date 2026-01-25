import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Chip, 
  List, 
  ListItemButton, 
  ListItemText,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  ListItem,
  ListItemIcon,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
  auditType?: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface AuditProgram {
  id: number;
  procedureName: string;
  controlReference: string | null;
  expectedOutcome: string | null;
  actualResult: string | null;
  expanded?: boolean; // UI state for accordion
}

interface AuditExecutionModuleProps {
  initialAudit?: Audit | null;
  onBack?: () => void;
}

const AuditExecutionModule: React.FC<AuditExecutionModuleProps> = ({ initialAudit, onBack }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(initialAudit || null);
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<{[key: number]: any[]}>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  
  // Finding Dialog State
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);
  const [newFinding, setNewFinding] = useState({ description: "", severity: "Low" });

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (initialAudit) {
      handleSelectAudit(initialAudit);
    } else {
      fetchActiveAudits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAudit]);

  const fetchActiveAudits = async () => {
    try {
      const data = await api.getAudits();
      // Filter for audits that are ready for execution
      const active = Array.isArray(data) ? data.filter((a: Audit) => {
        if (userRole === 'Manager') {
           return ['In Progress', 'Approved', 'Review'].includes(a.status);
        }
        return ['In Progress', 'Approved'].includes(a.status);
      }) : [];
      setAudits(active);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    }
  };

  const handleSelectAudit = async (audit: Audit) => {
    setSelectedAudit(audit);
    setLoading(true);
    try {
      const data = await api.getAuditPrograms(audit.id);
      setPrograms(Array.isArray(data) ? data.map((p: any) => ({ ...p, expanded: false })) : []);
    } catch (error) {
      console.error('Failed to fetch audit programs', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async (programId: number) => {
    try {
      const data = await api.getEvidenceList(programId);
      setEvidenceMap(prev => ({
        ...prev,
        [programId]: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error(`Failed to fetch evidence for program ${programId}`, error);
    }
  };

  const toggleAccordion = (id: number) => {
    setPrograms(programs.map(p => {
      if (p.id === id) {
        // If expanding, fetch evidence
        if (!p.expanded) {
          fetchEvidence(id);
        }
        return { ...p, expanded: !p.expanded };
      }
      return p;
    }));
  };

  const handleResultChange = async (id: number, result: string) => {
    // Optimistic update
    setPrograms(programs.map(p => p.id === id ? { ...p, actualResult: result } : p));
    try {
      await api.updateAuditProgram(id, { actualResult: result });
    } catch (error) {
      console.error('Failed to save result', error);
      alert('Failed to save result. Please try again.');
    }
  };

  const handleFileUpload = async (programId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(programId);
    try {
      await api.uploadEvidence(programId, file, `Evidence for program #${programId}`);
      alert('Evidence uploaded successfully!');
      fetchEvidence(programId);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteEvidence = async (programId: number, evidenceId: number) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) return;
    try {
      await api.deleteEvidence(evidenceId);
      await fetchEvidence(programId);
    } catch (error) {
      console.error('Failed to delete evidence', error);
      alert('Failed to delete evidence.');
    }
  };

  const handleRaiseFinding = (programId: number) => {
    setCurrentProgramId(programId);
    setNewFinding({ description: "", severity: "Low" });
    setFindingDialogOpen(true);
  };

  const handleSaveFinding = async () => {
    if (!selectedAudit || !currentProgramId) return;
    try {
      await api.createFinding({
        auditId: selectedAudit.id,
        auditProgramId: currentProgramId,
        description: newFinding.description,
        severity: newFinding.severity,
        status: 'Identified'
      });
      alert('Finding raised successfully!');
      setFindingDialogOpen(false);
    } catch (error) {
      console.error('Failed to create finding', error);
      alert('Failed to create finding.');
    }
  };

  const handleApproveAudit = async () => {
    if (!selectedAudit) return;
    if (window.confirm('Are you sure you want to approve the fieldwork and finalize this audit?')) {
      try {
        await api.updateAudit(selectedAudit.id, { status: 'Finalized' });
        alert('Audit finalized successfully!');
        setSelectedAudit(null);
        fetchActiveAudits();
      } catch (e) {
        console.error(e);
        alert('Failed to finalize audit.');
      }
    }
  };

  if (!selectedAudit) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          Select an Audit to Execute
        </Typography>
        {audits.length === 0 ? (
          <Typography>No active audits found.</Typography>
        ) : (
          <Paper elevation={1}>
            <List>
              {audits.map((audit, index) => (
                <React.Fragment key={audit.id}>
                  {index > 0 && <Divider />}
                  <ListItemButton onClick={() => handleSelectAudit(audit)}>
                    <ListItemText 
                      primary={audit.auditName} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <Chip label={audit.status} color="primary" size="small" />
                  </ListItemButton>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => {
          if (onBack) onBack();
          else setSelectedAudit(null);
        }} 
        sx={{ mb: 2 }}
      >
        {onBack ? 'Back' : 'Back to Audit List'}
      </Button>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
            Executing: {selectedAudit.auditName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedAudit.auditType} • {selectedAudit.startDate ? new Date(selectedAudit.startDate).toLocaleDateString() : 'No Start Date'} - {selectedAudit.endDate ? new Date(selectedAudit.endDate).toLocaleDateString() : 'No End Date'}
          </Typography>
        </Box>
        {userRole === 'Manager' && selectedAudit.status === 'Review' && (
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleApproveAudit}
          >
            Approve & Finalize
          </Button>
        )}
      </Box>
      
      {loading ? <CircularProgress /> : (
        <Box sx={{ mt: 2 }}>
          {programs.map(program => (
            <Accordion 
              key={program.id} 
              expanded={program.expanded} 
              onChange={() => toggleAccordion(program.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{program.procedureName}</Typography>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Control Reference:</Typography>
                  <Typography variant="body2" paragraph>{program.controlReference}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Expected Outcome:</Typography>
                  <Typography variant="body2" paragraph>{program.expectedOutcome}</Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
                    <TextField
                      label="Test Result / Actual Outcome"
                      multiline
                      minRows={3}
                      fullWidth
                      value={program.actualResult || ''}
                      onChange={(e) => handleResultChange(program.id, e.target.value)}
                      placeholder="Document your findings here..."
                      variant="outlined"
                      sx={{ mb: 2, bgcolor: 'white' }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading === program.id}
                      >
                        {uploading === program.id ? 'Uploading...' : 'Upload Evidence'}
                        <input 
                          type="file" 
                          hidden
                          onChange={(e) => handleFileUpload(program.id, e)}
                          disabled={uploading === program.id}
                        />
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleRaiseFinding(program.id)}
                      >
                        Raise Finding
                      </Button>
                    </Box>

                    {/* Evidence List */}
                    {evidenceMap[program.id] && evidenceMap[program.id].length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Attached Evidence:</Typography>
                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                          {evidenceMap[program.id].map((ev) => (
                            <ListItem
                              key={ev.id}
                              secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEvidence(program.id, ev.id)}>
                                  <DeleteIcon color="error" />
                                </IconButton>
                              }
                            >
                              <ListItemIcon>
                                <InsertDriveFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={ev.fileName}
                                secondary={ev.description || new Date(ev.createdAt).toLocaleDateString()}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Raise Finding Dialog */}
      <Dialog open={findingDialogOpen} onClose={() => setFindingDialogOpen(false)}>
        <DialogTitle>Raise Finding</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Finding Description"
              fullWidth
              multiline
              rows={3}
              value={newFinding.description}
              onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newFinding.severity}
                label="Severity"
                onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFindingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFinding} variant="contained" color="error" disabled={!newFinding.description}>
            Raise Finding
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditExecutionModule;