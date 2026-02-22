import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

interface TimesheetEntry {
  id: number;
  userId: number;
  auditId: number;
  audit?: {
    title: string;
    status: string;
  };
  hours: number;
  workDate: string;
  activity?: string;
  user?: {
    name: string;
    username: string;
  };
}

const TimesheetsPage: React.FC = () => {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [formData, setFormData] = useState({
    auditId: '',
    hours: '',
    workDate: new Date().toISOString().split('T')[0],
    activity: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTimesheets();
    fetchAudits();
  }, []);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;
      
      const data = await api.getMyTimesheets(userId);
      setTimesheets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch timesheets:', error);
      setError('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const data = await api.getAudits();
      setAudits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch audits:', error);
    }
  };

  const handleOpenDialog = (entry?: TimesheetEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        auditId: entry.auditId.toString(),
        hours: entry.hours.toString(),
        workDate: entry.workDate,
        activity: entry.activity || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        auditId: '',
        hours: '',
        workDate: new Date().toISOString().split('T')[0],
        activity: ''
      });
    }
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEntry(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.auditId || !formData.hours || !formData.workDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const submitData = {
        userId: user?.id || 1,
        auditId: parseInt(formData.auditId),
        hours: parseFloat(formData.hours),
        date: formData.workDate,
        activity: formData.activity || undefined
      };

      if (editingEntry) {
        // Update not implemented in API yet
        setSuccess('Update not available yet');
      } else {
        await api.logTime(submitData);
        setSuccess('Time logged successfully');
      }

      fetchTimesheets();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save timesheet:', error);
      setError('Failed to save timesheet');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this timesheet entry?')) {
      try {
        // Delete not implemented in API yet
        setSuccess('Delete not available yet');
        fetchTimesheets();
      } catch (error) {
        console.error('Failed to delete timesheet:', error);
        setError('Failed to delete timesheet');
      }
    }
  };

  const getTotalHours = () => {
    return timesheets.reduce((total, entry) => total + entry.hours, 0);
  };

  const getHoursByAudit = () => {
    const auditHours: { [key: string]: number } = {};
    timesheets.forEach(entry => {
      const auditName = entry.audit?.title || 'Unknown Audit';
      auditHours[auditName] = (auditHours[auditName] || 0) + entry.hours;
    });
    return auditHours;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          My Timesheets
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Log Time
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Hours</Typography>
              <Typography variant="h4" color="primary.main">
                {getTotalHours().toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Hours by Audit</Typography>
              {Object.entries(getHoursByAudit()).map(([audit, hours]) => (
                <Chip 
                  key={audit}
                  label={`${audit}: ${hours.toFixed(1)}h`}
                  sx={{ m: 0.5 }}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timesheets Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Audit</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timesheets.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.workDate).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.audit?.title || 'Unknown Audit'}</TableCell>
                  <TableCell>{entry.hours}</TableCell>
                  <TableCell>{entry.activity || '-'}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(entry)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(entry.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEntry ? 'Edit Timesheet' : 'Log Time'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Audit"
              select
              fullWidth
              value={formData.auditId}
              onChange={(e) => setFormData({ ...formData, auditId: e.target.value })}
              required
            >
              {audits.map((audit) => (
                <MenuItem key={audit.id} value={audit.id}>
                  {audit.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Hours"
              type="number"
              fullWidth
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              inputProps={{ step: 0.5, min: 0, max: 24 }}
              required
            />
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={formData.workDate}
              onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              required
            />
            <TextField
              label="Activity Description"
              fullWidth
              multiline
              rows={3}
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              placeholder="Describe the work performed..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEntry ? 'Update' : 'Log Time'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetsPage;
