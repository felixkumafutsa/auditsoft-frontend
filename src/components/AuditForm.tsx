import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  MenuItem 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import api from '../services/api';

interface AuditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  auditToEdit?: any;
  auditors?: { id: number; name: string; role: string }[];
}

const AuditForm: React.FC<AuditFormProps> = ({ onSuccess, onCancel, auditToEdit, auditors = [] }) => {
  const [auditName, setAuditName] = useState('');
  const [auditType, setAuditType] = useState('Operational');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (auditToEdit) {
      setAuditName(auditToEdit.auditName || '');
      setAuditType(auditToEdit.auditType || 'Operational');
      setStartDate(auditToEdit.startDate ? dayjs(auditToEdit.startDate) : null);
      setEndDate(auditToEdit.endDate ? dayjs(auditToEdit.endDate) : null);
      setAssignedTo(auditToEdit.assignedTo || '');
    } else {
      // Reset form if we switch from edit to create
      setAuditName('');
      setAssignedTo('');
    }
  }, [auditToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (startDate && endDate && endDate.isBefore(startDate)) {
      alert('End Date must be after Start Date');
      setLoading(false);
      return;
    }

    const payload = {
      auditName: auditName,
      auditType: auditType,
      // Format dates for the backend (ISO-8601 DateTime)
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      assignedTo: assignedTo,
      status: auditToEdit ? auditToEdit.status : 'Planned'
    };

    try {
      if (auditToEdit) {
        await api.updateAudit(auditToEdit.id, payload);
        alert('Audit updated successfully!');
      } else {
        await api.createAudit(payload);
        alert('Audit created successfully!');
      }
      // Reset form
      setAuditName('');
      setStartDate(null);
      setEndDate(null);
      setAssignedTo('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating audit:', error);
      alert('Failed to create audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, bgcolor: 'white', borderRadius: 1, boxShadow: 1, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          {auditToEdit ? 'Edit Audit Plan' : 'Create New Audit Plan'}
        </Typography>
        
        <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Audit Name"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Audit Type"
              value={auditType}
              onChange={(e) => setAuditType(e.target.value)}
            >
              <MenuItem value="Operational">Operational</MenuItem>
              <MenuItem value="Financial">Financial</MenuItem>
              <MenuItem value="Compliance">Compliance</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Assign Auditor (Optional)"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {auditors.map((auditor) => (
                <MenuItem key={auditor.id} value={auditor.name}>{auditor.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Box>
      
          <Box sx={{ gridColumn: 'span 12', mt: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                sx={{ bgcolor: '#0F1A2B' }}
                >
                {loading ? 'Saving...' : (auditToEdit ? 'Save Changes' : 'Create Audit Plan')}
                </Button>
            {onCancel && (
            <Button 
                variant="outlined" 
                onClick={onCancel}
            >
                Cancel
            </Button>
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AuditForm;