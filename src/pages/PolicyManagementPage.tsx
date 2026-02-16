import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Alert,
    Snackbar,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Link as LinkIcon,
    Description as DescriptionIcon,
    FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import api from '../services/api';
import { Policy } from '../types/policy';

interface PolicyFormData {
    policyName: string;
    version: string;
    description: string;
    status: 'Draft' | 'Active' | 'Archived' | 'Under Review';
    effectiveDate: string;
}

const PolicyManagementPage: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [frameworks, setFrameworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog States
    const [openDialog, setOpenDialog] = useState(false);
    const [openMappingDialog, setOpenMappingDialog] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [formData, setFormData] = useState<PolicyFormData>({
        policyName: '',
        version: '1.0',
        description: '',
        status: 'Draft',
        effectiveDate: new Date().toISOString().split('T')[0]
    });
    const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [policiesData, frameworksData] = await Promise.all([
                api.getPolicies(),
                api.getFrameworks()
            ]);
            setPolicies(policiesData);
            setFrameworks(frameworksData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenDialog = (policy?: Policy) => {
        if (policy) {
            setSelectedPolicy(policy);
            setFormData({
                policyName: policy.policyName,
                version: policy.version,
                description: policy.description || '',
                status: policy.status,
                effectiveDate: typeof policy.effectiveDate === 'string' 
                    ? policy.effectiveDate.split('T')[0] 
                    : new Date(policy.effectiveDate).toISOString().split('T')[0]
            });
        } else {
            setSelectedPolicy(null);
            setFormData({
                policyName: '',
                version: '1.0',
                description: '',
                status: 'Draft',
                effectiveDate: new Date().toISOString().split('T')[0]
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPolicy(null);
    };

    const handleSubmit = async () => {
        try {
            if (selectedPolicy) {
                await api.updatePolicy(selectedPolicy.id, formData);
                setSnackbar({ open: true, message: 'Policy updated successfully', severity: 'success' });
            } else {
                await api.createPolicy(formData);
                setSnackbar({ open: true, message: 'Policy created successfully', severity: 'success' });
            }
            handleCloseDialog();
            fetchData();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Failed to save policy', severity: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            try {
                await api.deletePolicy(id);
                setSnackbar({ open: true, message: 'Policy deleted successfully', severity: 'success' });
                fetchData();
            } catch (err: any) {
                setSnackbar({ open: true, message: err.message || 'Failed to delete policy', severity: 'error' });
            }
        }
    };

    const handleOpenMappingDialog = (policy: Policy) => {
        setSelectedPolicy(policy);
        setSelectedFrameworkId('');
        setOpenMappingDialog(true);
    };

    const handleAddMapping = async () => {
        if (!selectedPolicy || !selectedFrameworkId) return;
        try {
            await api.mapPolicyToFramework(selectedPolicy.id, parseInt(selectedFrameworkId));
            setSnackbar({ open: true, message: 'Policy mapped successfully', severity: 'success' });
            setOpenMappingDialog(false);
            fetchData();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Failed to map policy', severity: 'error' });
        }
    };

    const handleRemoveMapping = async (mappingId: number) => {
        try {
            await api.removePolicyMapping(mappingId);
            setSnackbar({ open: true, message: 'Mapping removed successfully', severity: 'success' });
            fetchData();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Failed to remove mapping', severity: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Draft': return 'warning';
            case 'Under Review': return 'info';
            case 'Archived': return 'default';
            default: return 'default';
        }
    };

    if (loading && policies.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Policy Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#1a237e' }}
                >
                    Create Policy
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Policy Name</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Version</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Status</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Effective Date</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Compliance Mapping</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {policies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="textSecondary">No policies found. Create your first policy to get started.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            policies.map((policy) => (
                                <TableRow key={policy.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DescriptionIcon sx={{ mr: 1, color: '#1a237e', opacity: 0.7 }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">{policy.policyName}</Typography>
                                                <Typography variant="caption" color="textSecondary">{policy.description?.substring(0, 50)}{policy.description && policy.description.length > 50 ? '...' : ''}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{policy.version}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={policy.status} 
                                            size="small" 
                                            color={getStatusColor(policy.status) as any}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(policy.effectiveDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {policy.policyMappings?.map((mapping) => (
                                                <Tooltip key={mapping.id} title="Remove mapping">
                                                    <Chip
                                                        label={mapping.framework?.frameworkName}
                                                        size="small"
                                                        onDelete={() => handleRemoveMapping(mapping.id)}
                                                        sx={{ bgcolor: '#e8eaf6', color: '#1a237e' }}
                                                    />
                                                </Tooltip>
                                            ))}
                                            <IconButton size="small" onClick={() => handleOpenMappingDialog(policy)}>
                                                <LinkIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Download">
                                            <IconButton size="small" color="primary">
                                                <FileDownloadIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleOpenDialog(policy)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(policy.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                                fullWidth
                                label="Policy Name"
                                value={formData.policyName}
                                onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                label="Version"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="Status"
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Policy['status'] })}
                                >
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Under Review">Under Review</MenuItem>
                                    <MenuItem value="Archived">Archived</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Effective Date"
                                type="date"
                                value={formData.effectiveDate}
                                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit} 
                        disabled={!formData.policyName}
                        sx={{ bgcolor: '#1a237e' }}
                    >
                        {selectedPolicy ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mapping Dialog */}
            <Dialog open={openMappingDialog} onClose={() => setOpenMappingDialog(false)}>
                <DialogTitle>Link Policy to Framework</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Link <strong>{selectedPolicy?.policyName}</strong> to a compliance standard or framework.
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Framework / Standard</InputLabel>
                        <Select
                            value={selectedFrameworkId}
                            label="Framework / Standard"
                            onChange={(e) => setSelectedFrameworkId(e.target.value as string)}
                        >
                            {frameworks.map((f) => (
                                <MenuItem key={f.id} value={f.id.toString()}>
                                    {f.frameworkName} {f.version ? `(v${f.version})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenMappingDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddMapping}
                        disabled={!selectedFrameworkId}
                        sx={{ bgcolor: '#1a237e' }}
                    >
                        Add Mapping
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PolicyManagementPage;
