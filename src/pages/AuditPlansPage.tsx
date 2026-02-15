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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LockIcon from "@mui/icons-material/Lock";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import CloseIcon from "@mui/icons-material/Close";
import api from '../services/api';
import { Audit } from '../types/audit';
import AuditForm from '../components/AuditForm';
import AuditExecutionModule from "../components/AuditExecutionModule";
import AuditProgramsModule from "../components/AuditProgramsModule";
import { getStatusColor } from '../utils/statusColors';

const AuditPlansPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [view, setView] = useState<'list' | 'create' | 'review' | 'execution' | 'programs' | 'edit'>('list');
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [auditorName, setAuditorName] = useState("");
  const [auditors, setAuditors] = useState<{ id: number; name: string; role: string }[]>([]);
  const [managers, setManagers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [auditUniverseItems, setAuditUniverseItems] = useState<{ id: number; entityName: string; entityType: string }[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const isCAE = userRole === 'Chief Audit Executive' || userRole === 'CAE' || userRole === 'Chief Audit Executive (CAE)';
  const isAuditor = userRole === 'Auditor' || userRole === 'auditor';
  const isManager = userRole === 'Audit Manager' || userRole === 'Manager';

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
        if (selectedAudit?.id === id) {
          setSelectedAudit({ ...audit, status: 'Approved' });
        }
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
        if (selectedAudit?.id === id) {
          setSelectedAudit({ ...audit, status: 'Rejected' });
        }
      }
    } catch (error) {
      console.error("Failed to reject audit", error);
    }
  };

  const handleFinalize = async (id: number) => {
    try {
      const audit = audits.find(a => a.id === id);
      if (audit) {
        await (api as any).transitionAudit(id, 'Finalized', isCAE ? 'Chief Audit Executive (CAE)' : userRole);
        setAudits(audits.map(a => a.id === id ? { ...a, status: 'Finalized' } : a));
        if (selectedAudit?.id === id) {
          setSelectedAudit({ ...audit, status: 'Finalized' });
        }
      }
    } catch (error) {
      console.error("Failed to finalize audit", error);
    }
  };

  const handleClose = async (id: number) => {
    try {
      const audit = audits.find(a => a.id === id);
      if (audit) {
        await (api as any).transitionAudit(id, 'Closed', isCAE ? 'Chief Audit Executive (CAE)' : userRole);
        setAudits(audits.map(a => a.id === id ? { ...a, status: 'Closed' } : a));
        if (selectedAudit?.id === id) {
          setSelectedAudit({ ...(audit as any), status: 'Closed' });
        }
      }
    } catch (error) {
      console.error("Failed to close audit", error);
    }
  };

  const handleAssignClick = (audit: Audit) => {
    setSelectedAudit(audit);
    setAuditorName(audit.assignedTo || "");
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = async () => {
    if (!selectedAudit) return;

    try {
      const selectedAuditor = auditors.find(u => u.name === auditorName);
      if (selectedAuditor) {
        await api.assignAuditors(selectedAudit.id, [selectedAuditor.id]);
        fetchAudits();
      }
      setAssignDialogOpen(false);
    } catch (err) {
      console.error("Failed to assign auditor", err);
    }
  };

  const handleStartAudit = async (audit: Audit) => {
    try {
      await api.transitionAudit(audit.id, "In Progress", userRole);
      fetchAudits();
      setSelectedAudit({ ...audit, status: "In Progress" });
      setView("execution");
    } catch (err) {
      console.error("Failed to start audit", err);
    }
  };

  const handleDeleteAudit = async (id: number) => {
    try {
      await api.deleteAudit(id);
      setAudits(audits.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete audit", err);
    }
  };

  const handleEdit = (audit: Audit) => {
    setSelectedAudit(audit);
    setView("edit");
  };

  const filteredAudits = useMemo(() => {
    let filtered = audits;

    // Filter by search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.auditName.toLowerCase().includes(lowerTerm) ||
        (a.auditType && a.auditType.toLowerCase().includes(lowerTerm)) ||
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
      renderCell: (params) => <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
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
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const status = params.row.status;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {status === 'Planned' && isCAE && (
              <>
                <Tooltip title="Approve">
                  <IconButton onClick={(e) => { e.stopPropagation(); handleApprove(params.row.id); }} color="success" size="small">
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton onClick={(e) => { e.stopPropagation(); handleReject(params.row.id); }} color="error" size="small">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {(status === 'Under Review' || status === 'Execution Finished') && isCAE && (
              <Tooltip title="Finalize">
                <IconButton onClick={(e) => { e.stopPropagation(); handleFinalize(params.row.id); }} color="success" size="small">
                  <FactCheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {(status === 'Finalized' || status === 'Process Owner Review') && isCAE && (
              <Tooltip title="Close Audit">
                <IconButton onClick={(e) => { e.stopPropagation(); handleClose(params.row.id); }} color="warning" size="small">
                  <LockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Actions">
              <IconButton onClick={(e) => { e.stopPropagation(); setSelectedAudit(params.row); setActionsModalOpen(true); }} size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
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
                onRowClick={(params) => {
                  setSelectedAudit(params.row as Audit);
                  setActionsModalOpen(true);
                }}
              />
            )}
          </Box>
        </Paper>
      ) : view === 'create' || view === 'edit' ? (
        <Paper sx={{ p: 3 }}>
          <AuditForm
            auditToEdit={view === 'edit' ? selectedAudit : undefined}
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
      ) : view === 'programs' ? (
        <AuditProgramsModule
          audit={selectedAudit!}
          onBack={() => setView("list")}
        />
      ) : view === 'execution' ? (
        <AuditExecutionModule
          initialAudit={selectedAudit}
          onBack={() => setView("list")}
          onEdit={handleEdit}
          onDelete={handleDeleteAudit}
          onAssign={handleAssignClick}
          onApprove={handleApprove}
          onManagePrograms={(audit: Audit) => { setSelectedAudit(audit); setView("programs"); }}
          onFinalize={(audit: Audit) => handleFinalize(audit.id)}
          onClose={(audit: Audit) => handleClose(audit.id)}
        />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Audit Plan Review</Typography>
            <Button variant="outlined" onClick={() => setView('list')}>Back to List</Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{selectedAudit?.auditName}</Typography>
              <Typography variant="body2">Type: {selectedAudit?.auditType}</Typography>
              <Typography variant="body2">Status: {selectedAudit?.status}</Typography>
              <Typography variant="body2">Assigned: {selectedAudit?.assignedTo || '-'}</Typography>
            </Paper>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            {selectedAudit?.status === 'Planned' && isCAE && (
              <Button variant="contained" color="success" onClick={() => handleApprove(selectedAudit.id)}>Approve</Button>
            )}
            {selectedAudit?.status === 'Under Review' && isCAE && (
              <Button variant="contained" color="success" onClick={() => handleFinalize(selectedAudit.id)}>Finalize</Button>
            )}
            {selectedAudit?.status === 'Finalized' && isCAE && (
              <Button variant="contained" color="warning" onClick={() => handleClose(selectedAudit.id)}>Close</Button>
            )}
          </Box>
        </Paper>
      )}

      {/* Audit Contextual Actions Modal */}
      <Dialog
        open={actionsModalOpen}
        onClose={() => setActionsModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Audit Actions</Typography>
          <IconButton onClick={() => setActionsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAudit && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">{selectedAudit.auditName}</Typography>
                <Typography variant="body2" color="text.secondary">Status: <Chip label={selectedAudit.status} size="small" color={getStatusColor(selectedAudit.status)} sx={{ ml: 1 }} /></Typography>
              </Box>

              <Stack spacing={1.5}>
                {/* Execute/View Audit */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  sx={{ bgcolor: '#0F1A2B', '&:hover': { bgcolor: '#1a2b45' } }}
                  onClick={() => {
                    setActionsModalOpen(false);
                    if (isAuditor && (selectedAudit.status === 'Planned' || selectedAudit.status === 'Approved')) {
                      handleStartAudit(selectedAudit);
                    } else {
                      setView("execution");
                    }
                  }}
                >
                  {isAuditor && (selectedAudit.status === 'Planned' || selectedAudit.status === 'Approved')
                    ? "Start & Execute Audit"
                    : (selectedAudit.status === 'Under Review' || selectedAudit.status === 'Execution Finished' ? "Review Audit" : "View / Execute Audit")
                  }
                </Button>

                {/* Assign Auditor - CAE/Manager when Approved/Planned */}
                {(isCAE || !isAuditor) && (selectedAudit.status === 'Approved' || selectedAudit.status === 'Planned') && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleAssignClick(selectedAudit);
                    }}
                  >
                    Assign Auditor
                  </Button>
                )}

                {/* Approve Plan - CAE when Planned */}
                {isCAE && selectedAudit.status === 'Planned' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleApprove(selectedAudit.id);
                    }}
                  >
                    Approve Audit Plan
                  </Button>
                )}

                {/* Finalize Audit - Managers when Under Review */}
                {isManager && (selectedAudit.status === 'Under Review' || selectedAudit.status === 'Execution Finished') && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    startIcon={<FactCheckIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleFinalize(selectedAudit.id);
                    }}
                  >
                    Finalize Audit
                  </Button>
                )}

                {/* Close Audit - CAE when not already closed */}
                {isCAE && selectedAudit.status !== 'Closed' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<LockIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleClose(selectedAudit.id);
                    }}
                  >
                    Close Audit
                  </Button>
                )}

                {/* Programs - Managers when Planned */}
                {!isAuditor && selectedAudit.status === 'Planned' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PlaylistAddIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      setView("programs");
                    }}
                  >
                    Manage Programs
                  </Button>
                )}

                {/* Edit Plan - Managers/CAE when not closed */}
                {!isAuditor && selectedAudit.status !== 'Closed' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleEdit(selectedAudit);
                    }}
                  >
                    Edit Audit Details
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Auditor Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Auditor</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign an auditor to <strong>{selectedAudit?.auditName}</strong>
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label="Auditor"
              fullWidth
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {auditors.map((auditor) => (
                <option key={auditor.id} value={auditor.name}>
                  {auditor.name}
                </option>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignConfirm} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditPlansPage;
