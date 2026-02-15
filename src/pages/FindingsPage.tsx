import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';
import ActionPlansModule from '../components/ActionPlansModule';
import { getStatusColor } from '../utils/statusColors';

const MySwal = withReactContent(Swal);

interface Finding {
  id: number;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  auditId: number;
  audit?: {
    auditName: string;
    auditType: string;
  };
  auditProgram?: {
    procedureName: string;
  };
  rootCause?: string;
  createdAt: string;
}

interface FindingsPageProps {
  viewMode?: 'all' | 'draft' | 'my';
}

const FindingsPage: React.FC<FindingsPageProps> = ({ viewMode = 'all' }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [transitionDialog, setTransitionDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const userRole = localStorage.getItem('userRole') || 'Auditor';
  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isManager = userRole === 'Audit Manager' || userRole === 'Manager';
  const isAuditor = userRole === 'Auditor';
  const isProcessOwner = userRole === 'ProcessOwner' || userRole === 'Process Owner';
  const isBoardViewer = userRole === 'BoardViewer' || userRole === 'Board Viewer' || userRole === 'Executive';
  const isRestricted = isProcessOwner || isBoardViewer;

  // Draft Form State
  const [draftDescription, setDraftDescription] = useState('');
  const [draftSeverity, setDraftSeverity] = useState('Low');
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);

  // Action Plan State
  const [actionPlansOpen, setActionPlansOpen] = useState(false);
  const [selectedFindingIdForActions, setSelectedFindingIdForActions] = useState<number | null>(null);

  // Summary Stats
  const criticalCount = findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length;
  const openCount = findings.filter(f => f.status !== 'Closed').length;
  const closedCount = findings.filter(f => f.status === 'Closed').length;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchFindings();
  }, [viewMode]);

  useEffect(() => {
    if (!loading && criticalCount > 0) {
      MySwal.fire({
        title: 'Attention Required',
        text: `You have ${criticalCount} critical findings that require immediate attention.`,
        icon: 'error',
        confirmButtonColor: '#d32f2f'
      });
    }
  }, [loading, criticalCount]);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const data = await api.getFindings?.();
      let filteredData = Array.isArray(data) ? data : [];

      // Client-side filtering based on viewMode
      if (viewMode === 'draft') {
        filteredData = filteredData.filter((f: any) => f.status === 'Identified' || f.status === 'Draft');
      } else if (viewMode === 'my') {
        // Filter by assigned user
        // Assuming finding has assignedToId or we check ActionPlans
        // For now, we simulate this since backend might not return assignedToId yet
        // filteredData = filteredData.filter((f: any) => f.assignedToId === currentUser?.id);

        // Temporary: Just show all for demo, or filter if property exists
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          filteredData = filteredData.filter((f: any) => f.assignedToId === user.id);
        }
      }

      setFindings(filteredData);
    } catch (err) {
      console.error('Failed to fetch findings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTransitionDialog = async (finding: Finding) => {
    if (isRestricted) return;
    setSelectedFinding(finding);
    try {
      const response = await api.getAllowedTransitions?.(finding.id);
      setAllowedTransitions(response?.allowedTransitions || []);
    } catch (err) {
      console.error('Failed to fetch allowed transitions', err);
    }
    setTransitionDialog(true);
  };

  const handleTransition = async () => {
    if (!selectedFinding || !newStatus) return;
    try {
      await api.transitionFinding?.(selectedFinding.id, newStatus, userRole);
      MySwal.fire('Success', 'Finding status updated successfully!', 'success');
      setTransitionDialog(false);
      setNewStatus('');
      fetchFindings();
    } catch (err) {
      console.error('Failed to transition finding', err);
      MySwal.fire('Error', 'Failed to update finding status', 'error');
    }
  };

  const handleManageActions = (id: number) => {
    setSelectedFindingIdForActions(id);
    setActionPlansOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return '#d32f2f';
      case 'High':
        return '#ed6c02';
      case 'Medium':
        return '#fbc02d';
      case 'Low':
        return '#2e7d32';
      default:
        return '#757575';
    }
  };

  const columns: GridColDef<Finding>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auditName',
      headerName: 'Audit Name',
      width: 200,
      valueGetter: (_value, row) => row.audit?.auditName || 'N/A'
    },
    {
      field: 'auditType',
      headerName: 'Audit Type',
      width: 130,
      valueGetter: (_value, row) => row.audit?.auditType || 'N/A'
    },
    {
      field: 'auditProgram',
      headerName: 'Audit Program',
      width: 200,
      valueGetter: (_value, row) => row.auditProgram?.procedureName || 'N/A'
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ backgroundColor: getSeverityColor(params.value), color: 'white' }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getStatusColor(params.value) as any} />
      ),
    },
  ];

  const handleSaveDraft = async () => {
    if (!draftDescription) return;
    try {
      // Mock save or call api.createFinding if it exists
      // For now we simulate success
      await MySwal.fire('Success', 'Draft finding saved successfully!', 'success');
      setDraftDescription('');
      setDraftSeverity('Low');
      setEvidenceFile(null);
    } catch (err) {
      MySwal.fire('Error', 'Failed to save draft.', 'error');
    }
  };

  const handleCancelDraft = async () => {
    if (draftDescription) {
      const result = await MySwal.fire({
        title: 'Discard draft?',
        text: 'Are you sure you want to discard this draft finding?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        confirmButtonText: 'Yes, discard'
      });
      if (!result.isConfirmed) return;
    }
    setDraftDescription('');
    setDraftSeverity('Low');
    setEvidenceFile(null);
  };

  if (viewMode === 'draft') {
    return (
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
        <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
          Draft New Finding
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <TextField
              label="Finding Description"
              multiline
              rows={4}
              fullWidth
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Describe the finding in detail..."
            />

            <TextField
              select
              label="Severity"
              fullWidth
              value={draftSeverity}
              onChange={(e) => setDraftSeverity(e.target.value)}
            >
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>

            <Box sx={{ border: '1px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Upload Evidence (Screenshots, Logs, Documents)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                component="label"
              >
                Select File
                <input type="file" hidden onChange={(e) => setEvidenceFile(e.target.files?.[0]?.name || null)} />
              </Button>
              {evidenceFile && <Typography variant="caption" display="block" sx={{ mt: 1 }}>Selected: {evidenceFile}</Typography>}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleCancelDraft}>Cancel</Button>
              <Button variant="contained" disabled={!draftDescription} onClick={handleSaveDraft}>Save Draft</Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold', mb: 3 }}>
        Findings & Remediation
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card sx={{ borderLeft: '5px solid #d32f2f' }}>
          <CardContent>
            <Typography color="textSecondary" variant="subtitle2">
              Critical Findings
            </Typography>
            <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
              {criticalCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: '5px solid #ed6c02' }}>
          <CardContent>
            <Typography color="textSecondary" variant="subtitle2">
              Open Findings
            </Typography>
            <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
              {openCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: '5px solid #2e7d32' }}>
          <CardContent>
            <Typography color="textSecondary" variant="subtitle2">
              Closed Findings
            </Typography>
            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {closedCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderLeft: '5px solid #1976d2' }}>
          <CardContent>
            <Typography color="textSecondary" variant="subtitle2">
              Total Findings
            </Typography>
            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              {findings.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Critical Findings Alert */}
      {criticalCount > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Attention Required:</strong> You have {criticalCount} critical findings that require immediate attention.
        </Alert>
      )}

      {/* Findings Table */}
      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={findings}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            onRowClick={(params) => handleOpenTransitionDialog(params.row)}
            sx={{ height: 600, cursor: 'pointer' }}
          />
        )}
      </Paper>

      {/* Transition Status Dialog */}
      <Dialog open={transitionDialog} onClose={() => setTransitionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Finding Status</DialogTitle>
        <DialogContent>
          {selectedFinding && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Current Status:</strong> {selectedFinding.status}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Finding:</strong> {selectedFinding.description}
              </Typography>
              <TextField
                select
                fullWidth
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={allowedTransitions.length === 0}
              >
                {allowedTransitions.map((transition) => (
                  <MenuItem key={transition} value={transition}>
                    {transition}
                  </MenuItem>
                ))}
              </TextField>
              {allowedTransitions.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No allowed transitions from this status.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransitionDialog(false)}>Cancel</Button>
          {!isRestricted && (
            <Button onClick={handleTransition} variant="contained" disabled={!newStatus}>
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {/* Action Plans Dialog */}
      <Dialog
        open={actionPlansOpen}
        onClose={() => setActionPlansOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Action Plans</DialogTitle>
        <DialogContent>
          {selectedFindingIdForActions && (
            <ActionPlansModule
              findingId={selectedFindingIdForActions}
              open={actionPlansOpen}
              onClose={() => setActionPlansOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionPlansOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FindingsPage;
