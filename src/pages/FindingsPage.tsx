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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

interface Finding {
  id: number;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  auditId: number;
  rootCause?: string;
  createdAt: string;
}

const FindingsPage: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [transitionDialog, setTransitionDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const userRole = localStorage.getItem('userRole') || 'Auditor';

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const data = await api.getFindings?.();
      setFindings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch findings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTransitionDialog = async (finding: Finding) => {
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
      alert('Finding status updated successfully!');
      setTransitionDialog(false);
      setNewStatus('');
      fetchFindings();
    } catch (err) {
      console.error('Failed to transition finding', err);
      alert('Failed to update finding status');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identified':
        return 'default';
      case 'Validated':
        return 'info';
      case 'Action Assigned':
        return 'warning';
      case 'Remediation In Progress':
        return 'warning';
      case 'Verified':
        return 'success';
      case 'Closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns: GridColDef<Finding>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleOpenTransitionDialog(params.row)}
          >
            Update Status
          </Button>
        </Box>
      ),
    },
  ];

  // Summary Stats
  const criticalCount = findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length;
  const openCount = findings.filter(f => f.status !== 'Closed').length;
  const closedCount = findings.filter(f => f.status === 'Closed').length;

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
            sx={{ height: 600 }}
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
          <Button onClick={handleTransition} variant="contained" disabled={!newStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FindingsPage;
