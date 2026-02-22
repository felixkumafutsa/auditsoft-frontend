import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    Save as SaveIcon,
    AttachFile as AttachFileIcon,
    CheckCircle as CheckCircleIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import api from '../services/api';

const AuditWorkpaperPage: React.FC = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [workpaper, setWorkpaper] = useState<any>(null);
    const [auditProgram, setAuditProgram] = useState<any>(null);
    const [evidenceList, setEvidenceList] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [testResults, setTestResults] = useState('');
    const [conclusion, setConclusion] = useState('');
    const [status, setStatus] = useState('Draft');

    useEffect(() => {
        if (programId) {
            loadData();
        }
    }, [programId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const pId = parseInt(programId!);

            // Load Program Info
            const programData = await api.getAuditProgram(pId);
            setAuditProgram(programData);

            // Load Evidence
            const evidenceData = await api.getEvidenceList(pId);
            setEvidenceList(Array.isArray(evidenceData) ? evidenceData : []);

            // Load Workpaper if exists
            // The API should ideally return null or 404 if not found, we handle both
            try {
                const wpData = await api.getWorkpaperByProgram(pId);
                if (wpData) {
                    setWorkpaper(wpData);
                    setTitle(wpData.title);
                    setDescription(wpData.description || '');
                    setTestResults(wpData.testResults || '');
                    setConclusion(wpData.conclusion || '');
                    setStatus(wpData.status || 'Draft');
                } else {
                    // Pre-fill from program if new
                    setTitle(`Workpaper: ${programData.procedureName}`);
                    setDescription(`Testing procedure: ${programData.procedureName}`);
                }
            } catch (e) {
                // Likely 404, just new workpaper
                setTitle(`Workpaper: ${programData?.procedureName || 'New Procedure'}`);
            }

        } catch (err) {
            console.error('Failed to load workpaper data', err);
            setError('Failed to load workpaper details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const pId = parseInt(programId!);
            const data = {
                auditProgramId: pId,
                title,
                description,
                testResults,
                conclusion,
                status
            };

            if (workpaper && workpaper.id) {
                await api.updateWorkpaper(workpaper.id, data);
                setSuccess('Workpaper updated successfully.');
            } else {
                const newWp = await api.createWorkpaper(data);
                setWorkpaper(newWp);
                setSuccess('Workpaper created successfully.');
            }
        } catch (err: any) {
            console.error('Failed to save', err);
            setError(err.message || 'Failed to save workpaper.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (!auditProgram) return <Box p={4}><Typography color="error">Audit Program not found.</Typography></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                    Audit Workpaper
                </Typography>
                <Box>
                    <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Workpaper'}
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left Column: Documentation */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Procedure Details</Typography>
                        <Box bgcolor="grey.50" p={2} borderRadius={1} mb={3} border="1px solid #eee">
                            <Typography variant="subtitle2" color="textSecondary">Procedure:</Typography>
                            <Typography variant="body1" paragraph>{auditProgram.procedureName}</Typography>

                            <Typography variant="subtitle2" color="textSecondary">Control Reference:</Typography>
                            <Typography variant="body2">{auditProgram.controlReference || 'N/A'}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>Workpaper Content</Typography>

                        <TextField
                            fullWidth
                            label="Workpaper Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Objective / Description"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Test Results (Detailed Observation)"
                            multiline
                            rows={6}
                            value={testResults}
                            onChange={(e) => setTestResults(e.target.value)}
                            sx={{ mb: 3 }}
                            placeholder="Document the specific steps taken, samples tested, and results observed..."
                        />

                        <Box display="flex" gap={2}>
                            <FormControl fullWidth>
                                <InputLabel>Conclusion</InputLabel>
                                <Select
                                    value={conclusion}
                                    label="Conclusion"
                                    onChange={(e) => setConclusion(e.target.value)}
                                >
                                    <MenuItem value="Pass">Pass - Effective</MenuItem>
                                    <MenuItem value="Pass with Exceptions">Pass with Exceptions</MenuItem>
                                    <MenuItem value="Fail">Fail - Ineffective</MenuItem>
                                    <MenuItem value="N/A">Not Applicable</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={status}
                                    label="Status"
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Pending Review">Pending Review</MenuItem>
                                    <MenuItem value="Reviewed">Reviewed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Evidence & Metadata */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Evidence Card */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h6">Evidence</Typography>
                                <Button startIcon={<AttachFileIcon />} size="small" onClick={() => navigate(`/evidence?programId=${programId}`)}>
                                    Manage
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {evidenceList.length > 0 ? (
                                <List dense>
                                    {evidenceList.map(ev => (
                                        <ListItem key={ev.id}>
                                            <ListItemIcon>
                                                <DescriptionIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={ev.fileName}
                                                secondary={ev.uploadedBy?.name || 'Unknown User'}
                                                primaryTypographyProps={{ sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="textSecondary">No evidence attached yet.</Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Review Info Card */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Review Information</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Prepared By:</Typography>
                                <Typography variant="body2">{workpaper?.preparedById || 'Current User'}</Typography>
                            </Box>

                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Reviewed By:</Typography>
                                <Typography variant="body2">{workpaper?.reviewedById || '-'}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Last Updated:</Typography>
                                <Typography variant="body2">
                                    {workpaper?.updatedAt ? new Date(workpaper.updatedAt).toLocaleDateString() : 'New'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AuditWorkpaperPage;
