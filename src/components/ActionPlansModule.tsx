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
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentActionPlan, setCurrentActionPlan] = useState<Partial<ActionPlan>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open && findingId) {
      fetchActionPlans();
    }
  }, [open, findingId]);

  const fetchActionPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getActionPlans(findingId);
      setActionPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch action plans', error);
    } finally {
      setLoading(false);
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
    if (!window.confirm('Are you sure you want to delete this action plan?')) return;
    try {
      await api.deleteActionPlan(id);
      fetchActionPlans();
    } catch (error) {
      console.error('Failed to delete action plan', error);
      alert('Failed to delete action plan.');
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && currentActionPlan.id) {
        await api.updateActionPlan(currentActionPlan.id, currentActionPlan);
      } else {
        await api.createActionPlan({
          ...currentActionPlan,
          findingId: findingId
        });
      }
      setEditDialogOpen(false);
      fetchActionPlans();
    } catch (error) {
      console.error('Failed to save action plan', error);
      alert('Failed to save action plan.');
    }
  };

  return (
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
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button startIcon={<AddIcon />} variant="contained" onClick={handleAdd}>
                Add Action Plan
              </Button>
            </Box>
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
                      <Box>
                        <IconButton onClick={() => handleEdit(plan)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(plan.id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
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
            />
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={currentActionPlan.dueDate ? new Date(currentActionPlan.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setCurrentActionPlan({ ...currentActionPlan, dueDate: e.target.value })}
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
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!currentActionPlan.description}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ActionPlansModule;
