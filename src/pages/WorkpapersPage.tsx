import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    CircularProgress,
    Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import api from '../services/api';
import { Audit, AuditProgram } from '../types/audit';

const WorkpapersPage: React.FC = () => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');
    const [programs, setPrograms] = useState<AuditProgram[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Audits on Mount
    useEffect(() => {
        const fetchAudits = async () => {
            try {
                const data = await api.getAuditsLightweight();
                const mappedAudits = Array.isArray(data) ? data.map((a: any) => ({
                    id: a.id,
                    auditName: a.auditName || a.title || 'Untitled Audit',
                    status: a.status || 'Planned'
                })) : [];
                setAudits(mappedAudits);

                // Default to first audit if available
                if (mappedAudits.length > 0) {
                    setSelectedAuditId(mappedAudits[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch audits", error);
            }
        };
        fetchAudits();
    }, []);

    // Fetch Programs when Audit Changes
    useEffect(() => {
        if (!selectedAuditId) return;

        const fetchPrograms = async () => {
            setLoading(true);
            try {
                // We use getAudit which now includes auditPrograms with workpapers
                const auditData = await api.getAudit(Number(selectedAuditId));
                setPrograms(Array.isArray(auditData.auditPrograms) ? auditData.auditPrograms : []);
            } catch (error) {
                console.error("Failed to fetch programs", error);
                setPrograms([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, [selectedAuditId]);

    // Search Logic
    const filteredPrograms = useMemo(() => {
        if (!searchTerm) return programs;
        const lowerTerm = searchTerm.toLowerCase();
        return programs.filter(p =>
            p.procedureName.toLowerCase().includes(lowerTerm) ||
            (p.workpaper?.title && p.workpaper.title.toLowerCase().includes(lowerTerm)) ||
            (p.workpaper?.status && p.workpaper.status.toLowerCase().includes(lowerTerm))
        );
    }, [programs, searchTerm]);

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'workpaperTitle',
            headerName: 'Workpaper Title',
            flex: 1.5,
            minWidth: 250,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="bold">
                        {params.row.workpaper?.title || 'Pending Execution'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Ref: {params.row.procedureName}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 180,
            renderCell: (params) => {
                const status = params.row.workpaper?.status || 'Not Started';
                return (
                    <Chip
                        label={status}
                        variant={status === 'Not Started' ? 'outlined' : 'filled'}
                        size="small"
                        color={status === 'Reviewed' ? 'success' : status === 'Pending Review' ? 'info' : 'default'}
                        sx={{ fontWeight: 'bold' }}
                    />
                );
            }
        },
        {
            field: 'conclusion',
            headerName: 'Conclusion',
            width: 180,
            renderCell: (params) => {
                const conclusion = params.row.workpaper?.conclusion;
                if (!conclusion) return <Typography variant="caption" color="textSecondary">No Result</Typography>;
                return (
                    <Chip
                        label={conclusion}
                        size="small"
                        color={conclusion === 'Pass' ? 'success' : conclusion === 'Fail' ? 'error' : 'warning'}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Action',
            width: 130,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<ArticleIcon />}
                    onClick={() => navigate(`/workpaper/${params.row.id}`)}
                    color={params.row.workpaper ? 'primary' : 'inherit'}
                >
                    {params.row.workpaper ? 'Open' : 'Execute'}
                </Button>
            )
        }
    ];

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Audit Workpapers
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 250 }} size="small">
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

                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search workpapers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 300, ml: 'auto' }}
                    />
                </Box>
            </Paper>

            <Paper sx={{ width: '100%', height: 600 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : selectedAuditId ? (
                    <DataGrid
                        rows={filteredPrograms}
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
                        <Typography color="textSecondary">Please select an audit to view its workpapers.</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default WorkpapersPage;
