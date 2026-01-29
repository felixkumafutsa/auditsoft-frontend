import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Alert,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import AuditForm from "../components/AuditForm";
import AuditExecutionModule from "../components/AuditExecutionModule";
import AuditProgramsModule from "../components/AuditProgramsModule";
import api from "../services/api";

interface Audit {
  id: number;
  auditName: string;
  auditType: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
  assignedAuditors?: { id: number; name: string }[];
}

interface AuditsPageProps {
  filterType?: 'all' | 'new' | 'executed';
}

const AuditsPage: React.FC<AuditsPageProps> = ({ filterType = 'all' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [view, setView] = useState<"list" | "create" | "edit" | "findings" | "execution" | "programs">("list");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auditToEdit, setAuditToEdit] = useState<any | null>(null);

  // Assignment State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [auditorName, setAuditorName] = useState("");
  const [auditors, setAuditors] = useState<{ id: number; name: string; role: string }[]>([]);
  const [managers, setManagers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [auditUniverseItems, setAuditUniverseItems] = useState<{ id: number; entityName: string; entityType: string }[]>([]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentUser, setCurrentUser] = useState<{ id?: number; name?: string; username?: string; role: string } | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'my'>('all');

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Approval State
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [auditToApprove, setAuditToApprove] = useState<number | null>(null);

  // Finding Creation State
  const [addFindingDialogOpen, setAddFindingDialogOpen] = useState(false);
  const [newFinding, setNewFinding] = useState({ description: "", severity: "Low" });

  // Evidence State (Mock)
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);

  // Mock Findings State
  const [findings, setFindings] = useState([
    { id: 1, description: "Unauthorized access to server logs", severity: "High", status: "Open" },
    { id: 2, description: "Missing backup redundancy", severity: "Medium", status: "Pending Review" },
    { id: 3, description: "Outdated software version", severity: "Low", status: "Open" },
  ]);

  const workflowSteps = ['Planned', 'Approved', 'In Progress', 'Under Review', 'Finalized'];

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits();
      setAudits(Array.isArray(data) ? data : []);
      // Map snake_case to camelCase to ensure DataGrid columns match
      const mappedData = Array.isArray(data) ? data.map((a: any) => ({
        ...a,
        auditName: a.auditName || a.audit_name,
        auditType: a.auditType || a.audit_type,
        startDate: a.startDate || a.start_date,
        endDate: a.endDate || a.end_date,
        assignedTo: a.assignedManager ? a.assignedManager.name : (a.assignedTo || a.assigned_to)
      })) : [];
      setAudits(mappedData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch audits", err);
      setError("Failed to load audits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        setCurrentUser({ name: "Admin", role: "Manager" });
      }
    } else {
      // Default to Manager for testing if no session exists
      setCurrentUser({ name: "Admin", role: "Manager" });
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const isAuditor = currentUser.role === "Auditor" || currentUser.role === "auditor";
      // Auditors default to 'my' audits, others default to 'all'
      setFilterMode(isAuditor ? 'my' : 'all');
    }
  }, [currentUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Users
        const usersData = await (api as any).getUsers();
        if (Array.isArray(usersData)) {
          // Filter Auditors
          const validAuditors = usersData.filter((u: any) => 
            u.role === "Auditor" || 
            u.userRoles?.some((ur: any) => ur.role?.roleName === "Auditor")
          ).map((u: any) => ({
            id: u.id,
            name: u.name,
            role: "Auditor"
          }));
          setAuditors(validAuditors);

          // Filter Managers
          const validManagers = usersData.filter((u: any) => 
            u.role === "Manager" || u.role === "Audit Manager" ||
            u.userRoles?.some((ur: any) => ur.role?.roleName === "Audit Manager" || ur.role?.roleName === "Manager")
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
        console.log("Using mock data due to error", err);
        setAuditors([
          { id: 1, name: "Alice Johnson", role: "Auditor" },
          { id: 3, name: "Charlie Brown", role: "Auditor" },
        ]);
        setManagers([
          { id: 2, name: "Bob Smith", role: "Manager" },
        ]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (view === "list") {
      fetchAudits();
    }
  }, [view]);

  const filteredAudits = useMemo(() => {
    if (!currentUser) return audits;
    
    const isAuditor = currentUser.role === 'Auditor' || currentUser.role === 'auditor';

    if (isAuditor) {
      const userName = currentUser.name || currentUser.username || '';
      // Auditors ONLY see their own audits
      const myAudits = audits.filter((a) => {
        // Trust backend filtering if available, but also check client side for safety/consistency
        if (a.assignedAuditors && a.assignedAuditors.length > 0) {
           if (currentUser.id) {
               return a.assignedAuditors.some(u => u.id === currentUser.id);
           }
           return a.assignedAuditors.some(u => u.name.toLowerCase() === userName.toLowerCase());
        }
        // Fallback for string-based assignment
        return a.assignedTo && a.assignedTo.toLowerCase().includes(userName.toLowerCase());
      });

      if (filterType === 'new') {
        return myAudits.filter((a) => ['Planned', 'Approved', 'In Progress'].includes(a.status));
      }

      if (filterType === 'executed') {
        return myAudits.filter((a) => ['Completed', 'Finalized', 'Under Review'].includes(a.status));
      }

      return myAudits;
    }

    if (filterMode === 'my') {
      const userName = currentUser.name || currentUser.username || '';
      return audits.filter((a) => {
         if (a.assignedAuditors && a.assignedAuditors.length > 0) {
             if (currentUser.id) {
                 return a.assignedAuditors.some(u => u.id === currentUser.id);
             }
             return a.assignedAuditors.some(u => u.name.toLowerCase() === userName.toLowerCase());
         }
         return a.assignedTo && a.assignedTo.toLowerCase().includes(userName.toLowerCase());
      });
    }
    
    if (filterType === 'new') {
       const userName = currentUser.name || currentUser.username || '';
       return audits.filter((a) => a.assignedTo && a.assignedTo.toLowerCase() === userName.toLowerCase() && (a.status === 'Planned' || a.status === 'In Progress'));
    }

    if (filterType === 'executed') {
       const userName = currentUser.name || currentUser.username || '';
       return audits.filter((a) => a.assignedTo && a.assignedTo.toLowerCase() === userName.toLowerCase() && (a.status === 'Completed' || a.status === 'Finalized' || a.status === 'Under Review'));
    }

    return audits;
  }, [audits, currentUser, filterMode, filterType]);

  const handleEdit = (audit: any) => {
    setAuditToEdit(audit);
    setView("edit");
  };

  const handleAssignClick = (audit: Audit) => {
    setAuditToEdit(audit);
    setAuditorName(audit.assignedTo || "");
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = async () => {
    if (!auditToEdit) return;
    
    // Logic: Assigning an auditor keeps it 'Approved' so they can see it as "New" and Start it.
    const newStatus = auditToEdit.status;
    
    try {
      // Find the auditor ID based on the selected name
      const selectedAuditor = auditors.find(u => u.name === auditorName);
      
      if (selectedAuditor) {
          await api.assignAuditors(auditToEdit.id, [selectedAuditor.id]);
          
          const updatedAudit = { 
              ...auditToEdit, 
              assignedTo: auditorName, 
              status: newStatus,
              assignedAuditors: [{ id: selectedAuditor.id, name: selectedAuditor.name }]
          };
          
          setAudits(audits.map((a) => (a.id === auditToEdit.id ? updatedAudit : a)));
      }
      setAssignDialogOpen(false);
    } catch (err) {
      console.error("Failed to assign auditor", err);
      setError("Failed to assign auditor.");
    }
  };

  const handleReviewFindings = useCallback(async (audit: Audit) => {
    setAuditToEdit(audit);
    setEvidenceFiles([]);
    
    // Load findings and programs from the audit object or fetch fresh
    try {
        const freshAudit = await (api as any).getAudit(audit.id);
        setAuditToEdit(freshAudit);
        setFindings(freshAudit.findings || []);
        // setAuditPrograms(freshAudit.auditPrograms || []);
    } catch (e) {
        console.error("Failed to load audit details", e);
        // Fallback to existing data if fetch fails
        setFindings((audit as any).findings || []);
        // setAuditPrograms((audit as any).auditPrograms || []);
    }
    
    setView("findings");
  }, []);

  const handleApproveFinding = (id: number) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status: "Approved" } : f));
  };

  const handleApproveClick = useCallback((id: number) => {
    setAuditToApprove(id);
    setApproveDialogOpen(true);
  }, []);

  const handleApproveConfirm = async () => {
    if (auditToApprove !== null) {
      try {
        const audit = audits.find((a) => a.id === auditToApprove);
        if (audit) {
          await api.updateAudit(auditToApprove, { ...audit, status: "Approved" });
          setAudits(audits.map((a) => (a.id === auditToApprove ? { ...a, status: "Approved" } : a)));
        }
      } catch (err) {
        console.error("Failed to approve audit", err);
        setError("Failed to approve audit.");
      }
    }
    setApproveDialogOpen(false);
    setAuditToApprove(null);
  };

  const handleStartAudit = useCallback(async (audit: Audit) => {
    try {
      const updatedAudit = { ...audit, status: "In Progress" };
      await api.updateAudit(audit.id, updatedAudit);
      setAudits((prev) => prev.map((a) => (a.id === audit.id ? updatedAudit : a)));
      handleReviewFindings(updatedAudit);
    } catch (err) {
      console.error("Failed to start audit", err);
      setError("Failed to start audit.");
    }
  }, [handleReviewFindings]);

  const handleAddFindingClick = () => {
    setNewFinding({ description: "", severity: "Low" });
    setAddFindingDialogOpen(true);
  };

  const handleSaveFinding = () => {
    const nextId = findings.length > 0 ? Math.max(...findings.map(f => f.id)) + 1 : 1;
    setFindings([
      ...findings, 
      { 
        id: nextId, 
        description: newFinding.description, 
        severity: newFinding.severity, 
        status: "Draft" 
      }
    ]);
    setAddFindingDialogOpen(false);
  };

  const handleUploadEvidence = () => {
    // Mock upload
    const newFile = `Evidence_Doc_${evidenceFiles.length + 1}.pdf`;
    setEvidenceFiles([...evidenceFiles, newFile]);
  };

  const handleSubmitForReview = async () => {
    if (auditToEdit) {
      try {
        const updatedAudit = { ...auditToEdit, status: "Under Review" };
        await api.updateAudit(auditToEdit.id, updatedAudit);
        setAudits(audits.map(a => a.id === auditToEdit.id ? updatedAudit : a));
        setView("list");
      } catch (err) {
        console.error("Failed to submit for review", err);
        setError("Failed to submit audit for review.");
      }
    }
  };

  const handleFinalizeAudit = async () => {
    if (auditToEdit) {
      try {
        const updatedAudit = { ...auditToEdit, status: "Finalized" };
        await api.updateAudit(auditToEdit.id, updatedAudit);
        setAudits(audits.map(a => a.id === auditToEdit.id ? updatedAudit : a));
        setView("list");
      } catch (err) {
        console.error("Failed to finalize audit", err);
        setError("Failed to finalize audit.");
      }
    }
  };

  // Dashboard KPI Stats
  const kpiStats = useMemo(
    () => [
      {
        label: "Total Audits",
        value: filteredAudits.length,
        icon: <AssessmentIcon fontSize="large" />,
        color: "#1976d2",
      },
      {
        label: "In Progress",
        value: filteredAudits.filter((a) => a.status === "In Progress").length,
        icon: <TrendingUpIcon fontSize="large" />,
        color: "#ed6c02",
      },
      {
        label: "Planned",
        value: filteredAudits.filter((a) => a.status === "Planned").length,
        icon: <ScheduleIcon fontSize="large" />,
        color: "#9c27b0",
      },
      {
        label: "Completed",
        value: filteredAudits.filter((a) => a.status === "Completed").length,
        icon: <CheckCircleOutlineIcon fontSize="large" />,
        color: "#2e7d32",
      },
    ],
    [filteredAudits],
  );

  // Responsive columns based on screen size
  const columns: GridColDef<Audit>[] = useMemo(() => {
    const isAuditor = currentUser?.role === 'Auditor' || currentUser?.role === 'auditor';
    const isManager = currentUser?.role === 'Manager' || currentUser?.role === 'manager';
    const isCAE = currentUser?.role === 'CAE' || currentUser?.role === 'Chief Audit Executive';

    if (isMobile) {
      return [
        {
          field: "auditName",
          headerName: "Audit",
          flex: 1,
          minWidth: 120,
        },
        {
          field: "status",
          headerName: "Status",
          width: 100,
          renderCell: (params) => (
            <Chip
              label={params.value}
              size="small"
              color={params.value === "In Progress" ? "primary" : "default"}
            />
          ),
        },
        {
          field: "actions",
          headerName: "",
          width: 80,
          sortable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={0}>
              {!isAuditor && (
                <IconButton size="small" onClick={() => handleEdit(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {(currentUser?.role === "CAE" || currentUser?.role === "Chief Audit Executive") && params.row.status === "Planned" && (
                <IconButton size="small" onClick={() => handleApproveClick(params.row.id)} color="success">
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              )}
              {isAuditor && params.row.status === 'In Progress' && (
                <IconButton size="small" onClick={() => handleReviewFindings(params.row)} color="primary">
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              )}
              {isAuditor && (params.row.status === 'Planned' || params.row.status === 'Approved') && (
                <IconButton size="small" onClick={() => handleStartAudit(params.row)} color="primary">
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
        },
      ];
    }

    if (isTablet) {
      return [
        { field: "id", headerName: "ID", width: 60 },
        { field: "auditName", headerName: "Audit Name", flex: 1, minWidth: 150 },
        { field: "auditType", headerName: "Type", width: 110 },
        {
          field: "status",
          headerName: "Status",
          width: 120,
          renderCell: (params) => (
            <Chip
              label={params.value}
              size="small"
              color={params.value === "In Progress" ? "primary" : "default"}
            />
          ),
        },
        {
          field: "actions",
          headerName: "Actions",
          width: 100,
          sortable: false,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              {!isAuditor && (
                <IconButton size="small" onClick={() => handleEdit(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {(currentUser?.role === "CAE" || currentUser?.role === "Chief Audit Executive") && params.row.status === "Planned" && (
                <IconButton size="small" onClick={() => handleApproveClick(params.row.id)} color="success">
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              )}
              {isAuditor && params.row.status === 'In Progress' && (
                <IconButton size="small" onClick={() => handleReviewFindings(params.row)} color="primary">
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              )}
              {isAuditor && (params.row.status === 'Planned' || params.row.status === 'Approved') && (
                <IconButton size="small" onClick={() => handleStartAudit(params.row)} color="primary">
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ),
        },
      ];
    }

    // Desktop view - all columns
    return [
      { field: "id", headerName: "ID", width: 70 },
      { field: "auditName", headerName: "Audit Name", flex: 1, minWidth: 200 },
      { field: "auditType", headerName: "Type", width: 150 },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={params.value === "In Progress" ? "primary" : "default"}
          />
        ),
      },
      // Hide Assigned To for Auditors as they only see their own audits
      ...(!isAuditor ? [{ field: "assignedTo", headerName: "Assigned To", width: 150 }] : []),
      { 
        field: "startDate", 
        headerName: "Start Date", 
        width: 150,
        valueFormatter: (value: any) => {
          if (!value) return '';
          return new Date(value).toLocaleDateString();
        }
      },
      { 
        field: "endDate", 
        headerName: "End Date", 
        width: 150,
        valueFormatter: (value: any) => {
          if (!value) return '';
          return new Date(value).toLocaleDateString();
        }
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {!isAuditor && (
              <Tooltip title="Edit Audit">
                <IconButton size="small" onClick={() => handleEdit(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Manage Programs - Manager/CAE, Status = Planned */}
            {((isManager || isCAE) && params.row.status === 'Planned') && (
              <Tooltip title="Manage Audit Programs">
                <IconButton size="small" onClick={() => {
                  setAuditToEdit(params.row);
                  setView("programs");
                }} color="primary">
                  <PlaylistAddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Assign Auditor - Only Manager, Only if Approved */}
            {isManager && (
              <Tooltip title={params.row.status === 'Approved' ? "Assign Auditor" : "Audit must be approved first"}>
                <span>
                  <IconButton 
                    size="small" 
                    onClick={() => handleAssignClick(params.row)}
                    disabled={params.row.status !== 'Approved'}
                  >
                    <PersonAddIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Approve Audit - Only CAE, Only if Planned */}
            {isCAE && params.row.status === 'Planned' && (
              <Tooltip title="Approve Audit">
                <IconButton size="small" onClick={() => handleApproveClick(params.row.id)} color="success">
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Execute Audit - Only Auditor, Only if In Progress */}
            {isAuditor && params.row.status === 'In Progress' && (
               <Button 
                 variant="contained" 
                 size="small" 
                 startIcon={<PlayArrowIcon />}
                 onClick={() => {
                   setAuditToEdit(params.row);
                   setView("execution");
                 }}
                 sx={{ fontSize: '0.75rem', py: 0.5, minWidth: '100px' }}
               >
                 Execute
               </Button>
            )}

            {isAuditor && (params.row.status === 'Planned' || params.row.status === 'Approved') && (
               <Button 
                 variant="outlined" 
                 size="small" 
                 startIcon={<PlayArrowIcon />}
                 onClick={() => handleStartAudit(params.row)}
                 sx={{ fontSize: '0.75rem', py: 0.5, minWidth: '100px' }}
               >
                 Start
               </Button>
            )}

            {/* Review Findings - For Managers/CAE or if not in progress for auditor */}
            {(!isAuditor || params.row.status !== 'In Progress') && (
              <Tooltip title="Review Findings">
                <IconButton size="small" onClick={() => handleReviewFindings(params.row)}>
                  <FactCheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ];
  }, [isMobile, isTablet, currentUser, handleApproveClick, handleReviewFindings, handleStartAudit]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: "100%" }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Typography
          variant={isMobile ? "h6" : "h4"}
          sx={{ color: "#0F1A2B", fontWeight: "bold" }}
        >
          {view === "list"
            ? "Audit Universe & Planning"
            : view === "create"
              ? "Create New Audit"
              : view === "edit"
                ? "Edit Audit"
                : filterType === 'new'
                ? "New Audits (Pending Execution)"
                : filterType === 'executed'
                ? "Executed Audits"
                : view === "execution"
                ? `Executing: ${auditToEdit?.auditName || ''}`
                : `Findings Review: ${auditToEdit?.auditName || ''}`}
        </Typography>
        
        {view === "list" && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
            {/* Filter Toggle - Visible to auditors and managers */}
            {currentUser && ['Manager', 'manager'].includes(currentUser.role) && (
              <ToggleButtonGroup
                value={filterMode}
                exclusive
                onChange={(e, newMode) => { if (newMode) setFilterMode(newMode); }}
                size="small"
                sx={{ bgcolor: 'white' }}
              >
                <ToggleButton value="all">All Audits</ToggleButton>
                <ToggleButton value="my">My Audits</ToggleButton>
              </ToggleButtonGroup>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setView("create")}
              sx={{ bgcolor: "#0F1A2B" }}
              fullWidth={isMobile}
            >
              New Audit
            </Button>
          </Box>
        )}
        {view !== "list" && (
          <Button
            variant="outlined"
            onClick={() => setView("list")}
            fullWidth={isMobile}
          >
            Back to List
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {view === "list" ? (
        <>
          {/* Dashboard KPI Tiles */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {kpiStats.map((stat, index) => (
              <Box key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeft: `4px solid ${stat.color}`,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#0F1A2B" }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.8 }}>
                    {stat.icon}
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              height: { xs: "auto", sm: 600 },
              width: "100%",
              bgcolor: "white",
              boxShadow: 1,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            {isMobile && filteredAudits.length > 0 ? (
              // Mobile card view
              <Stack spacing={2} sx={{ p: 2 }}>
                {filteredAudits.map((audit) => (
                  <Card key={audit.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", color: "#0F1A2B" }}
                          >
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
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={audit.status}
                          size="small"
                          color={
                            audit.status === "In Progress"
                              ? "primary"
                              : "default"
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              filteredAudits.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h6" color="textSecondary">No audits found.</Typography>
                  {(currentUser?.role === 'Auditor' || currentUser?.role === 'auditor') && (
                    <Typography variant="body2" color="textSecondary">You have no audits assigned to you at the moment.</Typography>
                  )}
                </Box>
              ) : (
              // DataGrid view for tablet and desktop
              <DataGrid
                rows={filteredAudits}
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
                density={isMobile ? "compact" : "standard"}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-root": {
                    fontSize: isMobile ? "0.75rem" : "inherit",
                  },
                }}
              />
              )
            )}
          </Box>
        </>
      ) : view === "findings" ? (
        // Findings Review View
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6">
                {(currentUser?.role === 'Auditor' || currentUser?.role === 'auditor') 
                  ? "Audit Execution" 
                  : "Audit Review"}: {auditToEdit?.auditName}
              </Typography>
              <Chip label={auditToEdit?.status} color="primary" size="small" sx={{ mt: 0.5 }} />
            </Box>
            {/* Only show Add Finding if In Progress (Auditor) */}
            {auditToEdit?.status === 'In Progress' && <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddFindingClick}>Add Finding</Button>}
          </Box>

          {/* Workflow Stepper */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={workflowSteps.indexOf(auditToEdit?.status === 'Completed' ? 'Finalized' : auditToEdit?.status)} alternativeLabel>
              {workflowSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Audit Details Summary */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: '#fafafa' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block">Audit Type</Typography>
                  <Typography variant="body2" fontWeight="medium">{auditToEdit?.auditType || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block">Assigned To</Typography>
                  <Typography variant="body2" fontWeight="medium">{auditToEdit?.assignedTo || 'Unassigned'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block">Start Date</Typography>
                  <Typography variant="body2" fontWeight="medium">{auditToEdit?.startDate ? new Date(auditToEdit.startDate).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="textSecondary" display="block">End Date</Typography>
                  <Typography variant="body2" fontWeight="medium">{auditToEdit?.endDate ? new Date(auditToEdit.endDate).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>{finding.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={finding.severity} 
                        size="small" 
                        color={finding.severity === "High" ? "error" : finding.severity === "Medium" ? "warning" : "default"} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={finding.status} 
                        size="small" 
                        variant="outlined"
                        color={finding.status === "Approved" ? "success" : finding.status === "Draft" ? "info" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {finding.status !== "Approved" && (
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApproveFinding(finding.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Evidence Section */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Audit Evidence</Typography>
            
            {evidenceFiles.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {evidenceFiles.map((file, idx) => (
                  <Chip key={idx} label={file} icon={<FactCheckIcon />} variant="outlined" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>No evidence uploaded yet.</Typography>
            )}

            {/* Upload Button - Only for Auditor when In Progress */}
            {auditToEdit?.status === 'In Progress' && (
              <Button 
                variant="outlined" 
                startIcon={<CloudUploadIcon />} 
                onClick={handleUploadEvidence}
              >
                Upload Evidence
              </Button>
            )}
          </Box>

          {/* Workflow Actions */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setView("list")}>Close</Button>
            
            {/* Auditor: Submit for Review */}
            {auditToEdit?.status === 'In Progress' && (currentUser?.role === 'Auditor' || currentUser?.role === 'auditor') && (
              <Button 
                variant="contained" 
                color="primary" 
                endIcon={<SendIcon />}
                onClick={handleSubmitForReview}
              >
                Submit for Review
              </Button>
            )}

            {/* Manager: Finalize */}
            {auditToEdit?.status === 'Under Review' && (currentUser?.role === 'Manager' || currentUser?.role === 'manager') && (
              <Button variant="contained" color="success" onClick={handleFinalizeAudit}>Finalize Audit</Button>
            )}
          </Box>
        </Paper>
      ) : view === "programs" ? (
          <AuditProgramsModule 
            audit={auditToEdit} 
            onBack={() => setView("list")} 
          />
        ) : view === "execution" ? (
        <AuditExecutionModule 
           initialAudit={auditToEdit} 
           onBack={() => setView("list")} 
        />
      ) : (
        // Create/Edit Form
        <AuditForm
          auditToEdit={auditToEdit}
          auditors={auditors}
          managers={managers}
          auditUniverseItems={auditUniverseItems}
          onSuccess={() => {
            setView("list");
            fetchAudits();
          }}
          onCancel={() => setView("list")}
        />
      )}

      {/* Assign Auditor Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Auditor</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Assign an auditor to <strong>{auditToEdit?.auditName}</strong>
          </Typography>
          <FormControl fullWidth margin="dense">
            <InputLabel id="auditor-select-label">Auditor</InputLabel>
            <Select
              labelId="auditor-select-label"
              value={auditorName}
              label="Auditor"
              onChange={(e: SelectChangeEvent) => setAuditorName(e.target.value)}
            >
              {auditors.map((auditor) => (
                <MenuItem key={auditor.id} value={auditor.name}>
                  {auditor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignConfirm} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Audit Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Audit Plan</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve this audit plan? This will allow the manager to assign an auditor.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveConfirm} variant="contained" color="success" autoFocus>Approve</Button>
        </DialogActions>
      </Dialog>

      {/* Add Finding Dialog (Auditor) */}
      <Dialog open={addFindingDialogOpen} onClose={() => setAddFindingDialogOpen(false)}>
        <DialogTitle>Draft New Finding</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Finding Description"
              fullWidth
              multiline
              rows={3}
              value={newFinding.description}
              onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newFinding.severity}
                label="Severity"
                onChange={(e: SelectChangeEvent) => setNewFinding({ ...newFinding, severity: e.target.value })}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFindingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFinding} variant="contained" disabled={!newFinding.description}>Save Draft</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditsPage;
