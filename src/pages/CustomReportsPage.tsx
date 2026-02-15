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
import SaveIcon from '@mui/icons-material/Save';
import api from '../services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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
  const [availableFields, setAvailableFields] = useState<any[]>(AVAILABLE_FIELDS.filter(f => !['auditName', 'status', 'entityName'].includes(f.id)));
  const [auditType, setAuditType] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Drag State
  const [draggedField, setDraggedField] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToSelected = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField && !selectedFields.includes(draggedField)) {
      setSelectedFields([...selectedFields, draggedField]);
      setAvailableFields(prev => prev.filter(f => f.id !== draggedField));
    }
    setDraggedField(null);
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField && selectedFields.includes(draggedField)) {
      setSelectedFields(prev => prev.filter(id => id !== draggedField));
      const field = AVAILABLE_FIELDS.find(f => f.id === draggedField);
      if (field) setAvailableFields(prev => [...prev, field]);
    }
    setDraggedField(null);
  };

  const handleRemoveField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(id => id !== fieldId));
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (field) setAvailableFields(prev => [...prev, field]);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseURL}/reports/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fields: selectedFields,
          filters: { auditType },
          format
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Custom_Report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed', error);
      MySwal.fire('Error', 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const { value: reportName } = await MySwal.fire({
      title: 'Save Custom Report',
      input: 'text',
      inputLabel: 'Report Name',
      inputPlaceholder: 'Enter report name...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    });

    if (reportName) {
      setLoading(true);
      try {
        await api.saveCustomReport({
          name: reportName,
          fields: selectedFields,
          filters: { auditType }
        });
        MySwal.fire('Saved!', 'Your custom report has been saved.', 'success');
      } catch (error) {
        console.error('Save failed', error);
        MySwal.fire('Error', 'Failed to save report', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Advanced Report Builder
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Drag and drop fields to build your custom report layout.
      </Typography>

      <Grid container spacing={3}>
        {/* Left Panel: Available Fields */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, minHeight: 400, bgcolor: '#f5f5f5' }}
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">Available Fields</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {availableFields.map((field) => (
                <Paper
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field.id)}
                  sx={{
                    p: 1.5,
                    cursor: 'grab',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    '&:hover': { bgcolor: '#e3f2fd' }
                  }}
                >
                  <Typography>{field.label}</Typography>
                </Paper>
              ))}
              {availableFields.length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" mt={2}>
                  All fields selected
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Middle Panel: Report Preview / Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
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

          <Paper
            sx={{ p: 2, minHeight: 400, border: '2px dashed #1976d2', bgcolor: '#f8fbff' }}
            onDragOver={handleDragOver}
            onDrop={handleDropToSelected}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">Report Canvas (Drag Here)</Typography>

            {/* Table Header Preview */}
            <Box sx={{ display: 'flex', borderBottom: '2px solid #333', mb: 2, pb: 1, overflowX: 'auto' }}>
              {selectedFields.map((fieldId, index) => (
                <Box key={fieldId} sx={{ minWidth: 100, flex: 1, p: 1, borderRight: '1px solid #eee', position: 'relative', '&:hover .remove-btn': { display: 'block' } }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {AVAILABLE_FIELDS.find(f => f.id === fieldId)?.label}
                  </Typography>
                  <Button
                    className="remove-btn"
                    size="small"
                    color="error"
                    sx={{ display: 'none', position: 'absolute', top: -5, right: -5, minWidth: 'auto', p: 0.5 }}
                    onClick={() => handleRemoveField(fieldId)}
                  >
                    x
                  </Button>
                </Box>
              ))}
            </Box>

            {/* Dummy Data Rows Preview */}
            {[1, 2, 3].map(row => (
              <Box key={row} sx={{ display: 'flex', borderBottom: '1px solid #eee', py: 1 }}>
                {selectedFields.map(fieldId => (
                  <Box key={fieldId} sx={{ minWidth: 100, flex: 1, px: 1 }}>
                    <Box sx={{ height: 12, width: '80%', bgcolor: '#e0e0e0', borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            ))}

            {selectedFields.length === 0 && (
              <Typography variant="body1" color="textSecondary" align="center" mt={5}>
                Drag fields from the left panel to build your report.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Panel: Actions */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Export Actions</Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Report generated!
              </Alert>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<FileDownloadIcon />}
              disabled={selectedFields.length === 0 || loading}
              onClick={() => handleExport('pdf')}
              sx={{ bgcolor: '#0F1A2B', mb: 2 }}
            >
              {loading ? 'Processing...' : 'Export as PDF'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<FileDownloadIcon />}
              disabled={selectedFields.length === 0 || loading}
              onClick={() => handleExport('csv')}
              sx={{ mb: 2 }}
            >
              Export as CSV
            </Button>

            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<SaveIcon />}
              disabled={selectedFields.length === 0 || loading}
              onClick={handleSave}
              color="success"
            >
              {loading ? 'Saving...' : 'Save Report Template'}
            </Button>

            <Typography variant="caption" display="block" color="textSecondary" mt={2}>
              * PDF layout will adjust column widths automatically based on your selection.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomReportsPage;
