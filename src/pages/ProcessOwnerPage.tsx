import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Audit } from '../types/audit';

const ProcessOwnerPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerAudits = async () => {
      try {
        const data = await api.getOwnerAudits();
        setAudits(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch process owner audits', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerAudits();
  }, []);

  const columns: GridColDef<Audit>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'auditName', headerName: 'Audit Name', flex: 1, minWidth: 220 },
    { 
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => <Chip label={params.value} size="small" />
    },
    { 
      field: 'startDate', headerName: 'Start', width: 120,
      valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : ''
    },
    { 
      field: 'endDate', headerName: 'End', width: 120,
      valueFormatter: (p: any) => p.value ? new Date(p.value).toLocaleDateString() : ''
    },
    {
      field: 'programCount', headerName: 'Programs', width: 120,
      valueGetter: (p: any) => p.row.auditPrograms?.length || 0
    },
    {
      field: 'findingCount', headerName: 'Findings', width: 120,
      valueGetter: (p: any) => p.row.findings?.length || 0
    },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false,
      renderCell: (params) => (
        <Button variant="outlined" size="small" onClick={() => navigate(`/audits/${params.row.id}`)}>
          View
        </Button>
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0F1A2B', mb: 2 }}>
        Process Owner Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Audits executed in association with your owned processes/entities.
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 } as any}>
            <div style={{ width: '100%', height: 600 }}>
              <DataGrid
                rows={audits}
                columns={columns}
                loading={loading}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
              />
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProcessOwnerPage;
