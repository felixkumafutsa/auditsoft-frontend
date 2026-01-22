import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Chip, Alert } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import AuditForm from '../components/AuditForm';
import api from '../services/api';

interface Audit {
  id: number;
  auditName: string;
  auditType: string;
  status: string;
  startDate: string;
  endDate: string;
}

const AuditsPage: React.FC = () => {
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

  const columns: GridColDef<Audit>[] = [
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

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        gap={2} 
        mb={3}>
        <Typography variant="h4" sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          {view === 'list' ? 'Audit Universe & Planning' : view === 'create' ? 'Create New Audit' : 'Edit Audit'}
        </Typography>
        {view === 'list' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setView('create')}
            sx={{ bgcolor: '#0F1A2B' }}
          >
            New Audit
          </Button>
        )}
        {view !== 'list' && (
          <Button 
            variant="outlined" 
            onClick={() => setView('list')}
          >
            Back to List
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {view === 'list' ? (
        <Box sx={{ height: 600, width: '100%', bgcolor: 'white', boxShadow: 1 }}>
          <DataGrid
            rows={audits}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              },
            }}
          />
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