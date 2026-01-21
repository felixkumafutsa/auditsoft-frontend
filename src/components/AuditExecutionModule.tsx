import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Chip, 
  List, 
  ListItemButton, 
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';

interface Audit {
  id: number;
  audit_name: string;
  status: string;
}

interface AuditProgram {
  id: number;
  procedure_name: string;
  control_reference: string;
  expected_outcome: string;
  actual_result: string;
  expanded?: boolean; // UI state for accordion
}

const AuditExecutionModule: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetchActiveAudits();
  }, []);

  const fetchActiveAudits = async () => {
    try {
      const data = await api.getAudits();
      // Filter for audits that are ready for execution
      const active = Array.isArray(data) ? data.filter((a: Audit) => 
        ['In Progress', 'Approved'].includes(a.status)
      ) : [];
      setAudits(active);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    }
  };

  const handleSelectAudit = async (audit: Audit) => {
    setSelectedAudit(audit);
    setLoading(true);
    try {
      const data = await api.getAuditPrograms(audit.id);
      setPrograms(Array.isArray(data) ? data.map((p: any) => ({ ...p, expanded: false })) : []);
    } catch (error) {
      console.error('Failed to fetch audit programs', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (id: number) => {
    setPrograms(programs.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  };

  const handleResultChange = async (id: number, result: string) => {
    // Optimistic update
    setPrograms(programs.map(p => p.id === id ? { ...p, actual_result: result } : p));
    try {
      await api.updateAuditProgram(id, { actual_result: result });
    } catch (error) {
      console.error('Failed to save result', error);
      alert('Failed to save result. Please try again.');
    }
  };

  const handleFileUpload = async (programId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(programId);
    try {
      await api.uploadEvidence(programId, file, `Evidence for program #${programId}`);
      alert('Evidence uploaded successfully!');
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  if (!selectedAudit) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          Select an Audit to Execute
        </Typography>
        {audits.length === 0 ? (
          <Typography>No active audits found.</Typography>
        ) : (
          <Paper elevation={1}>
            <List>
              {audits.map((audit, index) => (
                <React.Fragment key={audit.id}>
                  {index > 0 && <Divider />}
                  <ListItemButton onClick={() => handleSelectAudit(audit)}>
                    <ListItemText 
                      primary={audit.audit_name} 
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                    <Chip label={audit.status} color="primary" size="small" />
                  </ListItemButton>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => setSelectedAudit(null)} 
        sx={{ mb: 2 }}
      >
        Back to Audit List
      </Button>
      <Typography variant="h5" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
        Executing: {selectedAudit.audit_name}
      </Typography>
      
      {loading ? <CircularProgress /> : (
        <Box sx={{ mt: 2 }}>
          {programs.map(program => (
            <Accordion 
              key={program.id} 
              expanded={program.expanded} 
              onChange={() => toggleAccordion(program.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{program.procedure_name}</Typography>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Control Reference:</Typography>
                  <Typography variant="body2" paragraph>{program.control_reference}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Expected Outcome:</Typography>
                  <Typography variant="body2" paragraph>{program.expected_outcome}</Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
                    <TextField
                      label="Test Result / Actual Outcome"
                      multiline
                      minRows={3}
                      fullWidth
                      value={program.actual_result || ''}
                      onChange={(e) => handleResultChange(program.id, e.target.value)}
                      placeholder="Document your findings here..."
                      variant="outlined"
                      sx={{ mb: 2, bgcolor: 'white' }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading === program.id}
                      >
                        {uploading === program.id ? 'Uploading...' : 'Upload Evidence'}
                        <input 
                          type="file" 
                          hidden
                          onChange={(e) => handleFileUpload(program.id, e)}
                          disabled={uploading === program.id}
                        />
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => alert('Finding creation modal would open here')}
                      >
                        Raise Finding
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AuditExecutionModule;