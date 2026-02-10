import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../services/api';

const AVAILABLE_FIELDS = [
  { id: 'id', label: 'ID' },
  { id: 'auditName', label: 'Audit Name' },
  { id: 'auditType', label: 'Audit Type' },
  { id: 'status', label: 'Status' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'endDate', label: 'End Date' },
  { id: 'entityName', label: 'Business Entity' },
  { id: 'assignedTo', label: 'Assigned Manager' },
];

const CustomReportsPage: React.FC = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>(['auditName', 'status', 'entityName']);
  const [auditType, setAuditType] = useState<string>('All');
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await api.getAudits();
        setAudits(data);
      } catch (error) {
        console.error('Failed to fetch audits for report builder', error);
      }
    };
    fetchAudits();
  }, []);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = () => {
    setLoading(true);
    try {
      // Filter audits by type
      const filtered = auditType === 'All' 
        ? audits 
        : audits.filter(a => (a.auditType || a.audit_type) === auditType);

      // Create CSV header
      const headers = selectedFields.map(f => AVAILABLE_FIELDS.find(af => af.id === f)?.label).join(',');
      
      // Create CSV rows
      const rows = filtered.map(audit => {
        return selectedFields.map(field => {
          let value = audit[field];
          if (field === 'assignedTo') value = audit.assignedManager?.name || 'N/A';
          if (field === 'entityName') value = audit.auditUniverse?.entityName || 'N/A';
          
          // Escape commas in values
          const stringValue = String(value || '').replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `custom_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Custom Report Builder
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Select the fields and filters to generate your custom audit data export.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              1. Select Data Fields
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {AVAILABLE_FIELDS.map((field) => (
                <FormControlLabel
                  key={field.id}
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field.id)}
                      onChange={() => handleFieldToggle(field.id)}
                    />
                  }
                  label={field.label}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              2. Apply Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Audit Type</InputLabel>
                  <Select
                    value={auditType}
                    label="Audit Type"
                    onChange={(e) => setAuditType(e.target.value)}
                  >
                    <MenuItem value="All">All Types</MenuItem>
                    <MenuItem value="Operational">Operational</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="Compliance">Compliance</MenuItem>
                    <MenuItem value="Financial">Financial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Report Summary
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">Selected Fields:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {selectedFields.map(f => (
                  <Chip key={f} label={AVAILABLE_FIELDS.find(af => af.id === f)?.label} size="small" />
                ))}
              </Box>
            </Box>
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary">Format:</Typography>
              <Typography variant="body1">CSV (Excel Compatible)</Typography>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Report generated successfully!
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<FileDownloadIcon />}
              disabled={selectedFields.length === 0 || loading}
              onClick={handleExport}
              sx={{ bgcolor: '#0F1A2B' }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomReportsPage;
