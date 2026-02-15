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
  Link,
  Tooltip,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoryIcon from "@mui/icons-material/History";
import { getStatusColor } from "../utils/statusColors";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';
import { Audit, AuditProgram } from '../types/audit';

const MySwal = withReactContent(Swal);

interface AuditExecutionModuleProps {
  initialAudit?: Audit | null;
  onBack?: () => void;
  onEdit?: (audit: Audit) => void;
  onDelete?: (id: number) => void;
  onAssign?: (audit: Audit) => void;
  onApprove?: (id: number) => void;
  onManagePrograms?: (audit: Audit) => void;
  onFinalize?: (audit: Audit) => void;
  onClose?: (audit: Audit) => void;
  onPreview?: (id: number) => void;
  onDownload?: (id: number) => void;
}

const AuditExecutionModule: React.FC<AuditExecutionModuleProps> = ({
  initialAudit,
  onBack,
  onEdit,
  onDelete,
  onAssign,
  onApprove,
  onManagePrograms,
  onFinalize,
  onClose,
  onPreview,
  onDownload
}) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(initialAudit || null);
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<{ [key: number]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [uploading, setUploading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Programs, 1: Fieldwork, 2: Working Papers, 3: Comments

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Finding Dialog State
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);
  const [newFinding, setNewFinding] = useState({ description: "", severity: "Low" });

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAuditor = currentUser?.role?.toLowerCase().includes('auditor');
  const isCAE = currentUser?.role?.toLowerCase().includes('cae') || currentUser?.role?.toLowerCase().includes('chief');
  const isManager = currentUser?.role?.toLowerCase().includes('manager');
  const isProcessOwner = currentUser?.role?.toLowerCase().includes('owner');

  useEffect(() => {
    if (initialAudit) {
      handleSelectAudit(initialAudit);
    } else {
      fetchActiveAudits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAudit]);

  const hasEvidence = React.useMemo(() => {
    return Object.values(evidenceMap).some(list => list && list.length > 0);
  }, [evidenceMap]);

  const fetchActiveAudits = async () => {
    try {
      const data = await api.getAudits();
      // Filter for audits that are ready for execution
      const active = Array.isArray(data) ? data.filter((a: Audit) => {
        if (isManager) {
          return ['In Progress', 'Approved', 'Under Review'].includes(a.status);
        }
        return ['In Progress', 'Approved'].includes(a.status);
      }) : [];
      setAudits(active);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAudit) return;

    // Validation: Auditor cannot submit for review without evidence
    if (isAuditor && newStatus === 'Under Review') {
      if (!hasEvidence) {
        MySwal.fire({
          title: 'Evidence Required',
          text: 'You must upload at least one piece of evidence before submitting the audit for review.',
          icon: 'warning',
          confirmButtonColor: '#1976d2'
        });
        return;
      }
    }

    const result = await MySwal.fire({
      title: `Transition to ${newStatus}?`,
      text: "Are you sure you want to change the audit status?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.updateAudit(selectedAudit.id, { status: newStatus });
        MySwal.fire('Success', `Audit status transitioned to ${newStatus} successfully!`, 'success');
        setSelectedAudit({ ...selectedAudit, status: newStatus });
        fetchActiveAudits();
      } catch (e) {
        console.error(e);
        MySwal.fire('Error', `Failed to update status to ${newStatus}.`, 'error');
      }
    }
  };

  const handleSelectAudit = async (audit: Audit) => {
    setSelectedAudit(audit);
    setLoading(true);
    try {
      const data = await api.getAuditPrograms(audit.id);
      const mappedPrograms = Array.isArray(data) ? data.map((p: any) => ({ ...p, expanded: false })) : [];
      setPrograms(mappedPrograms);
      localStorage.setItem(`cached_programs_${audit.id}`, JSON.stringify(mappedPrograms));

      // Pre-fetch evidence for all programs to support validation
      if (Array.isArray(data)) {
        data.forEach((p: any) => fetchEvidence(p.id));
      }
    } catch (error) {
      console.error('Failed to fetch audit programs', error);
      const cached = localStorage.getItem(`cached_programs_${audit.id}`);
      if (cached) {
        setPrograms(JSON.parse(cached));
      }
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
    const updatedPrograms = programs.map(p => p.id === id ? { ...p, actualResult: result } : p);
    setPrograms(updatedPrograms);

    if (selectedAudit) {
      localStorage.setItem(`cached_programs_${selectedAudit.id}`, JSON.stringify(updatedPrograms));
    }

    try {
      await api.updateAuditProgram(id, { actualResult: result });
    } catch (error) {
      console.error('Failed to save result', error);
      if (!isOffline) {
        MySwal.fire('Error', 'Failed to save result. It is saved locally.', 'error');
      }
    }
  };

  const handleCommentChange = async (id: number, comment: string) => {
    // Optimistic update
    const updatedPrograms = programs.map(p => p.id === id ? { ...p, reviewerComment: comment } : p);
    setPrograms(updatedPrograms);
    if (selectedAudit) {
      localStorage.setItem(`cached_programs_${selectedAudit.id}`, JSON.stringify(updatedPrograms));
    }
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
      MySwal.fire('Success', 'Evidence uploaded successfully!', 'success');
      fetchEvidence(programId);
    } catch (error) {
      console.error('Upload failed', error);
      MySwal.fire('Error', 'Upload failed.', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteEvidence = async (programId: number, evidenceId: number) => {
    const result = await MySwal.fire({
      title: 'Delete evidence?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteEvidence(evidenceId);
        await fetchEvidence(programId);
        MySwal.fire('Deleted', 'Evidence has been removed.', 'success');
      } catch (error) {
        console.error('Failed to delete evidence', error);
        MySwal.fire('Error', 'Failed to delete evidence.', 'error');
      }
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
      MySwal.fire('Success', 'Finding raised successfully!', 'success');
      setFindingDialogOpen(false);
    } catch (error) {
      console.error('Failed to create finding', error);
      MySwal.fire('Error', 'Failed to create finding.', 'error');
    }
  };

  const loadAllEvidence = useCallback(async () => {
    if (programs.length === 0) return;

    const promises = programs.map(p => api.getEvidenceList(p.id));
    try {
      const results = await Promise.all(promises);
      const newMap: { [key: number]: any[] } = {};
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const handleDownloadEvidence = async (evidenceId: number, fileName: string) => {
    try {
      const blob = await api.downloadEvidence(evidenceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      MySwal.fire('Error', 'Failed to download evidence.', 'error');
    }
  };

  const handlePreviewEvidence = async (evidenceId: number) => {
    try {
      // Find the evidence to get its file type
      let foundEv: any = null;
      Object.values(evidenceMap).forEach(list => {
        const match = list.find(e => e.id === evidenceId);
        if (match) foundEv = match;
      });

      const blob = await api.downloadEvidence(evidenceId);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewType(foundEv?.fileType || null);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Preview failed', error);
      MySwal.fire('Error', 'Failed to preview evidence.', 'error');
    }
  };

  const handleEvidenceHistory = async (evidenceId: number) => {
    try {
      const data = await api.getEvidenceDetails(evidenceId);
      setHistoryData(data.versions || []);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch history', error);
      MySwal.fire('Error', 'Failed to fetch evidence history.', 'error');
    }
  };

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

      {isOffline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Changes are saved locally and will sync when you are back online.
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
            Executing: {selectedAudit.auditName}
          </Typography>
          <Chip
            label={selectedAudit.status}
            color={getStatusColor(selectedAudit.status)}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {/* Contextual Action Buttons */}
          {!isAuditor && onEdit && (selectedAudit.status === 'Planned' || selectedAudit.status === 'Approved') && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(selectedAudit)}
            >
              Edit Plan
            </Button>
          )}

          {isManager && onDelete && selectedAudit.status !== 'Closed' && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(selectedAudit.id)}
            >
              Delete
            </Button>
          )}

          {((isManager || isCAE) && selectedAudit.status === 'Planned') && onManagePrograms && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlaylistAddIcon />}
              onClick={() => onManagePrograms(selectedAudit)}
            >
              Programs
            </Button>
          )}

          {isManager && onAssign && selectedAudit.status === 'Approved' && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => onAssign(selectedAudit)}
            >
              Assign
            </Button>
          )}

          {isCAE && selectedAudit.status === 'Planned' && onApprove && (
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => onApprove(selectedAudit.id)}
            >
              Approve Plan
            </Button>
          )}

          {isCAE && selectedAudit.status === 'Pending CAE Approval' && (
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={async () => {
                try {
                  await api.transitionAudit(selectedAudit.id, 'Finalized', currentUser?.role);
                  MySwal.fire('Approved', 'Report has been approved and finalized.', 'success');
                  setSelectedAudit({ ...selectedAudit, status: 'Finalized' });
                } catch (e) {
                  console.error(e);
                  MySwal.fire('Error', 'Failed to approve report.', 'error');
                }
              }}
            >
              Approve Report
            </Button>
          )}

          {isManager && (selectedAudit.status === 'Execution Finished' || selectedAudit.status === 'Under Review') && onFinalize && (
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => onFinalize(selectedAudit)}
            >
              Submit for CAE Approval
            </Button>
          )}

          {isCAE && (selectedAudit.status === 'Process Owner Review' || selectedAudit.status === 'Finalized') && onClose && (
            <Button
              variant="contained"
              size="small"
              color="warning"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={() => onClose(selectedAudit)}
            >
              Close Audit
            </Button>
          )}

          {/* Icon-only secondary actions */}
          {isManager && selectedAudit.status === 'Closed' && onPreview && (
            <Tooltip title="View Audit Report">
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => onPreview(selectedAudit.id)}
              >
                View Audit Report
              </Button>
            </Tooltip>
          )}

          {isManager && selectedAudit.status === 'Closed' && (
            <Tooltip title="Save Report">
              <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={async () => {
                  try {
                    await api.saveReport(selectedAudit.id);
                    MySwal.fire('Success', 'Report saved successfully!', 'success');
                  } catch (e) {
                    console.error(e);
                    MySwal.fire('Error', 'Failed to save report.', 'error');
                  }
                }}
              >
                Save Report
              </Button>
            </Tooltip>
          )}

          {isCAE && selectedAudit.status === 'Closed' && onDownload && (
            <Tooltip title="Download Audit Report">
              <IconButton size="small" onClick={() => onDownload(selectedAudit.id)}>
                <DescriptionIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Workflow Status Transitions (Interactive) */}
          {isAuditor && selectedAudit.status === 'In Progress' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdateStatus('Under Review')}
              size="small"
              disabled={!hasEvidence}
            >
              Submit for Review
            </Button>
          )}
          {isManager && selectedAudit.status === 'Under Review' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus('Execution Finished')}
              size="small"
            >
              Confirm Execution Finished
            </Button>
          )}
          {isProcessOwner && selectedAudit.status === 'Finalized' && (
            <Button
              variant="contained"
              color="info"
              onClick={() => handleUpdateStatus('Process Owner Review')}
              size="small"
            >
              Mark as Viewed
            </Button>
          )}
        </Stack>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<AssignmentIcon />} label="Audit Programs" />
          <Tab icon={<FactCheckIcon />} label="Fieldwork & Testing" />
          <Tab icon={<FolderIcon />} label="Working Papers" />
          <Tab icon={<PlaylistAddIcon />} label="Comments" />
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

                        {/* Reviewer Comments - Manager Only */}
                        {isManager && (
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
                        )}

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          {isAuditor && !isCAE && (
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
                          )}
                          {isAuditor && !isCAE && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleRaiseFinding(program.id)}
                            >
                              Raise Finding
                            </Button>
                          )}
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
                                    <Stack direction="row" spacing={1}>
                                      <Tooltip title="Preview">
                                        <IconButton size="small" onClick={() => handlePreviewEvidence(ev.id)} color="primary">
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Download">
                                        <IconButton size="small" onClick={() => handleDownloadEvidence(ev.id, ev.fileName)} color="primary">
                                          <FileDownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="History">
                                        <IconButton size="small" onClick={() => handleEvidenceHistory(ev.id)} color="info">
                                          <HistoryIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      {isAuditor && !isCAE && (
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEvidence(program.id, ev.id)}>
                                          <DeleteIcon color="error" fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Stack>
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
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Preview">
                                <IconButton size="small" onClick={() => handlePreviewEvidence(ev.id)} color="primary">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton size="small" onClick={() => handleDownloadEvidence(ev.id, ev.fileName)} color="primary">
                                  <FileDownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Version History">
                                <IconButton size="small" onClick={() => handleEvidenceHistory(ev.id)} color="info">
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {isAuditor && !isCAE && (
                                <IconButton size="small" onClick={() => handleDeleteEvidence(Number(progId), ev.id)} color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ));
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 3: Comments & Feedback */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Reviewer Comments & Audit Feedback</Typography>
              <Paper variant="outlined">
                <List>
                  {programs.filter(p => p.reviewerComment).length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No comments have been left on this audit yet." />
                    </ListItem>
                  ) : (
                    programs.filter(p => p.reviewerComment).map(p => (
                      <React.Fragment key={p.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={`Procedure: ${p.procedureName}`}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  Comment:
                                </Typography>
                                {` — ${p.reviewerComment}`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Paper>
            </Box>
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

      {/* Evidence Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => {
          if (previewUrl) window.URL.revokeObjectURL(previewUrl);
          setPreviewDialogOpen(false);
          setPreviewUrl(null);
          setPreviewType(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Evidence Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl ? (
            <Box sx={{ height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {previewType?.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : previewType === 'application/pdf' ? (
                <iframe title="Evidence Preview" src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>Preview not available for this file type</Typography>
                  <Typography variant="body2" color="text.secondary">Please download the file to view its contents.</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = previewUrl;
                      a.download = 'evidence'; // Fallback name
                      a.click();
                    }}
                  >
                    Download Now
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>Loading preview...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
            setPreviewDialogOpen(false);
            setPreviewUrl(null);
            setPreviewType(null);
          }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Evidence History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Evidence Version History</DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Changes</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No previous versions found.</TableCell>
                  </TableRow>
                ) : (
                  historyData.map((v, idx) => (
                    <TableRow key={v.id}>
                      <TableCell>{historyData.length - idx}</TableCell>
                      <TableCell>{v.fileName}</TableCell>
                      <TableCell>{v.description || 'Initial Version'}</TableCell>
                      <TableCell>{new Date(v.uploadedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditExecutionModule;
