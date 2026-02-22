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
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';

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
      // Mock data for policy papers - replace with actual API call
      const mockPolicyPapers: PolicyPaper[] = [
        {
          id: 1,
          title: 'Information Security Policy',
          version: '2.1',
          category: 'Security',
          status: 'Active',
          effectiveDate: '2024-01-15',
          description: 'Comprehensive information security policy covering data protection, access control, and incident response.',
          documentUrl: '/documents/security-policy-v2.1.pdf'
        },
        {
          id: 2,
          title: 'Risk Management Framework',
          version: '1.5',
          category: 'Risk',
          status: 'Active',
          effectiveDate: '2024-02-01',
          description: 'Framework for identifying, assessing, and mitigating organizational risks.',
          documentUrl: '/documents/risk-framework-v1.5.pdf'
        },
        {
          id: 3,
          title: 'Compliance Monitoring Procedure',
          version: '1.0',
          category: 'Compliance',
          status: 'Under Review',
          effectiveDate: '2024-03-01',
          description: 'Procedures for ongoing compliance monitoring and reporting.',
          documentUrl: '/documents/compliance-procedure-v1.0.pdf'
        }
      ];
      setPolicyPapers(mockPolicyPapers);
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
    if (window.confirm('Are you sure you want to delete this standard?')) {
      try {
        await api.deleteFramework(id);
        fetchFrameworks();
      } catch (error) {
        console.error("Failed to delete framework", error);
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
        alert('Please select a PDF, DOC, or DOCX file');
        event.target.value = '';
      }
    }
  };

  const handleFileUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      // Add framework ID if editing
      if (editingFramework) {
        formData.append('frameworkId', editingFramework.id.toString());
      }
      
      const response = await fetch('/api/upload/policy-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('File uploaded successfully:', result);
        setSelectedFile(null);
        alert('Policy document uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
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
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Document">
            <IconButton 
              onClick={() => {
                // Prevent redirect by using proper URL handling
                const url = params.row.documentUrl;
                if (url.startsWith('http')) {
                  window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                  // For relative URLs, construct full path
                  const fullUrl = `${window.location.origin}${url}`;
                  window.open(fullUrl, '_blank', 'noopener,noreferrer');
                }
              }} 
              color="primary" 
              size="small"
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton 
              onClick={() => {
                // Create download link
                const link = document.createElement('a');
                link.href = params.row.documentUrl;
                link.download = `${params.row.title.replace(/\s+/g, '_')}_v${params.row.version}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }} 
              color="success" 
              size="small"
            >
              <DescriptionIcon />
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
    </Box>
  );
};

export default StandardsLibraryPage;
