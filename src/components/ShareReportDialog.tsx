import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Email, Send, Close } from '@mui/icons-material';

interface ShareReportDialogProps {
  open: boolean;
  onClose: () => void;
  report: any;
  onShare: (email: string, message: string) => Promise<void>;
}

const ShareReportDialog: React.FC<ShareReportDialogProps> = ({
  open,
  onClose,
  report,
  onShare
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    `Please find the attached audit report: ${report.title || report.auditName}. This report contains important audit findings and recommendations that require your attention.`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter a recipient email address');
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
      await onShare(email.trim(), message);
      setEmail('');
      setMessage(`Please find the attached audit report: ${report.title || report.auditName}. This report contains important audit findings and recommendations that require your attention.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to share report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Email />
            <Typography variant="h6">Share Audit Report</Typography>
          </Box>
          <Button onClick={handleClose} disabled={loading} startIcon={<Close />}>
            Close
          </Button>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Report Information */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Report Details
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip 
                  label={`Type: ${report.fileType?.toUpperCase() || 'PDF'}`} 
                  size="small" 
                  color="primary" 
                />
                <Chip 
                  label={`Audit: ${report.auditName}`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
            </Box>

            {/* Email Input */}
            <TextField
              label="Recipient Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              placeholder="Enter recipient's email address"
              disabled={loading}
              helperText="The report will be attached to this email"
            />

            {/* Message Input */}
            <TextField
              label="Message (Optional)"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              placeholder="Add a custom message for the recipient"
              disabled={loading}
            />

            {/* Error Display */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Info Alert */}
            <Alert severity="info">
              The audit report will be automatically attached to this email. The recipient will be able to download and view the report directly.
            </Alert>
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
            type="submit"
            variant="contained"
            disabled={loading || !email.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Sending...' : 'Share Report'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ShareReportDialog;
