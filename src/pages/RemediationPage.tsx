import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';

const RemediationPage: React.FC = () => {
  const [findings, setFindings] = useState<any[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedFindings();
  }, []);

  const fetchAssignedFindings = async () => {
    setLoading(true);
    try {
      // In a real app, filter by assigned user. Here fetching all for demo.
      const data = await api.getFindings();
      setFindings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch findings', err);
      setError('Failed to load assigned findings.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFindingId || !file) return;

    setSubmitting(true);
    try {
      const finding = findings.find(f => f.id === selectedFindingId);
      if (!finding || !finding.auditProgramId) {
        throw new Error('Finding is not linked to an audit program, cannot upload evidence.');
      }

      // Upload evidence linked to the audit program of the finding
      const desc = `Remediation for Finding #${finding.id}: ${description}`;
      await api.uploadEvidence(finding.auditProgramId, file, desc);
      
      // Optionally transition finding status
      // await api.transitionFinding(finding.id, 'Remediation In Progress'); // If supported

      setSuccessMessage('Evidence uploaded successfully!');
      setFile(null);
      setDescription('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.message || 'Failed to upload evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFinding = findings.find(f => f.id === selectedFindingId);

  return (
    <Box sx={{ p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
        Remediation & Evidence
      </Typography>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ width: '100%' }}>
          <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>Assigned Findings</Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {findings.map((finding) => (
                  <ListItem 
                    disablePadding
                    key={finding.id}
                    sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}
                    component="li"
                  >
                    <ListItemButton
                      selected={selectedFindingId === finding.id}
                      onClick={() => setSelectedFindingId(finding.id)}
                    >
                      <ListItemText
                        primary={finding.description}
                        secondary={`Severity: ${finding.severity} | Status: ${finding.status}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                {findings.length === 0 && <Typography>No findings found.</Typography>}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
            {selectedFinding ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  Submit Remediation Evidence
                </Typography>
                
                <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">Finding Details</Typography>
                    <Typography variant="body2" paragraph>{selectedFinding.description}</Typography>
                    <Box display="flex" gap={1}>
                      <Chip label={selectedFinding.severity} color={selectedFinding.severity === 'Critical' ? 'error' : 'warning'} size="small" />
                      <Chip label={selectedFinding.status} variant="outlined" size="small" />
                    </Box>
                  </CardContent>
                </Card>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

                <TextField
                  fullWidth
                  label="Description of Remediation"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />

                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ height: 56 }}
                  >
                    {file ? file.name : 'Upload Evidence File'}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.png,.docx,.xlsx"
                    />
                  </Button>
                  {file && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !file}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  sx={{ bgcolor: '#0F1A2B' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Remediation'}
                </Button>

                <Box mt={4}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Process:</strong>
                    <ol>
                      <li>Select the finding you are addressing.</li>
                      <li>Describe the steps taken to fix the issue.</li>
                      <li>Upload supporting evidence (screenshots, logs, documents).</li>
                      <li>Submit for Auditor review.</li>
                    </ol>
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="textSecondary">Select a finding to upload evidence.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RemediationPage;
