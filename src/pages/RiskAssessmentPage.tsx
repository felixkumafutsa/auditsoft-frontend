import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);

interface RiskAssessment {
  id: number;
  auditId: number;
  stage: string;
  riskLevel: string;
  riskFactors: string[];
  mitigationActions?: string[];
  assessedBy?: { id: number; name: string; email: string };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  audit: {
    id: number;
    auditName: string;
    auditType: string;
    auditUniverse?: {
      entityName: string;
      entityType: string;
    };
  };
}

interface OverallRisk {
  overallRisk: string;
  assessmentCount: number;
  latestAssessment: RiskAssessment | null;
  allAssessments: RiskAssessment[];
}

const RiskAssessmentPage: React.FC = () => {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [overallRisk, setOverallRisk] = useState<OverallRisk | null>(null);
  const [riskTrend, setRiskTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<RiskAssessment | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [audits, setAudits] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    auditId: '',
    stage: 'planning',
    riskLevel: 'medium',
    riskFactors: [] as string[],
    mitigationActions: [] as string[],
    notes: ''
  });

  const [newRiskFactor, setNewRiskFactor] = useState('');
  const [newMitigationAction, setNewMitigationAction] = useState('');

  useEffect(() => {
    fetchAssessments();
    fetchAudits();
  }, []);

  useEffect(() => {
    if (selectedAuditId) {
      fetchOverallRisk();
      fetchRiskTrend();
    }
  }, [selectedAuditId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await api.getRiskAssessments();
      // Parse JSON strings for riskFactors and mitigationActions
      const processedData = data.map((assessment: any) => ({
        ...assessment,
        riskFactors: Array.isArray(assessment.riskFactors) 
          ? assessment.riskFactors 
          : JSON.parse(assessment.riskFactors || '[]'),
        mitigationActions: Array.isArray(assessment.mitigationActions) 
          ? assessment.mitigationActions 
          : JSON.parse(assessment.mitigationActions || '[]')
      }));
      setAssessments(processedData);
    } catch (error: any) {
      console.error('Failed to fetch risk assessments:', error);
      MySwal.fire('Error', error.message || 'Failed to load risk assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const data = await api.getAudits();
      setAudits(data);
    } catch (error: any) {
      console.error('Failed to fetch audits:', error);
    }
  };

  const fetchOverallRisk = async () => {
    if (!selectedAuditId) return;
    try {
      const data = await api.getOverallRisk(selectedAuditId);
      setOverallRisk(data);
    } catch (error: any) {
      console.error('Failed to fetch overall risk:', error);
    }
  };

  const fetchRiskTrend = async () => {
    if (!selectedAuditId) return;
    try {
      const data = await api.getRiskTrend(selectedAuditId);
      setRiskTrend(data);
    } catch (error: any) {
      console.error('Failed to fetch risk trend:', error);
    }
  };

  const handleOpenDialog = (assessment?: RiskAssessment) => {
    if (assessment) {
      setEditingAssessment(assessment);
      setFormData({
        auditId: assessment.auditId.toString(),
        stage: assessment.stage,
        riskLevel: assessment.riskLevel,
        riskFactors: assessment.riskFactors,
        mitigationActions: assessment.mitigationActions || [],
        notes: assessment.notes || ''
      });
    } else {
      setEditingAssessment(null);
      setFormData({
        auditId: '',
        stage: 'planning',
        riskLevel: 'medium',
        riskFactors: [],
        mitigationActions: [],
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAssessment(null);
    setNewRiskFactor('');
    setNewMitigationAction('');
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        auditId: parseInt(formData.auditId),
        assessedBy: 2 // TODO: Get from auth context (using admin user ID 2 for now)
      };

      if (editingAssessment) {
        await api.updateRiskAssessment(editingAssessment.id, payload);
      } else {
        await api.createRiskAssessment(payload);
      }
      
      handleCloseDialog();
      fetchAssessments();
      if (selectedAuditId) {
        fetchOverallRisk();
        fetchRiskTrend();
      }
      MySwal.fire('Success', 'Risk assessment saved successfully', 'success');
    } catch (error: any) {
      console.error('Failed to save risk assessment:', error);
      MySwal.fire('Error', error.message || 'Failed to save risk assessment', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Delete Risk Assessment?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteRiskAssessment(id);
        MySwal.fire('Deleted', 'Risk assessment has been deleted.', 'success');
        fetchAssessments();
        if (selectedAuditId) {
          fetchOverallRisk();
          fetchRiskTrend();
        }
      } catch (error: any) {
        console.error('Failed to delete risk assessment:', error);
        MySwal.fire('Error', error.message || 'Failed to delete risk assessment', 'error');
      }
    }
  };

  const addRiskFactor = () => {
    if (newRiskFactor.trim()) {
      setFormData({
        ...formData,
        riskFactors: [...formData.riskFactors, newRiskFactor.trim()]
      });
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index: number) => {
    setFormData({
      ...formData,
      riskFactors: formData.riskFactors.filter((_, i) => i !== index)
    });
  };

  const addMitigationAction = () => {
    if (newMitigationAction.trim()) {
      setFormData({
        ...formData,
        mitigationActions: [...formData.mitigationActions, newMitigationAction.trim()]
      });
      setNewMitigationAction('');
    }
  };

  const removeMitigationAction = (index: number) => {
    setFormData({
      ...formData,
      mitigationActions: formData.mitigationActions.filter((_, i) => i !== index)
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'planning': return 'info';
      case 'execution': return 'primary';
      case 'review': return 'secondary';
      case 'closing': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Risk Management</Typography>
          <Typography color="text.primary">Risk Assessments</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F1A2B' }}>
          Risk Assessment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track and manage risk assessments throughout the audit lifecycle.
        </Typography>
      </Box>

      {/* Overall Risk Summary */}
      {overallRisk && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Overall Risk Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box textAlign="center">
                  <Chip
                    label={overallRisk.overallRisk.toUpperCase()}
                    color={getRiskLevelColor(overallRisk.overallRisk) as any}
                    sx={{ mb: 1, fontSize: '1rem', height: '32px' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Current Risk Level
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {overallRisk.assessmentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assessments
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Risk Trend by Stage
                  </Typography>
                  {riskTrend.map((trend, index) => (
                    <Box key={trend.stage} sx={{ mb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" textTransform="capitalize">
                          {trend.stage}
                        </Typography>
                        <Chip
                          label={trend.riskLevel}
                          color={trend.riskLevel === 'not_assessed' ? 'default' : getRiskLevelColor(trend.riskLevel) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Filter by Audit"
            value={selectedAuditId || ''}
            onChange={(e) => setSelectedAuditId(e.target.value ? parseInt(e.target.value) : null)}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Audits</MenuItem>
            {audits.map((audit) => (
              <MenuItem key={audit.id} value={audit.id}>
                {audit.auditName}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Risk Assessment
        </Button>
      </Box>

      {/* Assessments Table */}
      <Card elevation={2}>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Audit</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Risk Factors</TableCell>
                  <TableCell>Assessor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments
                  .filter(a => !selectedAuditId || a.auditId === selectedAuditId)
                  .map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {assessment.audit.auditName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assessment.audit.auditUniverse?.entityName || 'No Entity'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assessment.stage}
                        color={getStageColor(assessment.stage) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assessment.riskLevel}
                        color={getRiskLevelColor(assessment.riskLevel) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        {assessment.riskFactors.slice(0, 2).map((factor, index) => (
                          <Chip key={index} label={factor} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {assessment.riskFactors.length > 2 && (
                          <Chip label={`+${assessment.riskFactors.length - 2}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {assessment.assessedBy?.name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(assessment)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(assessment.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingAssessment ? 'Edit Risk Assessment' : 'Add New Risk Assessment'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Audit"
                  value={formData.auditId}
                  onChange={(e) => setFormData({ ...formData, auditId: e.target.value })}
                  required
                >
                  {audits.map((audit) => (
                    <MenuItem key={audit.id} value={audit.id}>
                      {audit.auditName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Stage"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="execution">Execution</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="closing">Closing</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Risk Level"
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}><Typography variant="caption">Risk Factors</Typography></Divider>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add risk factor"
                      value={newRiskFactor}
                      onChange={(e) => setNewRiskFactor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRiskFactor()}
                    />
                    <Button onClick={addRiskFactor} variant="outlined">Add</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.riskFactors.map((factor, index) => (
                      <Chip
                        key={index}
                        label={factor}
                        onDelete={() => removeRiskFactor(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}><Typography variant="caption">Mitigation Actions</Typography></Divider>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add mitigation action"
                      value={newMitigationAction}
                      onChange={(e) => setNewMitigationAction(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMitigationAction()}
                    />
                    <Button onClick={addMitigationAction} variant="outlined">Add</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.mitigationActions.map((action, index) => (
                      <Chip
                        key={index}
                        label={action}
                        onDelete={() => removeMitigationAction(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskAssessmentPage;
