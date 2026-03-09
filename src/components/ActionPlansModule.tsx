import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachmentIcon from '@mui/icons-material/Attachment';
import DownloadIcon from '@mui/icons-material/Download';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);


interface ActionPlan {
  id: number;
  findingId: number;
  description: string;
  ownerId?: number;
  dueDate?: string;
  status: string;
}

interface ActionPlansModuleProps {
  findingId: number;
  open: boolean;
  onClose: () => void;
}

const ActionPlansModule: React.FC<ActionPlansModuleProps> = ({ findingId, open, onClose }) => {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [finding, setFinding] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentActionPlan, setCurrentActionPlan] = useState<Partial<ActionPlan>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)' || userRole === 'Chief Auditor';
  const isManager = userRole === 'Manager' || userRole === 'Audit Manager';

  useEffect(() => {
    if (open && findingId) {
      fetchData();
    }
  }, [open, findingId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Finding to get AuditProgram ID
      const findingData = await api.getFinding(findingId);
      setFinding(findingData);

      // 2. Fetch Action Plans
      const apData = await api.getActionPlans(findingId);
      setActionPlans(Array.isArray(apData) ? apData : []);

      // 3. Fetch Evidence if we have an audit program
      if (findingData.auditProgramId) {
        const evidenceData = await api.getEvidenceList(findingData.auditProgramId);
        setEvidence(Array.isArray(evidenceData) ? evidenceData : []);
      }
    } catch (error) {
      console.error('Failed to fetch action plan data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      // Send ONLY the status field to comply with strict backend Manager checks
      await api.updateActionPlan(id, { status: newStatus });
      MySwal.fire({
        title: 'Success',
        text: `Action plan marked as ${newStatus}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchData();
    } catch (error: any) {
      console.error('Failed to update status', error);
      MySwal.fire('Error', `Failed to update status: ${error.message}`, 'error');
    }
  };

  const handleAdd = () => {
    setCurrentActionPlan({
      findingId: findingId,
      description: '',
      status: 'Open',
      dueDate: ''
    });
    setIsEditing(false);
    setEditDialogOpen(true);
  };

  const handleEdit = (plan: ActionPlan) => {
    setCurrentActionPlan(plan);
    setIsEditing(true);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteActionPlan(id);
        MySwal.fire('Deleted!', 'Action plan has been deleted.', 'success');
        fetchData();
      } catch (error) {
        console.error('Failed to delete action plan', error);
        MySwal.fire('Error', 'Failed to delete action plan.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      // Role-aware payload construction to comply with backend restrictions
      // Managers can only update status, CAEs can update everything
      let updatePayload: any = {
        status: currentActionPlan.status,
      };

      if (isCAE) {
        updatePayload = {
          ...updatePayload,
          description: currentActionPlan.description,
          dueDate: currentActionPlan.dueDate ? new Date(currentActionPlan.dueDate) : undefined,
          ownerId: currentActionPlan.ownerId
        };
      }

      if (isEditing && currentActionPlan.id) {
        // If Manager, we only send status to avoid "Managers can only update the status" backend error
        // We explicitly construct the object to avoid any extra fields
        const payloadToSend = isCAE ? updatePayload : { status: currentActionPlan.status || 'Open' };
        await api.updateActionPlan(currentActionPlan.id, payloadToSend);
      } else {
        // Only CAEs can create
        await api.createActionPlan({
          ...updatePayload,
          findingId: findingId
        });
      }
      MySwal.fire('Success', 'Action plan saved successfully!', 'success');
      setEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save action plan', error);
      MySwal.fire('Error', `Failed to save action plan: ${error.message}`, 'error');
    }
  };

  const handlePreviewEvidence = async (evidenceId: number) => {
    try {
      const blob = await api.downloadEvidence(evidenceId);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Preview failed', error);
      MySwal.fire('Error', 'Failed to preview evidence.', 'error');
    }
  };

  const handleDownloadEvidence = async (evidenceId: number, fileName: string) => {
    try {
      const blob = await api.downloadEvidence(evidenceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      MySwal.fire('Error', 'Failed to download evidence.', 'error');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Action Plans for Finding #{findingId}
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {isCAE && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={handleAdd}>
                    Add Action Plan
                  </Button>
                </Box>
              )}
              {actionPlans.length === 0 ? (
                <Typography color="textSecondary" align="center">
                  No action plans found.
                </Typography>
              ) : (
                <List>
                  {actionPlans.map((plan) => (
                    <ListItem
                      key={plan.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isCAE && (
                            <Box>
                              <IconButton onClick={() => handleEdit(plan)}>
                                <EditIcon color="primary" />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(plan.id)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Box>
                          )}
                          {!isCAE && isManager && plan.status === 'Open' && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleStatusUpdate(plan.id, 'In Progress')}
                              sx={{ textTransform: 'none', borderRadius: '20px', px: 2 }}
                            >
                              Mark In Progress
                            </Button>
                          )}
                          {!isCAE && isManager && plan.status !== 'Open' && (
                            <Chip
                              label={plan.status}
                              color={plan.status === 'In Progress' ? 'info' : 'success'}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                      }
                      sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={plan.description}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              Status: {plan.status}
                            </Typography>
                            {plan.dueDate && ` | Due: ${new Date(plan.dueDate).toLocaleDateString()}`}

                            {/* Remediation Evidence Section for CAE */}
                            {isCAE && (
                              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ccc' }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <AttachmentIcon fontSize="inherit" /> Remediation Evidence:
                                </Typography>
                                {evidence.filter(ev => ev.description?.includes(plan.description) || ev.description?.includes(`Action Plan #${plan.id}`)).length > 0 ? (
                                  <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {evidence
                                      .filter(ev => ev.description?.includes(plan.description) || ev.description?.includes(`Action Plan #${plan.id}`))
                                      .map(ev => (
                                        <Chip
                                          key={ev.id}
                                          icon={<VisibilityIcon />}
                                          label={ev.fileName}
                                          size="small"
                                          onClick={() => handlePreviewEvidence(ev.id)}
                                          onDelete={() => handleDownloadEvidence(ev.id, ev.fileName)}
                                          deleteIcon={<DownloadIcon />}
                                          sx={{ cursor: 'pointer', mb: 0.5 }}
                                        />
                                      ))
                                    }
                                  </Stack>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">No evidence provided yet.</Typography>
                                )}
                              </Box>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>{isEditing ? 'Edit Action Plan' : 'New Action Plan'}</DialogTitle>
          <DialogContent sx={{ pt: 2, minWidth: 400 }}>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={currentActionPlan.description || ''}
                onChange={(e) => setCurrentActionPlan({ ...currentActionPlan, description: e.target.value })}
                disabled={!isCAE}
              />
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={currentActionPlan.dueDate ? new Date(currentActionPlan.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setCurrentActionPlan({ ...currentActionPlan, dueDate: e.target.value })}
                disabled={!isCAE}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentActionPlan.status || 'Open'}
                  label="Status"
                  onChange={(e) => setCurrentActionPlan({ ...currentActionPlan, status: e.target.value })}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  {isCAE && <MenuItem value="Closed">Closed</MenuItem>}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" disabled={!currentActionPlan.description && isCAE}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => { if (previewUrl) window.URL.revokeObjectURL(previewUrl); setPreviewOpen(false); setPreviewUrl(null); }} maxWidth="lg" fullWidth>
        <DialogTitle>Evidence Preview</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '70vh' }}>
          {previewUrl ? (
            <iframe src={previewUrl} title="Evidence Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <Box p={3}><Typography>No preview available</Typography></Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { if (previewUrl) window.URL.revokeObjectURL(previewUrl); setPreviewOpen(false); setPreviewUrl(null); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionPlansModule;
