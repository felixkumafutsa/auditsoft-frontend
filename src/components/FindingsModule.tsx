import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Typography, Button, Chip, Alert } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
import api from '../services/api';

interface Finding {
  id: number;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  root_cause: string;
  status: 'Identified' | 'Validated' | 'Action Assigned' | 'Remediation In Progress' | 'Verified' | 'Closed';
  created_at: string;
}

const FindingsModule: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFindings();
  }, []);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const data = await api.getFindings();
      // Ensure data is an array (handle potential API wrapper responses)
      setFindings(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching findings:', err);
      setError('Failed to load findings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'auditName',
      headerName: 'Audit Name',
      width: 180,
      valueGetter: (_value, row) => row.audit?.auditName || 'N/A'
    },
    {
      field: 'auditType',
      headerName: 'Audit Type',
      width: 120,
      valueGetter: (_value, row) => row.audit?.auditType || 'N/A'
    },
    {
      field: 'auditProgram',
      headerName: 'Audit Program',
      width: 180,
      valueGetter: (_value, row) => row.auditProgram?.procedureName || 'N/A'
    },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getSeverityColor(params.value as string) as any} 
          size="small" 
          variant="filled"
        />
      )
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
    { field: 'root_cause', headerName: 'Root Cause', flex: 1, minWidth: 200 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
         <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => MySwal.fire(`Finding #${params.row.id}`, `View Action Plans for Finding #${params.row.id}`, 'info')}
          sx={{ textTransform: 'none' }}
        >
          Manage Actions
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: 650, width: '100%', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
          Findings & Remediation Register
        </Typography>
        <Button variant="outlined" onClick={fetchFindings}>
          Refresh List
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataGrid
        rows={findings}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          backgroundColor: 'white',
          boxShadow: 1,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            color: '#0F1A2B',
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

export default FindingsModule;