import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Swal from 'sweetalert2';
import api from '../services/api';

interface AuditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  auditToEdit?: any;
  auditors?: { id: number; name: string; role: string }[];
  managers?: { id: number; name: string; role: string }[];
  auditUniverseItems?: { id: number; entityName: string; entityType: string }[];
}

const AuditForm: React.FC<AuditFormProps> = ({ 
  onSuccess, 
  onCancel, 
  auditToEdit, 
  auditors = [],
  managers = [],
  auditUniverseItems = []
}) => {
  const [auditName, setAuditName] = useState('');
  const [auditType, setAuditType] = useState('Operational');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [assignedTo, setAssignedTo] = useState('');
  
  // New Fields
  const [auditUniverseId, setAuditUniverseId] = useState<number | ''>('');
  const [selectedProgramTemplateId, setSelectedProgramTemplateId] = useState<number | ''>('');
  const [assignedManagerId, setAssignedManagerId] = useState<number | ''>('');
  const [assignedAuditorIds, setAssignedAuditorIds] = useState<number[]>([]);
  const [programTemplates, setProgramTemplates] = useState<{ id: number; auditName: string }[]>([]);

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Fetch Audit Templates
    const fetchTemplates = async () => {
      try {
        const templates = await api.getAuditTemplates();
        setProgramTemplates(templates);
      } catch (error) {
        console.error('Failed to fetch audit templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  React.useEffect(() => {
    if (auditToEdit) {
      setAuditName(auditToEdit.auditName || '');
      setAuditType(auditToEdit.auditType || 'Operational');
      setStartDate(auditToEdit.startDate ? dayjs(auditToEdit.startDate) : null);
      setEndDate(auditToEdit.endDate ? dayjs(auditToEdit.endDate) : null);
      setAssignedTo(auditToEdit.assignedTo || '');
      
      setAuditUniverseId(auditToEdit.auditUniverseId || '');
      setAssignedManagerId(auditToEdit.assignedManagerId || '');
      
      // Handle existing assigned auditors
      if (Array.isArray(auditToEdit.assignedAuditors)) {
        setAssignedAuditorIds(auditToEdit.assignedAuditors.map((a: any) => a.id));
      } else {
        setAssignedAuditorIds([]);
      }
    } else {
      // Reset form if we switch from edit to create
      setAuditName('');
      setAssignedTo('');
      setAuditUniverseId('');
      setAssignedManagerId('');
      setAssignedAuditorIds([]);
    }
  }, [auditToEdit]);

  const handleAuditorChange = (event: SelectChangeEvent<number[]>) => {
    const {
      target: { value },
    } = event;
    setAssignedAuditorIds(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',').map(Number) : value,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (startDate && endDate && endDate.isBefore(startDate)) {
      Swal.fire('Error', 'End Date must be after Start Date', 'error');
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
      status: auditToEdit ? auditToEdit.status : 'Planned',
      auditUniverseId: auditUniverseId === '' ? undefined : Number(auditUniverseId),
      assignedManagerId: assignedManagerId === '' ? undefined : Number(assignedManagerId),
      assignedAuditorIds: assignedAuditorIds,
      templateId: selectedProgramTemplateId === '' ? undefined : Number(selectedProgramTemplateId)
    };

    try {
      if (auditToEdit) {
        await api.updateAudit(auditToEdit.id, payload);
        Swal.fire('Success', 'Audit updated successfully!', 'success');
      } else {
        await api.createAudit(payload);
        Swal.fire('Success', 'Audit created successfully!', 'success');
      }
      // Reset form
      setAuditName('');
      setStartDate(null);
      setEndDate(null);
      setAssignedTo('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating audit:', error);
      Swal.fire('Error', 'Failed to create audit.', 'error');
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
              label="Audit Universe Entity"
              value={auditUniverseId}
              onChange={(e) => setAuditUniverseId(Number(e.target.value))}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {auditUniverseItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.entityName} ({item.entityType})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Audit Program Template"
              value={selectedProgramTemplateId}
              onChange={(e) => setSelectedProgramTemplateId(Number(e.target.value))}
              helperText={!auditToEdit ? "Optional: Select a template to pre-fill programs" : ""}
              disabled={!!auditToEdit} // Disable on edit for now to avoid overwriting
            >
              <MenuItem value="">
                <em>None (Start from scratch)</em>
              </MenuItem>
              {programTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.auditName}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Assigned Manager"
              value={assignedManagerId}
              onChange={(e) => setAssignedManagerId(Number(e.target.value))}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>{manager.name}</MenuItem>
              ))}
            </TextField>
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 12' } }}>
            <FormControl fullWidth>
              <InputLabel id="assigned-auditors-label">Assigned Auditors</InputLabel>
              <Select
                labelId="assigned-auditors-label"
                multiple
                value={assignedAuditorIds}
                onChange={handleAuditorChange}
                input={<OutlinedInput label="Assigned Auditors" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={auditors.find(a => a.id === value)?.name} />
                    ))}
                  </Box>
                )}
              >
                {auditors.map((auditor) => (
                  <MenuItem key={auditor.id} value={auditor.id}>
                    {auditor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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