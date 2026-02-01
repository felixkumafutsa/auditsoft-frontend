import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import AuditForm from '../components/AuditForm';

interface Audit {
  id: number;
  auditName: string;
  auditType: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
}

const AuditPlansPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState<boolean>(true);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [auditors, setAuditors] = useState<{ id: number; name: string; role: string }[]>([]);
  const [managers, setManagers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [auditUniverseItems, setAuditUniverseItems] = useState<{ id: number; entityName: string; entityType: string }[]>([]);

  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isAuditor = userRole === 'Auditor' || userRole === 'auditor';

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || '');
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Users
        const usersData = await (api as any).getUsers();
        if (Array.isArray(usersData)) {
          // Filter Auditors
          const validAuditors = usersData.filter((u: any) => 
            u.userRoles?.some((ur: any) => ur.role?.roleName === "Auditor")
          ).map((u: any) => ({
            id: u.id,
            name: u.name,
            role: "Auditor"
          }));
          setAuditors(validAuditors);

          // Filter Managers
          const validManagers = usersData.filter((u: any) => 
            u.userRoles?.some((ur: any) => ur.role?.roleName === "Audit Manager" || ur.role?.roleName === "Manager" || ur.role?.roleName === "Chief Audit Executive")
          ).map((u: any) => ({
            id: u.id,
            name: u.name,
            role: "Manager"
          }));
          setManagers(validManagers);
        }

        // Load Audit Universe
        const universeData = await api.getAuditUniverse();
        if (Array.isArray(universeData)) {
          setAuditUniverseItems(universeData);
        }

      } catch (err) {
        console.error("Failed to load dependency data:", err);
      }
    };
    loadData();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits();
      // Normalize data keys if necessary (snake_case -> camelCase)
      const mappedData = Array.isArray(data) ? data.map((a: any) => ({
        ...a,
        auditName: a.auditName || a.audit_name,
        auditType: a.auditType || a.audit_type,
        startDate: a.startDate || a.start_date,
        endDate: a.endDate || a.end_date,
        assignedTo: a.assignedAuditors && Array.isArray(a.assignedAuditors) && a.assignedAuditors.length > 0
          ? a.assignedAuditors.map((u: any) => u.name).join(', ')
          : (a.assignedTo || a.assigned_to || '-')
      })) : [];
      setAudits(mappedData);
    } catch (err) {
      console.error("Failed to fetch audits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchAudits();
    }
  }, [view]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleApprove = async (id: number) => {
    try {
      const audit = audits.find(a => a.id === id);
      if (audit) {
        await api.updateAudit(id, { ...audit, status: 'Approved' });
        setAudits(audits.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
      }
    } catch (error) {
      console.error("Failed to approve audit", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const audit = audits.find(a => a.id === id);
      if (audit) {
        await api.updateAudit(id, { ...audit, status: 'Rejected' });
        setAudits(audits.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
      }
    } catch (error) {
      console.error("Failed to reject audit", error);
    }
  };

  const filteredAudits = useMemo(() => {
    let filtered = audits;

    // Filter by search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.auditName.toLowerCase().includes(lowerTerm) ||
        a.auditType.toLowerCase().includes(lowerTerm) ||
        (a.assignedTo && a.assignedTo.toLowerCase().includes(lowerTerm))
      );
    }

    switch (tabIndex) {
      case 0: // All
        return filtered;
      case 1: // Planned
        return filtered.filter(a => a.status === 'Planned');
      case 2: // Approved
        return filtered.filter(a => a.status === 'Approved');
      case 3: // In Progress
        return filtered.filter(a => a.status === 'In Progress');
      case 4: // Under Review
        return filtered.filter(a => a.status === 'Under Review');
      case 5: // Finalized
        return filtered.filter(a => a.status === 'Finalized');
      case 6: // Closed
        return filtered.filter(a => a.status === 'Closed');
      default:
        return filtered;
    }
  }, [audits, tabIndex, searchTerm]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'auditName', headerName: 'Audit Name', flex: 1, minWidth: 200 },
    { field: 'auditType', headerName: 'Type', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => {
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";
        switch (params.value) {
          case 'Planned': color = "info"; break;
          case 'Approved': color = "primary"; break;
          case 'In Progress': color = "warning"; break;
          case 'Under Review': color = "secondary"; break;
          case 'Finalized': color = "success"; break;
          case 'Closed': color = "default"; break;
        }
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 120,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
      width: 120,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        if (params.row.status === 'Planned' && isCAE) {
          return (
            <Box>
              <Tooltip title="Approve">
                <IconButton onClick={() => handleApprove(params.row.id)} color="success" size="small">
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton onClick={() => handleReject(params.row.id)} color="error" size="small">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
        return null;
      }
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {view === 'create' ? 'Create New Audit Plan' : 'Audit Plans'}
        </Typography>
        {view === 'list' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            {!isAuditor && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setView('create')}
                sx={{ bgcolor: "#0F1A2B" }}
              >
                New Audit
              </Button>
            )}
          </Box>
        )}
        {view === 'create' && (
          <Button
            variant="outlined"
            onClick={() => setView('list')}
          >
            Back to List
          </Button>
        )}
      </Box>
      
      {view === 'list' ? (
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="audit plan tabs"
          >
            <Tab label="All Audits" />
            <Tab label="Planned Audits" />
            <Tab label="Approved Audits" />
            <Tab label="In Progress" />
            <Tab label="Under Review" />
            <Tab label="Finalized" />
            <Tab label="Closed" />
          </Tabs>
          
          <Box sx={{ p: 2, height: 600, width: '100%' }}>
             {loading ? (
               <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                 <CircularProgress />
               </Box>
             ) : (
               <DataGrid
                  rows={filteredAudits}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  autoHeight={false} // fixed height container
               />
             )}
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <AuditForm
            auditors={auditors}
            managers={managers}
            auditUniverseItems={auditUniverseItems}
            onSuccess={() => {
              setView('list');
              fetchAudits();
            }}
            onCancel={() => setView('list')}
          />
        </Paper>
      )}
    </Box>
  );
};

export default AuditPlansPage;
