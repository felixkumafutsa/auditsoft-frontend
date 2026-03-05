import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Grid,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);

interface ComplianceFramework {
  id: number;
  frameworkName: string;
  version: string;
  description: string;
}

interface PolicyPaper {
  id: number;
  title: string;
  version: string;
  category: string;
  status: 'Draft' | 'Active' | 'Archived' | 'Under Review';
  effectiveDate: string;
  description: string;
  documentUrl?: string;
}

const StandardsLibraryPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [policyPapers, setPolicyPapers] = useState<PolicyPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<ComplianceFramework | null>(null);
  const [formData, setFormData] = useState({
    frameworkName: '',
    version: '',
    description: ''
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchFrameworks = async () => {
    setLoading(true);
    try {
      const data = await api.getFrameworks();
      setFrameworks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch frameworks", error);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicyPapers = async () => {
    setLoading(true);
    try {
      // Fetch persisted policies from backend
      const data = await api.getPolicies();
      if (Array.isArray(data)) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          title: p.policyName,
          version: p.version || '1.0',
          category: 'General',
          status: p.status || 'Draft',
          effectiveDate: p.effectiveDate ? new Date(p.effectiveDate).toISOString().split('T')[0] : '',
          description: p.description || '',
          documentUrl: p.fileUrl,
        } as PolicyPaper));
        setPolicyPapers(mapped);
      } else {
        setPolicyPapers([]);
      }
    } catch (error) {
      console.error('Error fetching policy papers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchFrameworks();
    } else {
      fetchPolicyPapers();
    }
  }, [activeTab]);

  // Search Logic
  const filteredFrameworks = useMemo(() => {
    if (!searchTerm) return frameworks;
    const lowerTerm = searchTerm.toLowerCase();
    return frameworks.filter(f =>
      f.frameworkName.toLowerCase().includes(lowerTerm) ||
      f.version.toLowerCase().includes(lowerTerm) ||
      (f.description && f.description.toLowerCase().includes(lowerTerm))
    );
  }, [frameworks, searchTerm]);

  const filteredPolicyPapers = useMemo(() => {
    if (!searchTerm) return policyPapers;
    const lowerTerm = searchTerm.toLowerCase();
    return policyPapers.filter(p =>
      p.title.toLowerCase().includes(lowerTerm) ||
      p.version.toLowerCase().includes(lowerTerm) ||
      p.category.toLowerCase().includes(lowerTerm) ||
      (p.description && p.description.toLowerCase().includes(lowerTerm))
    );
  }, [policyPapers, searchTerm]);

  // CRUD Handlers
  const handleOpenDialog = (framework?: ComplianceFramework) => {
    if (framework) {
      setEditingFramework(framework);
      setFormData({
        frameworkName: framework.frameworkName,
        version: framework.version,
        description: framework.description || ''
      });
    } else {
      setEditingFramework(null);
      setFormData({
        frameworkName: '',
        version: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingFramework) {
        await api.updateFramework(editingFramework.id, formData);
      } else {
        await api.createFramework(formData);
      }
      fetchFrameworks();
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save framework", error);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteFramework(id);
        MySwal.fire('Deleted!', 'The standard has been deleted.', 'success');
        fetchFrameworks();
      } catch (error: any) {
        MySwal.fire('Error', error.message || 'Failed to delete framework', 'error');
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        // Auto-upload immediately after selection
        await handleFileUpload(file);
      } else {
        MySwal.fire('Invalid File', 'Please select a PDF, DOC, or DOCX file', 'error');
        event.target.value = '';
      }
    }
  };

  const handleFileUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setUploading(true);
    try {
      // Use centralized API client to ensure base URL and auth headers
      const result = editingFramework
        ? await api.uploadPolicyDocument(fileToUpload, editingFramework.id)
        : await api.uploadPolicyDocument(fileToUpload);

      // If backend returned created policy, refresh list from server
      if (result && result.policy) {
        await fetchPolicyPapers();
      } else {
        // Fallback: append minimal entry to UI
        const newPaper: PolicyPaper = {
          id: Date.now(),
          title: result?.originalName || fileToUpload.name,
          version: '1.0',
          category: editingFramework?.frameworkName || 'General',
          status: 'Draft',
          effectiveDate: new Date().toISOString().split('T')[0],
          description: '',
          documentUrl: result?.url,
        };
        setPolicyPapers((prev) => [newPaper, ...prev]);
      }

      setSelectedFile(null);
      MySwal.fire('Uploaded!', 'Policy document uploaded successfully.', 'success');
    } catch (error: any) {
      console.error('Upload failed:', error);
      MySwal.fire('Upload Failed', error.message || 'File upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const extractFilenameFromUrl = (url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.origin);
      const parts = parsed.pathname.split('/');
      return parts.pop() || '';
    } catch (err) {
      const parts = url.split('/');
      return parts.pop() || url;
    }
  };

  const handleDeletePolicyPaper = async (paper: PolicyPaper) => {
    const result = await MySwal.fire({
      title: 'Delete Policy document?',
      text: "This will remove the file from the server.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        if (paper.id) {
          await api.deletePolicy(paper.id);
        } else if (paper.documentUrl) {
          const filename = extractFilenameFromUrl(paper.documentUrl);
          if (!filename) throw new Error('Invalid document URL');
          await api.deletePolicyDocument(filename);
        }
        MySwal.fire('Deleted', 'Policy document deleted', 'success');
        fetchPolicyPapers();
      } catch (err: any) {
        MySwal.fire('Error', err.message || 'Failed to delete policy document', 'error');
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'frameworkName', headerName: 'Framework Name', flex: 1, minWidth: 200 },
    { field: 'version', headerName: 'Version', width: 120 },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)} color="primary" size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const policyPaperColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
    { field: 'version', headerName: 'Version', width: 100 },
    { field: 'category', headerName: 'Category', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const status = params.value as string;
        const colorMap: Record<string, string> = {
          'Active': '#4caf50',
          'Draft': '#ff9800',
          'Under Review': '#2196f3',
          'Archived': '#9e9e9e'
        };
        return (
          <Chip
            label={status}
            size="small"
            sx={{
              backgroundColor: colorMap[status] || '#757575',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        );
      }
    },
    { field: 'effectiveDate', headerName: 'Effective Date', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Preview Policy">
            <IconButton
              onClick={() => {
                let url = params.row.documentUrl;
                if (!url) return;

                // Construct absolute URL from backend base if relative
                if (!url.startsWith('http')) {
                  const apiBase = api.baseURL.replace('/api', '');
                  url = `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
                }

                setPreviewUrl(url);
                setPreviewTitle(params.row.title);
                setPreviewOpen(true);
              }}
              color="info"
              size="small"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              onClick={() => {
                let url = params.row.documentUrl;
                if (!url) return;

                if (!url.startsWith('http')) {
                  const apiBase = api.baseURL.replace('/api', '');
                  url = `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
                }

                const link = document.createElement('a');
                link.href = url;
                link.download = `${params.row.title.replace(/\s+/g, '_')}_v${params.row.version}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              color="success"
              size="small"
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeletePolicyPaper(params.row)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Compliance & Standards
        </Typography>
        {activeTab === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Standard
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="compliance tabs"
        >
          <Tab label="Compliance Frameworks" />
          <Tab label="Policy Papers" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={`Search ${activeTab === 0 ? 'standards' : 'policy papers'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Paper>

      <Paper sx={{ width: '100%', height: 600 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : activeTab === 0 ? (
          <DataGrid
            rows={filteredFrameworks}
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
          <DataGrid
            rows={filteredPolicyPapers}
            columns={policyPaperColumns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
          />
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingFramework ? 'Edit Standard' : 'Add New Standard'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Framework Name"
              fullWidth
              value={formData.frameworkName}
              onChange={(e) => setFormData({ ...formData, frameworkName: e.target.value })}
            />
            <TextField
              label="Version"
              fullWidth
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            {/* File Upload Section */}
            <FormControl fullWidth>
              <InputLabel shrink>Upload Policy Document</InputLabel>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="policy-file-upload"
                />
                <label htmlFor="policy-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose & Upload Document'}
                  </Button>
                </label>

                {selectedFile && (
                  <Typography variant="body2" sx={{ flex: 1, color: 'success.main' }}>
                    ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) - Uploading...
                  </Typography>
                )}
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedFile(null);
          }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.frameworkName || uploading}>
            Save Standard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{previewTitle}</Typography>
          <Button onClick={() => setPreviewOpen(false)} size="small">Close</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: '#525659' }}>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Policy Preview"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="white">No document content available for preview.</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StandardsLibraryPage;
