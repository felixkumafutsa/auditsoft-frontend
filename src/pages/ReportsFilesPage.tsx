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
    Alert
} from '@mui/material';
import { Download as DownloadIcon, Description as FileIcon, Visibility as PreviewIcon, Share as ShareIcon } from '@mui/icons-material';
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
}

const ReportsFilesPage: React.FC = () => {
    const [reports, setReports] = useState<ReportFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [reportForSharing, setReportForSharing] = useState<any>(null);

    const userRole = localStorage.getItem('userRole') || '';
    const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)' || userRole === 'Chief Auditor';
    const isManager = userRole === 'Manager' || userRole === 'Audit Manager';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await api.getReportsList();
            setReports(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch reports:', err);
            setError('Failed to load reports. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (report: ReportFile) => {
        try {
            // Determine download method based on file type or structure
            // backend returns fileUrl/fileType. 
            // If it's a generated PDF from an audit, we might want to use the specific audit download endpoints
            // or if it's a stored file, use the fileUrl.
            // The backend getReportsList returns id, auditId, etc.

            // Re-using existing download mechanisms for simplicity if applicable, 
            // or we might need a generic download endpoint if fileUrl is used directly.
            // For now, let's assume these are the standard audit reports.

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
                // Fallback or generic file download if implemented
                alert('Download not implemented for this file type yet.');
            }

        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to download file.");
        }
    };

    const handlePreview = async (report: ReportFile) => {
        try {
            if (report.fileType === 'pdf') {
                const blob = await api.previewAuditReport(report.auditId);
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Set timeout to revoke URL
                setTimeout(() => window.URL.revokeObjectURL(url), 15000);
            } else if (report.fileType === 'docx') {
                alert('DOCX files cannot be previewed natively in the browser. Please download the file to view.');
            } else {
                alert('Preview not implemented for this file type.');
            }
        } catch (err) {
            console.error("Preview failed", err);
            alert("Failed to load file for preview.");
        }
    };

    const handleShare = (report: ReportFile) => {
        setReportForSharing(report);
        setShareDialogOpen(true);
    };

    const handleCloseShareDialog = () => {
        setShareDialogOpen(false);
        setReportForSharing(null);
    };

    const handleShareReport = async (email: string, message: string) => {
        try {
            if (!reportForSharing) {
                throw new Error('No report selected for sharing');
            }

            console.log('Sharing report:', reportForSharing, 'to:', email, 'message:', message);
            
            // Call the actual API to share the report
            const result = await api.shareAuditReport(reportForSharing.auditId, email, message);
            
            console.log('Share result:', result);
            alert(`Report shared successfully to ${email}`);
            handleCloseShareDialog();
        } catch (error) {
            console.error('Failed to share report:', error);
            alert('Failed to share report. Please try again.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 600 }}>
                    Stored Reports
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Access generated reports for closed audits.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }}>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Audit Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Report Title</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Generated Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Generated By</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">No reports found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow hover key={report.id}>
                                        <TableCell sx={{ fontWeight: 500 }}>{report.auditName}</TableCell>
                                        <TableCell>{report.title || 'Audit Report'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={report.auditStatus || 'Unknown'}
                                                size="small"
                                                color={report.auditStatus === 'Pending CAE Approval' ? 'warning' :
                                                    report.auditStatus === 'Closed' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(report.generatedAt).toLocaleDateString()} {new Date(report.generatedAt).toLocaleTimeString()}</TableCell>
                                        <TableCell>{report.generatedBy}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={report.fileType?.toUpperCase() || 'PDF'}
                                                size="small"
                                                color="default"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                {(isCAE || isManager) && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        color="info"
                                                        startIcon={<PreviewIcon />}
                                                        onClick={() => handlePreview(report)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Preview
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownload(report)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Download
                                                </Button>
                                                {isCAE && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="secondary"
                                                        startIcon={<ShareIcon />}
                                                        onClick={() => handleShare(report)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Share
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            
            {/* Share Report Dialog */}
            <ShareReportDialog
                open={shareDialogOpen}
                onClose={handleCloseShareDialog}
                report={reportForSharing}
                onShare={handleShareReport}
            />
        </Container>
    );
};

export default ReportsFilesPage;
