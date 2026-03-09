import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Container,
    Alert,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    Download as DownloadIcon, 
    Visibility as PreviewIcon, 
    Share as ShareIcon,
    Description as FileIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ShareReportDialog from '../components/ShareReportDialog';

interface ReportFile {
    id: number;
    auditId: number;
    title: string;
    auditName: string;
    auditStatus?: string;
    generatedBy: string;
    generatedAt: string;
    fileUrl: string;
    fileType: string;
    type: 'audit_report';
}

interface CustomReport {
    id: string;
    title: string;
    description: string;
    generatedAt: Date;
    type: 'custom_report';
    fields: string[];
}

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    fields: string[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`reports-tabpanel-${index}`}
            aria-labelledby={`reports-tab-${index}`}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [auditReports, setAuditReports] = useState<ReportFile[]>([]);
    const [customReports, setCustomReports] = useState<CustomReport[]>([]);
    const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [reportForSharing, setReportForSharing] = useState<any>(null);

    const userRole = localStorage.getItem('userRole') || '';
    const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)' || userRole === 'Chief Auditor';
    const isManager = userRole === 'Manager' || userRole === 'Audit Manager';

    useEffect(() => {
        fetchReportsData();
    }, []);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            const data = await api.getReportsList();
            
            // Handle the new tabbed reports structure
            setAuditReports(data.auditReports || []);
            setCustomReports(data.customReports || []);
            setReportTemplates(data.reportTemplates || []);
            
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch reports:', err);
            setError('Failed to load reports. Please try again later.');
            
            // Ensure all arrays are set to empty arrays on error
            setAuditReports([]);
            setCustomReports([]);
            setReportTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (report: ReportFile) => {
        try {
            if (report.fileType === 'pdf') {
                const blob = await api.downloadStoredAuditReport(report.auditId);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Audit_Report_${report.auditName}_${report.generatedAt}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else if (report.fileType === 'docx') {
                const blob = await api.downloadAuditReportWord(report.auditId);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Audit_Report_${report.auditName}_${report.generatedAt}.docx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
            else {
                alert('Download not implemented for this file type yet.');
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download report. Please try again.');
        }
    };

    const handleShare = (report: ReportFile) => {
        setReportForSharing(report);
        setShareDialogOpen(true);
    };

    const handlePreview = (report: ReportFile) => {
        // Open preview in new tab
        window.open(`/reports/audit/${report.auditId}/preview`, '_blank');
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'finalized':
                return 'success';
            case 'in progress':
                return 'warning';
            case 'planned':
                return 'info';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    const getFileTypeColor = (fileType: string) => {
        switch (fileType?.toLowerCase()) {
            case 'pdf':
                return 'error';
            case 'docx':
                return 'primary';
            case 'xlsx':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Reports Center
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Manage and organize your audit reports, custom reports, and templates
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Paper sx={{ mb: 4 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="reports tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Generated Reports" />
                        <Tab label="Custom Built Reports" />
                        <Tab label="Report Templates" />
                    </Tabs>

                    {/* Tab 1: Generated Reports */}
                    <TabPanel value={tabValue} index={0}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Report Title</TableCell>
                                        <TableCell>Audit Name</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Generated By</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {auditReports.length > 0 ? (
                                        auditReports.map((report) => (
                                            <TableRow key={report.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {report.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{report.auditName}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={report.auditStatus || 'Unknown'}
                                                        color={getStatusColor(report.auditStatus || '')}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{report.generatedBy}</TableCell>
                                                <TableCell>
                                                    {new Date(report.generatedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={report.fileType?.toUpperCase()}
                                                        color={getFileTypeColor(report.fileType)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="Preview">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handlePreview(report)}
                                                                color="primary"
                                                            >
                                                                <PreviewIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Download">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDownload(report)}
                                                                color="success"
                                                            >
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {(isManager || isCAE) && (
                                                            <Tooltip title="Share">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleShare(report)}
                                                                    color="info"
                                                                >
                                                                    <ShareIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                    No generated reports found.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Tab 2: Custom Built Reports */}
                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={3}>
                            {customReports.length > 0 ? (
                                customReports.map((report) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
                                        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                                    {report.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {report.description}
                                                </Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fields: {report.fields?.join(', ') || 'None'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Created: {new Date(report.generatedAt).toLocaleDateString()}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" startIcon={<EditIcon />}>
                                                    Edit
                                                </Button>
                                                <Button size="small" startIcon={<DownloadIcon />}>
                                                    Export
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No custom reports found.
                                        </Typography>
                                        <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => navigate('/reports-custom')}>
                                            Create Custom Report
                                        </Button>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>

                    {/* Tab 3: Report Templates */}
                    <TabPanel value={tabValue} index={2}>
                        <Grid container spacing={3}>
                            {reportTemplates.length > 0 ? (
                                reportTemplates.map((template) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={template.id}>
                                        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {template.description}
                                                </Typography>
                                                <Chip
                                                    label={template.category}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ mb: 2 }}
                                                />
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fields: {template.fields?.join(', ') || 'None'}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" variant="contained" startIcon={<AddIcon />}>
                                                    Use Template
                                                </Button>
                                                <Button size="small" startIcon={<PreviewIcon />}>
                                                    Preview
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid size={{ xs: 12 }}>
                                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No report templates found.
                                        </Typography>
                                        <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }}>
                                            Create Template
                                        </Button>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>
                </Paper>

                {/* Share Dialog */}
                <ShareReportDialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    report={reportForSharing}
                    onShare={async (email: string, message?: string) => {
                        try {
                            if (!reportForSharing) {
                                throw new Error('No report selected for sharing');
                            }
                            
                            await api.shareAuditReport(reportForSharing.auditId, email, message);
                            alert('Report shared successfully!');
                            setShareDialogOpen(false);
                            setReportForSharing(null);
                        } catch (error) {
                            console.error('Share failed:', error);
                            alert('Failed to share report. Please try again.');
                        }
                    }}
                />
            </Box>
        </Container>
    );
};

export default ReportsPage;
