import React, { useEffect, useState } from 'react';
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
import { Audit } from '../types/audit';

interface AuditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  auditToEdit?: Audit | null;
  auditors?: { id: number; name: string; role: string }[];
  managers?: { id: number; name: string; role: string }[];
  auditUniverseItems?: { id: number; entityName: string; entityType: string }[];
  initialData?: any;
}

const AuditForm: React.FC<AuditFormProps> = ({
  onSuccess,
  onCancel,
  auditToEdit,
  auditors = [],
  managers = [],
  auditUniverseItems = [],
  initialData
}) => {
  // Get current user and role
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setUserRole(user.role || '');
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const [auditName, setAuditName] = useState('');
  const [auditType, setAuditType] = useState('Operational');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  
  // New Fields
  const [auditUniverseId, setAuditUniverseId] = useState<number | ''>('');
  const [selectedProgramTemplateId, setSelectedProgramTemplateId] = useState<number | ''>('');
  const [assignedManagerId, setAssignedManagerId] = useState<number | ''>('');
  const [assignedAuditorIds, setAssignedAuditorIds] = useState<number[]>([]);
  const [programTemplates, setProgramTemplates] = useState<{ id: number; auditName: string }[]>([]);

  // Strategic Audit Plan Fields
  const [riskScore, setRiskScore] = useState<number | ''>('');
  const [riskLevel, setRiskLevel] = useState('');
  const [priority, setPriority] = useState('');
  const [quarter, setQuarter] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [resourceHours, setResourceHours] = useState<number | ''>('');
  const [budgetAllocation, setBudgetAllocation] = useState<number | ''>('');
  const [justification, setJustification] = useState('');

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
      
      setAuditUniverseId(auditToEdit.auditUniverseId || '');
      setAssignedManagerId(auditToEdit.assignedManagerId || '');
      
      // Strategic Audit Plan Fields
      setRiskScore(auditToEdit.riskScore || '');
      setRiskLevel(auditToEdit.riskLevel || '');
      setPriority(auditToEdit.priority || '');
      setQuarter(auditToEdit.quarter || '');
      setYear(auditToEdit.year || new Date().getFullYear());
      setResourceHours(auditToEdit.resourceHours || '');
      setBudgetAllocation(auditToEdit.budgetAllocation || '');
      setJustification(auditToEdit.justification || '');
      
      // Handle existing assigned auditors
      if (Array.isArray(auditToEdit.assignedAuditors)) {
        setAssignedAuditorIds(auditToEdit.assignedAuditors.map((a: any) => a.id));
      } else {
        setAssignedAuditorIds([]);
      }
    } else {
      // If an initialData prefill exists (e.g., from Strategic Planning), apply it.
      if (initialData) {
        setAuditName(initialData.auditName || '');
        setAuditUniverseId(initialData.auditUniverseId ?? initialData.entityId ?? '');
        setAssignedManagerId(initialData.assignedManagerId ?? '');
        setAssignedAuditorIds(initialData.assignedAuditorIds ?? []);

        setRiskScore(initialData.riskScore ?? '');
        setRiskLevel(initialData.riskLevel ?? '');
        setPriority(initialData.priority ?? '');
        setQuarter(initialData.quarter ?? '');
        setYear(initialData.year ?? new Date().getFullYear());
        setResourceHours(initialData.resourceHours ?? '');
        setBudgetAllocation(initialData.budgetAllocation ?? '');
        setJustification(initialData.justification ?? '');
      } else {
        // Reset form if we switch from edit to create
        setAuditName('');
        setAuditUniverseId('');
        setAssignedManagerId('');
        setAssignedAuditorIds([]);
        setRiskScore('');
        setRiskLevel('');
        setPriority('');
        setQuarter('');
        setYear(new Date().getFullYear());
        setResourceHours('');
        setBudgetAllocation('');
        setJustification('');
      }
    }
  }, [auditToEdit, initialData]);

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
      auditName,
      auditType,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      // If audit is rejected and being updated by Manager or Chief Auditor, change status back to Planned
      status: auditToEdit ? 
        (auditToEdit.status === 'Rejected' && (userRole.includes('Manager') || userRole.includes('Chief') || userRole.includes('CAE')) 
          ? 'Planned' 
          : auditToEdit.status) 
        : 'Planned',
      auditUniverseId: auditUniverseId === '' ? undefined : Number(auditUniverseId),
      assignedManagerId: assignedManagerId === '' ? undefined : Number(assignedManagerId),
      assignedAuditorIds: assignedAuditorIds,
      templateId: selectedProgramTemplateId === '' ? undefined : Number(selectedProgramTemplateId),
      // Strategic Audit Plan Fields
      riskScore: riskScore === '' ? undefined : Number(riskScore),
      riskLevel: riskLevel || undefined,
      priority: priority || undefined,
      quarter: quarter || undefined,
      year: year || undefined,
      resourceHours: resourceHours === '' ? undefined : Number(resourceHours),
      budgetAllocation: budgetAllocation === '' ? undefined : Number(budgetAllocation),
      justification: justification || undefined
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
      setRiskScore('');
      setRiskLevel('');
      setPriority('');
      setQuarter('');
      setYear(new Date().getFullYear());
      setResourceHours('');
      setBudgetAllocation('');
      setJustification('');
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

          {/* Strategic Audit Plan Fields */}
          <Box sx={{ gridColumn: 'span 12', mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0F1A2B', mb: 1 }}>
              Strategic Planning Information
            </Typography>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
            <TextField
              select
              fullWidth
              label="Risk Level"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
            <TextField
              select
              fullWidth
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
            <TextField
              select
              fullWidth
              label="Quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="Q1">Q1 (Jan-Mar)</MenuItem>
              <MenuItem value="Q2">Q2 (Apr-Jun)</MenuItem>
              <MenuItem value="Q3">Q3 (Jul-Sep)</MenuItem>
              <MenuItem value="Q4">Q4 (Oct-Dec)</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Risk Score (1-10)"
              type="number"
              value={riskScore}
              onChange={(e) => setRiskScore(Number(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
              helperText="1 = Lowest Risk, 10 = Highest Risk"
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Estimated Resource Hours"
              type="number"
              value={resourceHours}
              onChange={(e) => setResourceHours(Number(e.target.value))}
              inputProps={{ min: 0 }}
              helperText="Total hours required for this audit"
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Budget Allocation"
              type="number"
              value={budgetAllocation}
              onChange={(e) => setBudgetAllocation(Number(e.target.value))}
              inputProps={{ min: 0, step: 1000 }}
              helperText="Budget in local currency"
            />
          </Box>

          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Business Justification"
              multiline
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              helperText="Explain why this audit is important and what risks it addresses"
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