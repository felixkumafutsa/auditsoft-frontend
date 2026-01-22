import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Chip, Alert, useMediaQuery, useTheme, Card, CardContent, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AuditForm from '../components/AuditForm';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
  auditType: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
}

const AuditsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auditToEdit, setAuditToEdit] = useState<any | null>(null);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits();
      setAudits(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch audits', err);
      setError('Failed to load audits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchAudits();
    }
  }, [view]);

  const handleEdit = (audit: any) => {
    setAuditToEdit(audit);
    setView('edit');
  };

  // Responsive columns based on screen size
  const columns: GridColDef<Audit>[] = useMemo(() => {
    if (isMobile) {
      return [
        { 
          field: 'auditName', 
          headerName: 'Audit', 
          flex: 1,
          minWidth: 120,
        },
        { 
          field: 'status', 
          headerName: 'Status', 
          width: 100,
          renderCell: (params) => (
            <Chip label={params.value} size="small" color={params.value === 'In Progress' ? 'primary' : 'default'} />
          )
        },
        {
          field: 'actions',
          headerName: '',
          width: 60,
          sortable: false,
          renderCell: (params) => (
            <Button
              size="small"
              variant="text"
              startIcon={<EditIcon />}
              onClick={() => handleEdit(params.row)}
              sx={{ minWidth: 'auto', p: 0 }}
            />
          ),
        },
      ];
    }
    
    if (isTablet) {
      return [
        { field: 'id', headerName: 'ID', width: 60 },
        { field: 'auditName', headerName: 'Audit Name', flex: 1, minWidth: 150 },
        { field: 'auditType', headerName: 'Type', width: 110 },
        { 
          field: 'status', 
          headerName: 'Status', 
          width: 120,
          renderCell: (params) => (
            <Chip label={params.value} size="small" color={params.value === 'In Progress' ? 'primary' : 'default'} />
          )
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 100,
          sortable: false,
          renderCell: (params) => (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              Edit
            </Button>
          ),
        },
      ];
    }

    // Desktop view - all columns
    return [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'auditName', headerName: 'Audit Name', flex: 1, minWidth: 200 },
      { field: 'auditType', headerName: 'Type', width: 150 },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: 150,
        renderCell: (params) => (
          <Chip label={params.value} size="small" color={params.value === 'In Progress' ? 'primary' : 'default'} />
        )
      },
      { field: 'startDate', headerName: 'Start Date', width: 150 },
      { field: 'endDate', headerName: 'End Date', width: 150 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
        ),
      },
    ];
  }, [isMobile, isTablet]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%' }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        gap={2} 
        mb={3}>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          {view === 'list' ? 'Audit Universe & Planning' : view === 'create' ? 'Create New Audit' : 'Edit Audit'}
        </Typography>
        {view === 'list' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setView('create')}
            sx={{ bgcolor: '#0F1A2B' }}
            fullWidth={isMobile}
          >
            New Audit
          </Button>
        )}
        {view !== 'list' && (
          <Button 
            variant="outlined" 
            onClick={() => setView('list')}
            fullWidth={isMobile}
          >
            Back to List
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {view === 'list' ? (
        <Box sx={{ 
          height: { xs: 'auto', sm: 600 }, 
          width: '100%', 
          bgcolor: 'white', 
          boxShadow: 1,
          borderRadius: 1,
          overflow: 'auto'
        }}>
          {isMobile && audits.length > 0 ? (
            <Stack spacing={2} sx={{ p: 2 }}>
              {audits.map((audit) => (
                <Card key={audit.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0F1A2B' }}>
                          {audit.auditName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {audit.id} • {audit.auditType}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(audit)}
                      />
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={audit.status} 
                        size="small" 
                        color={audit.status === 'In Progress' ? 'primary' : 'default'} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <DataGrid
              rows={audits}
              columns={columns}
              loading={loading}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: isMobile ? 5 : 10,
                  },
                },
              }}
              pageSizeOptions={isMobile ? [5] : [5, 10, 20]}
              checkboxSelection={!isMobile}
              disableRowSelectionOnClick
              density={isMobile ? 'compact' : 'standard'}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-root': {
                  fontSize: isMobile ? '0.75rem' : 'inherit',
                },
              }}
            />
          )}
        </Box>
      ) : (
        <AuditForm 
          auditToEdit={auditToEdit}
          onSuccess={() => setView('list')} 
          onCancel={() => setView('list')} 
        />
      )}
    </Box>
  );
};

export default AuditsPage;