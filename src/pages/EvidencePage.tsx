import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
}

interface AuditProgram {
  id: number;
  procedureName: string;
}

interface Evidence {
  id: number;
  fileName: string;
  fileType: string;
  description: string;
  uploadedBy: { name: string };
  uploadedAt: string;
  status: string;
}

const EvidencePage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');
  
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');

  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Upload Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Preview Dialog State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  // User Role
  const userRole = localStorage.getItem('userRole');
  const isManager = userRole === 'Audit Manager' || userRole === 'Manager' || userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isAuditor = userRole === 'Auditor';

  // 1. Fetch Audits on Mount
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await api.getAudits();
        const mappedAudits = Array.isArray(data) ? data.map((a: any) => ({
          id: a.id,
          auditName: a.auditName || a.audit_name
        })) : [];
        setAudits(mappedAudits);
      } catch (error) {
        console.error("Failed to fetch audits", error);
      }
    };
    fetchAudits();
  }, []);

  // 2. Fetch Programs when Audit Changes
  useEffect(() => {
    if (!selectedAuditId) {
      setPrograms([]);
      setSelectedProgramId('');
      return;
    }

    const fetchPrograms = async () => {
      try {
        const data = await api.getAuditPrograms(Number(selectedAuditId));
        const mappedPrograms = Array.isArray(data) ? data.map((p: any) => ({
          id: p.id,
          procedureName: p.procedureName
        })) : [];
        setPrograms(mappedPrograms);
        
        // Reset selected program if it's no longer in the list (though logically it won't be)
        setSelectedProgramId('');
      } catch (error) {
        console.error("Failed to fetch programs", error);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, [selectedAuditId]);

  // 3. Fetch Evidence when Program Changes
  useEffect(() => {
    if (!selectedProgramId) {
      setEvidenceList([]);
      return;
    }

    const fetchEvidence = async () => {
      setLoading(true);
      try {
        const data = await api.getEvidenceList(Number(selectedProgramId));
        setEvidenceList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch evidence", error);
        setEvidenceList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [selectedProgramId]);

  // Upload Handlers
  const handleUpload = async () => {
    if (!selectedProgramId || !file) return;

    setUploading(true);
    try {
      await api.uploadEvidence(Number(selectedProgramId), file, description);
      setUploadDialogOpen(false);
      setFile(null);
      setDescription('');
      
      // Refresh list
      const data = await api.getEvidenceList(Number(selectedProgramId));
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to upload evidence", error);
      alert("Failed to upload evidence");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Review/Approve Handlers
  const handleTransition = async (id: number, status: string) => {
    try {
      await api.transitionEvidence(id, status);
      // Refresh list
      if (selectedProgramId) {
        const data = await api.getEvidenceList(Number(selectedProgramId));
        setEvidenceList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(`Failed to transition evidence to ${status}`, error);
      alert(`Failed to update status: ${error}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this evidence?")) {
      try {
        await api.deleteEvidence(id);
        // Refresh
        if (selectedProgramId) {
          const data = await api.getEvidenceList(Number(selectedProgramId));
          setEvidenceList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to delete evidence", error);
      }
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await api.downloadEvidence(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'evidence';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Failed to download evidence', e);
      alert('Failed to download evidence');
    }
  };

  const handlePreview = async (row: Evidence) => {
    try {
      const blob = await api.downloadEvidence(row.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewType(row.fileType);
      setPreviewOpen(true);
    } catch (e) {
      console.error('Failed to preview evidence', e);
      alert('Failed to preview evidence');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Reviewed': return 'info';
      case 'Uploaded': return 'default';
      default: return 'default';
    }
  };

  const filteredEvidence = useMemo(() => {
    if (!searchTerm) return evidenceList;
    const lower = searchTerm.toLowerCase();
    return evidenceList.filter(e => 
      e.fileName.toLowerCase().includes(lower) ||
      e.description?.toLowerCase().includes(lower) ||
      e.uploadedBy?.name.toLowerCase().includes(lower)
    );
  }, [evidenceList, searchTerm]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fileName', headerName: 'File Name', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    { 
      field: 'uploadedBy', 
      headerName: 'Uploaded By', 
      width: 150,
      valueGetter: (params: any) => params.row?.uploadedBy?.name || 'Unknown'
    },
    { 
      field: 'uploadedAt', 
      headerName: 'Date', 
      width: 150,
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value) as any} size="small" />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 350,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Preview">
              <IconButton size="small" color="primary" onClick={() => handlePreview(params.row)}>
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => handleDownload(params.row.id, params.row.fileName)}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            {/* Review Action: For Manager/Auditor when Uploaded */}
            {status === 'Uploaded' && (isManager || isAuditor) && (
                <Button size="small" variant="outlined" startIcon={<RateReviewIcon />} onClick={() => handleTransition(params.row.id, 'Reviewed')}>
                    Review
                </Button>
            )}

            {/* Approve Action: For Manager when Reviewed */}
            {status === 'Reviewed' && isManager && (
                <>
                    <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleTransition(params.row.id, 'Approved')}>
                        Approve
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleTransition(params.row.id, 'Uploaded')}>
                        Reject
                    </Button>
                </>
            )}
             
            {/* Archive Action: For Manager/Admin when Approved */}
            {status === 'Approved' && isManager && (
                 <Button size="small" variant="outlined" color="warning" onClick={() => handleTransition(params.row.id, 'Archived')}>
                    Archive
                </Button>
            )}

            <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Evidence Management
        </Typography>
        {/* Upload Button - Hidden for Managers */}
        {!isManager && (
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />} 
            onClick={() => setUploadDialogOpen(true)}
            disabled={!selectedProgramId}
          >
            Upload Evidence
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 } as any}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Audit</InputLabel>
              <Select
                value={selectedAuditId}
                label="Select Audit"
                onChange={(e) => setSelectedAuditId(e.target.value as number)}
              >
                {audits.map((audit) => (
                  <MenuItem key={audit.id} value={audit.id}>
                    {audit.auditName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 } as any}>
            <FormControl fullWidth size="small" disabled={!selectedAuditId}>
              <InputLabel>Select Audit Program</InputLabel>
              <Select
                value={selectedProgramId}
                label="Select Audit Program"
                onChange={(e) => setSelectedProgramId(e.target.value as number)}
              >
                {programs.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.procedureName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 } as any}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Evidence List */}
      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : selectedProgramId ? (
          <DataGrid
            rows={filteredEvidence}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="textSecondary">Please select an Audit and Audit Program to view evidence.</Typography>
          </Box>
        )}
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Evidence</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<DescriptionIcon />}
            >
              {file ? file.name : "Select File"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => { 
        if (previewUrl) URL.revokeObjectURL(previewUrl); 
        setPreviewOpen(false); 
        setPreviewUrl(null); 
        setPreviewType(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Preview Evidence</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {previewUrl && previewType?.startsWith('image/') && (
              <img src={previewUrl} alt="Evidence preview" style={{ maxWidth: '100%' }} />
            )}
            {previewUrl && previewType === 'application/pdf' && (
              <iframe src={previewUrl} title="Evidence PDF" width="100%" height={600} />
            )}
            {previewUrl && !previewType?.startsWith('image/') && previewType !== 'application/pdf' && (
              <Typography variant="body2" color="text.secondary">
                Preview not available for this file type. Please use Download.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (previewUrl) {
              const a = document.createElement('a');
              a.href = previewUrl;
              a.download = 'evidence';
              document.body.appendChild(a);
              a.click();
              a.remove();
            }
          }} startIcon={<DownloadIcon />}>Download</Button>
          <Button onClick={() => { 
            if (previewUrl) URL.revokeObjectURL(previewUrl); 
            setPreviewOpen(false); 
            setPreviewUrl(null); 
            setPreviewType(null);
          }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidencePage;
