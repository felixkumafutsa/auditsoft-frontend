import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Typography, Button, Chip, Alert, Menu, MenuItem } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
import api from '../services/api';
import ActionPlansModule from './ActionPlansModule';

interface Finding {
  id: number;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  root_cause: string;
  status: 'Identified' | 'Validated' | 'Action Assigned' | 'Remediation In Progress' | 'Closed';
  created_at: string;
}

const FindingsModule: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionPlansOpen, setActionPlansOpen] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFindings();
    fetchUserRole();
  }, []);

  const fetchUserRole = () => {
    // 1. Try to get the already mapped role from localStorage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
      return;
    }

    // 2. Fallback to parsing the user object
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user?.role) {
      setUserRole(user.role);
      return;
    }

    const userRoles = user?.userRoles || user?.roles;
    if (user && userRoles) {
      const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

      // Check for Chief Auditor/CAE
      const hasCAERole = roles.some((r: any) => {
        const name = r?.role?.roleName || r?.roleName || r?.role?.name || r?.name || '';
        return name === 'Chief Auditor' || name === 'Chief Audit Executive' || name === 'CAE' || name === 'Chief Audit Executive (CAE)';
      });

      if (hasCAERole) {
        setUserRole('CAE');
        return;
      }

      // Get the actual role name from the role object
      const actualRole = roles[0]?.role?.roleName ||
        roles[0]?.roleName ||
        roles[0]?.role?.name ||
        roles[0]?.name ||
        'Auditor';

      // Map to consistent frontend roles
      if (actualRole === 'Audit Manager') setUserRole('Manager');
      else if (actualRole === 'Process Owner') setUserRole('ProcessOwner');
      else if (actualRole === 'Executive / Board Viewer' || actualRole === 'Board Member' || actualRole === 'Executive') setUserRole('Executive');
      else setUserRole(actualRole);
    } else {
      setUserRole('Auditor');
    }
  };

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

  const handleAssignAction = (findingId: number) => {
    setSelectedFindingId(findingId);
    setActionPlansOpen(true);
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
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isChiefAuditor = userRole === 'Chief Auditor' || userRole === 'CAE';
        const canAssignAction = params.row.status === 'Validated' && isChiefAuditor;

        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedFindingId(params.row.id);
                setActionPlansOpen(true);
              }}
              sx={{ textTransform: 'none' }}
            >
              {isChiefAuditor ? 'Manage Actions' : 'View Actions'}
            </Button>

            {canAssignAction && (
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => handleAssignAction(params.row.id)}
                sx={{ textTransform: 'none' }}
              >
                Assign Action
              </Button>
            )}
          </Box>
        );
      },
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

      {selectedFindingId && (
        <ActionPlansModule
          findingId={selectedFindingId}
          open={actionPlansOpen}
          onClose={() => setActionPlansOpen(false)}
        />
      )}
    </Box>
  );
};

export default FindingsModule;