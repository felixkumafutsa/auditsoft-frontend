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
  Tabs,
  Tab,
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
import HistoryIcon from '@mui/icons-material/History';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';
import { Audit, AuditProgram } from '../types/audit';
import { getStatusColor } from '../utils/statusColors';

const MySwal = withReactContent(Swal);

interface EvidenceVersion {
  id: number;
  version: number;
  fileName: string;
  fileType: string;
  uploadedBy: { name: string };
  uploadedAt: string;
  changeDescription: string;
}

interface Evidence {
  id: number;
  fileName: string;
  fileType: string;
  description: string;
  uploadedBy: { name: string };
  uploadedAt: string;
  status: string;
  versions?: EvidenceVersion[];
}

const EvidencePage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');

  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');

  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: By Program, 1: Review Queue

  // Upload Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Preview Dialog State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  // Detail Dialog State
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Version History Dialog State
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [versionUploading, setVersionUploading] = useState(false);

  // User Role
  const userRole = localStorage.getItem('userRole');
  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isManager = userRole === 'Audit Manager' || userRole === 'Manager';
  const isAuditor = userRole === 'Auditor';

  // 1. Fetch Audits on Mount
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await api.getAudits();
        const mappedAudits = Array.isArray(data) ? data.map((a: any) => ({
          id: a.id,
          auditName: a.auditName || a.audit_name,
          status: a.status || 'Planned'
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
          procedureName: p.procedureName,
          controlReference: p.controlReference || null,
          expectedOutcome: p.expectedOutcome || null,
          actualResult: p.actualResult || null,
          reviewerComment: p.reviewerComment || null
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

  // 4. Fetch All Evidence for Queue
  useEffect(() => {
    if (activeTab === 1) {
      const fetchQueue = async () => {
        setLoading(true);
        try {
          const data = await api.getAllEvidence('Uploaded');
          setEvidenceList(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch evidence queue", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQueue();
    }
  }, [activeTab]);

  // Upload Handlers
  const handleUpload = async () => {
    if (!selectedProgramId || !file) return;

    setUploading(true);
    try {
      await api.uploadEvidence(Number(selectedProgramId), file, description);
      setUploadDialogOpen(false);
      setFile(null);
      setDescription('');

      MySwal.fire('Success', 'Evidence uploaded successfully!', 'success');

      // Refresh list
      const data = await api.getEvidenceList(Number(selectedProgramId));
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to upload evidence", error);
      MySwal.fire('Error', 'Failed to upload evidence', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleViewVersions = async (evidence: Evidence) => {
    try {
      const details = await api.getEvidenceDetails(evidence.id);
      setSelectedEvidence(details);
      setVersionDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch evidence versions", error);
      MySwal.fire('Error', 'Failed to fetch version history', 'error');
    }
  };

  const handleUploadVersion = async () => {
    if (!selectedEvidence || !versionFile) return;

    setVersionUploading(true);
    try {
      await api.uploadEvidenceVersion(selectedEvidence.id, versionFile, changeDescription);

      MySwal.fire('Success', 'New version uploaded successfully!', 'success');

      // Refresh versions
      const details = await api.getEvidenceDetails(selectedEvidence.id);
      setSelectedEvidence(details);

      setVersionFile(null);
      setChangeDescription('');

      // Refresh main list
      if (selectedProgramId) {
        const data = await api.getEvidenceList(Number(selectedProgramId));
        setEvidenceList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to upload version", error);
      MySwal.fire('Error', 'Failed to upload version', 'error');
    } finally {
      setVersionUploading(false);
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
      await api.transitionEvidence(id, status, userRole || undefined);
      MySwal.fire('Success', `Evidence status updated to ${status}`, 'success');
      // Refresh list
      if (activeTab === 0 && selectedProgramId) {
        const data = await api.getEvidenceList(Number(selectedProgramId));
        setEvidenceList(Array.isArray(data) ? data : []);
      } else if (activeTab === 1) {
        const data = await api.getAllEvidence('Uploaded');
        setEvidenceList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(`Failed to transition evidence to ${status}`, error);
      MySwal.fire('Error', `Failed to update status: ${error}`, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteEvidence(id);
        MySwal.fire('Deleted!', 'Evidence has been deleted.', 'success');
        // Refresh
        if (selectedProgramId) {
          const data = await api.getEvidenceList(Number(selectedProgramId));
          setEvidenceList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to delete evidence", error);
        MySwal.fire('Error', 'Failed to delete evidence', 'error');
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
      MySwal.fire('Error', 'Failed to download evidence', 'error');
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
      MySwal.fire('Error', 'Failed to preview evidence', 'error');
    }
  };

  const getStatusColorMapped = (status: string) => {
    return getStatusColor(status);
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
    {
      field: 'auditName',
      headerName: 'Audit',
      width: 150,
      valueGetter: (_value, row) => row?.auditProgram?.audit?.auditName ?? 'N/A'
    },
    { field: 'fileName', headerName: 'File Name', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    {
      field: 'uploadedBy',
      headerName: 'Uploaded By',
      width: 150,
      valueGetter: (_value, row) =>
        row?.uploadedBy?.name ?? 'Unknown'

    },
    {
      field: 'uploadedAt',
      headerName: 'Date',
      width: 150,
      valueFormatter: (value) =>
        value ? new Date(value as string).toLocaleDateString() : 'N/A'

    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          color={getStatusColor(value) as any}
          size="small"
        />
      )

    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          {row.fileMissing ? (
            <Tooltip title="File missing on server disk">
              <IconButton size="small" color="warning">
                <CloudUploadIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Preview">
                <IconButton size="small" onClick={() => handlePreview(row)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Download">
                <IconButton size="small" onClick={() => handleDownload(row.id, row.fileName)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Version History">
            <IconButton size="small" onClick={() => handleViewVersions(row)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          {isAuditor && !isCAE && row.status === 'Uploaded' && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}

          {isManager && row.status === 'Uploaded' && (
            <Tooltip title="Mark as Reviewed">
              <IconButton size="small" color="primary" onClick={() => handleTransition(row.id, 'Reviewed')}>
                <RateReviewIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )

    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Evidence Management
        </Typography>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 0 }}>
          <Tab label="By Program" />
          <Tab label="Review Queue" />
        </Tabs>

        {/* Upload Button - Hidden for Managers and CAE */}
        {!isManager && !isCAE && (
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
      {activeTab === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Items Awaiting Review</Typography>
          <Typography variant="body2" color="textSecondary">All evidence across the system with 'Uploaded' status.</Typography>
        </Paper>
      )}

      {/* Evidence List */}
      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (activeTab === 1 || selectedProgramId) ? (
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
            onRowClick={(params) => {
              setSelectedEvidence(params.row as Evidence);
              setDetailOpen(true);
            }}
            slots={{ toolbar: GridToolbar }}
            sx={{ cursor: 'pointer' }}
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
      {/* Evidence Detail & Actions Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Evidence Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvidence && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1"><strong>File Name:</strong> {selectedEvidence.fileName}</Typography>
              <Typography variant="body2"><strong>Description:</strong> {selectedEvidence.description || 'No description'}</Typography>
              <Typography variant="body2"><strong>Uploaded By:</strong> {selectedEvidence.uploadedBy?.name}</Typography>
              <Typography variant="body2"><strong>Uploaded At:</strong> {new Date(selectedEvidence.uploadedAt).toLocaleString()}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2"><strong>Status:</strong></Typography>
                <Chip label={selectedEvidence.status} color={getStatusColor(selectedEvidence.status) as any} size="small" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
          {selectedEvidence && (
            <>
              <Button startIcon={<VisibilityIcon />} onClick={() => { setDetailOpen(false); handlePreview(selectedEvidence); }}>
                Preview
              </Button>
              <Button startIcon={<DownloadIcon />} onClick={() => handleDownload(selectedEvidence.id, selectedEvidence.fileName)}>
                Download
              </Button>

              {selectedEvidence.status === 'Uploaded' && (isManager || isAuditor) && (
                <Button variant="outlined" color="info" startIcon={<RateReviewIcon />} onClick={() => { setDetailOpen(false); handleTransition(selectedEvidence.id, 'Reviewed'); }}>
                  Review
                </Button>
              )}

              {selectedEvidence.status === 'Reviewed' && isManager && (
                <>
                  <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => { setDetailOpen(false); handleTransition(selectedEvidence.id, 'Approved'); }}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => { setDetailOpen(false); handleTransition(selectedEvidence.id, 'Uploaded'); }}>
                    Reject
                  </Button>
                </>
              )}

              {selectedEvidence.status === 'Approved' && isManager && (
                <Button variant="outlined" color="warning" onClick={() => { setDetailOpen(false); handleTransition(selectedEvidence.id, 'Archived'); }}>
                  Archive
                </Button>
              )}

              {isAuditor && !isCAE && selectedEvidence.status === 'Uploaded' && (
                <>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton color="error" onClick={() => { setDetailOpen(false); handleDelete(selectedEvidence.id); }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </>
          )}
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Version History Dialog */}
      <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Version History - {selectedEvidence?.fileName}</DialogTitle>
        <DialogContent dividers>
          {selectedEvidence?.versions && selectedEvidence.versions.length > 0 ? (
            <DataGrid
              rows={selectedEvidence.versions}
              columns={[
                { field: 'version', headerName: 'Ver', width: 70 },
                { field: 'fileName', headerName: 'File Name', flex: 1 },
                { field: 'description', headerName: 'Changes', flex: 1 },
                {
                  field: 'uploadedBy',
                  headerName: 'By',
                  width: 150,
                  valueGetter: (_value, row) =>
                    row?.uploadedBy?.name ?? 'Unknown'

                },
                {
                  field: 'uploadedAt',
                  headerName: 'Date',
                  width: 150,
                  valueFormatter: (value) =>
                    value ? new Date(value as string).toLocaleString() : 'N/A'
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 100,
                  renderCell: ({ row }) => (
                    <IconButton size="small" onClick={() => handleDownload(row.id, row.fileName)}>
                      <DownloadIcon />
                    </IconButton>
                  )

                }
              ]}
              autoHeight
              disableRowSelectionOnClick
            />
          ) : (
            <Typography sx={{ py: 2 }}>No version history found.</Typography>
          )}

          {isAuditor && !isCAE && (
            <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Upload New Version</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                  {versionFile ? versionFile.name : "Select New Version File"}
                  <input type="file" hidden onChange={(e) => e.target.files && setVersionFile(e.target.files[0])} />
                </Button>
                <TextField
                  label="What changed in this version?"
                  fullWidth
                  size="small"
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleUploadVersion}
                  disabled={!versionFile || versionUploading}
                  startIcon={versionUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                >
                  {versionUploading ? 'Uploading...' : 'Upload Version'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidencePage;
