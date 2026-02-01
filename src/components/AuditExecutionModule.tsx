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
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FolderIcon from '@mui/icons-material/Folder';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
  reviewerComment: string | null;
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
  const [activeTab, setActiveTab] = useState(0); // 0: Programs, 1: Fieldwork, 2: Working Papers
  
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

  const handleCommentChange = async (id: number, comment: string) => {
    // Optimistic update
    setPrograms(programs.map(p => p.id === id ? { ...p, reviewerComment: comment } : p));
  };

  const saveComment = async (id: number, comment: string) => {
    try {
      await api.updateAuditProgram(id, { reviewerComment: comment });
    } catch (error) {
      console.error('Failed to save comment', error);
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

  const loadAllEvidence = useCallback(async () => {
    if (programs.length === 0) return;
    
    const promises = programs.map(p => api.getEvidenceList(p.id));
    try {
      const results = await Promise.all(promises);
      const newMap: {[key: number]: any[]} = {};
      results.forEach((data, index) => {
        if (Array.isArray(data)) {
            newMap[programs[index].id] = data;
        }
      });
      setEvidenceMap(newMap);
    } catch (e) {
      console.error("Failed to load all evidence", e);
    }
  }, [programs]);

  useEffect(() => {
    if (activeTab === 2 && selectedAudit) {
        loadAllEvidence();
    }
  }, [activeTab, selectedAudit, loadAllEvidence]);

  if (!selectedAudit) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          Active Audits (Select to Execute)
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
                      secondary={`${audit.auditType || 'Audit'} • ${audit.status}`}
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
        {onBack ? 'Back' : 'Back to Active Audits'}
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

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<AssignmentIcon />} label="Audit Programs" />
          <Tab icon={<FactCheckIcon />} label="Fieldwork & Testing" />
          <Tab icon={<FolderIcon />} label="Working Papers" />
        </Tabs>
      </Paper>
      
      {loading ? <CircularProgress /> : (
        <Box sx={{ mt: 2 }}>
          {/* Tab 0: Audit Programs (Read-Only Summary) */}
          {activeTab === 0 && (
             <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Procedure</strong></TableCell>
                            <TableCell><strong>Control Reference</strong></TableCell>
                            <TableCell><strong>Expected Outcome</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {programs.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.procedureName}</TableCell>
                                <TableCell>{p.controlReference || 'N/A'}</TableCell>
                                <TableCell>{p.expectedOutcome || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={p.actualResult ? "Tested" : "Pending"} 
                                        color={p.actualResult ? "success" : "default"} 
                                        size="small" 
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {programs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No audit programs defined.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </TableContainer>
          )}

          {/* Tab 1: Fieldwork & Testing (Interactive Accordion) */}
          {activeTab === 1 && (
             <Box>
               {programs.map(program => (
                <Accordion 
                  key={program.id} 
                  expanded={program.expanded} 
                  onChange={() => toggleAccordion(program.id)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography fontWeight="bold">{program.procedureName}</Typography>
                        {program.actualResult && <Chip label="Tested" color="success" size="small" />}
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Control Reference:</Typography>
                      <Typography variant="body2" paragraph>{program.controlReference}</Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary">Expected Outcome:</Typography>
                      <Typography variant="body2" paragraph>{program.expectedOutcome}</Typography>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Test Result:</Typography>
                        <ToggleButtonGroup
                          value={program.actualResult || ''}
                          exclusive
                          onChange={(e, val) => val && handleResultChange(program.id, val)}
                          sx={{ mb: 2 }}
                          size="small"
                        >
                           <ToggleButton value="Pass" color="success">
                             <CheckCircleIcon sx={{ mr: 1 }} /> Pass
                           </ToggleButton>
                           <ToggleButton value="Fail" color="error">
                             <CancelIcon sx={{ mr: 1 }} /> Fail
                           </ToggleButton>
                           <ToggleButton value="Partial" color="warning">
                             <HelpOutlineIcon sx={{ mr: 1 }} /> Partial
                           </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                          label="Reviewer Comments"
                          multiline
                          minRows={2}
                          fullWidth
                          value={program.reviewerComment || ''}
                          onChange={(e) => handleCommentChange(program.id, e.target.value)}
                          onBlur={(e) => saveComment(program.id, e.target.value)}
                          placeholder="Add comments..."
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
                              {evidenceMap[program.id].map((ev: any) => (
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
              {programs.length === 0 && <Typography>No programs to execute.</Typography>}
             </Box>
          )}

          {/* Tab 2: Working Papers (All Evidence) */}
          {activeTab === 2 && (
             <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>File Name</strong></TableCell>
                            <TableCell><strong>Related Procedure</strong></TableCell>
                            <TableCell><strong>Date Uploaded</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(evidenceMap).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No working papers uploaded yet.</TableCell>
                            </TableRow>
                        ) : (
                            Object.entries(evidenceMap).flatMap(([progId, evidenceList]) => {
                                const prog = programs.find(p => p.id === Number(progId));
                                return evidenceList.map((ev: any) => (
                                    <TableRow key={ev.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <InsertDriveFileIcon color="action" />
                                                <Link href="#" color="inherit" underline="hover">{ev.fileName}</Link>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{prog?.procedureName || `Program #${progId}`}</TableCell>
                                        <TableCell>{new Date(ev.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleDeleteEvidence(Number(progId), ev.id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ));
                            })
                        )}
                    </TableBody>
                </Table>
             </TableContainer>
          )}

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
