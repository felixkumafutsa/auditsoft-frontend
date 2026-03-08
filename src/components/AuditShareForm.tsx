import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import api from '../services/api';
import ShareReportDialog from './ShareReportDialog';

interface AuditShareFormProps {
  open: boolean;
  onClose: () => void;
  audits: any[];
}

const AuditShareForm: React.FC<AuditShareFormProps> = ({
  open,
  onClose,
  audits
}) => {
  const [selectedAudit, setSelectedAudit] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reportForSharing, setReportForSharing] = useState<any>(null);

  const handleAuditChange = (event: any) => {
    const auditId = event.target.value;
    setSelectedAudit(auditId);
    
    // Set default message based on selected audit
    const audit = audits.find(a => a.id === auditId);
    if (audit) {
      setMessage(`Please find the attached audit report for "${audit.auditName}". This report contains important audit findings and recommendations that require your attention.`);
    }
  };

  const handleShareReport = async () => {
    if (!selectedAudit || !email.trim()) {
      setError('Please select an audit and enter a recipient email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.shareAuditReport(Number(selectedAudit), email.trim(), message);
      
      // Reset form
      setSelectedAudit('');
      setEmail('');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to share audit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (auditId: number, auditName: string) => {
    try {
      const blob = await api.downloadAuditReportPDF(auditId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${auditName.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleOpenShareDialog = (audit: any) => {
    setReportForSharing({
      id: audit.id,
      auditName: audit.auditName,
      title: audit.auditName,
      fileType: 'PDF'
    });
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setReportForSharing(null);
  };

  const handleShareFromDialog = async (email: string, message: string) => {
    if (!reportForSharing) return;
    
    try {
      await api.shareAuditReport(reportForSharing.id, email, message);
      handleCloseShareDialog();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to share audit report. Please try again.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSelectedAudit('');
      setEmail('');
      setMessage('');
      onClose();
    }
  };

  const completedAudits = audits.filter(audit => 
    audit.status === 'Completed' || audit.status === 'Approved'
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <EmailIcon />
              <Typography variant="h6">Share Audit Report</Typography>
            </Box>
            <Button onClick={handleClose} disabled={loading} startIcon={<CloseIcon />}>
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Completed Audits Table */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Available Audit Reports
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Only completed or approved audits can be shared. You can download reports directly or use the share form below.
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Audit Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Completion Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {completedAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>{audit.auditName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={audit.status} 
                            size="small" 
                            color={audit.status === 'Completed' ? 'success' : 'primary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={audit.riskLevel || 'Unset'} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {audit.completionDate || audit.updatedAt ? 
                            new Date(audit.completionDate || audit.updatedAt).toLocaleDateString() : 
                            '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadReport(audit.id, audit.auditName)}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<EmailIcon />}
                              onClick={() => handleOpenShareDialog(audit)}
                            >
                              Share
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {completedAudits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">
                            No completed audits available for sharing
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Quick Share Form */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Quick Share Form
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth required>
                  <InputLabel>Select Audit</InputLabel>
                  <Select
                    value={selectedAudit}
                    label="Select Audit"
                    onChange={handleAuditChange}
                    disabled={loading || completedAudits.length === 0}
                  >
                    {completedAudits.map((audit) => (
                      <MenuItem key={audit.id} value={audit.id}>
                        {audit.auditName} ({audit.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Recipient Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter recipient's email address"
                  disabled={loading}
                  helperText="The audit report will be automatically attached to this email"
                />

                <TextField
                  label="Message (Optional)"
                  multiline
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                  placeholder="Add a custom message for the recipient"
                  disabled={loading}
                />

                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Alert severity="info">
                  <Typography variant="body2">
                    The selected audit report will be automatically generated and attached to this email. 
                    The recipient will be able to download and view the PDF report directly.
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleShareReport}
            variant="contained"
            disabled={loading || !selectedAudit || !email.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Sharing...' : 'Share Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Report Dialog for individual audits */}
      <ShareReportDialog
        open={shareDialogOpen}
        onClose={handleCloseShareDialog}
        report={reportForSharing}
        onShare={handleShareFromDialog}
      />
    </>
  );
};

export default AuditShareForm;
