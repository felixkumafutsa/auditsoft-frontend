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
import DeleteIcon from "@mui/icons-material/Delete";
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import AuditForm from "../components/AuditForm";
import AuditExecutionModule from "../components/AuditExecutionModule";
import AuditProgramsModule from "../components/AuditProgramsModule";
import api from "../services/api";
import { Audit } from "../types/audit";

const MySwal = withReactContent(Swal);

interface AuditsPageProps {
  filterType?: 'all' | 'new' | 'executed' | 'my';
}

const AuditsPage: React.FC<AuditsPageProps> = ({ filterType = 'all' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [view, setView] = useState<"list" | "create" | "edit" | "findings" | "execution" | "programs">("list");
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [auditToEdit, setAuditToEdit] = useState<any | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const handleDownloadPDF = async (auditId: number) => {
    try {
      const blob = await api.downloadAuditReportPDF(auditId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${auditId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download PDF:', err);
      MySwal.fire('Error', 'Failed to download PDF report.', 'error');
    }
  };

  const handleExportAuditsExcel = async () => {
    try {
      const blob = await api.exportAuditsExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Plans_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      MySwal.fire('Success', 'Audits exported successfully to Excel.', 'success');
    } catch (err) {
      console.error('Failed to export audits:', err);
      MySwal.fire('Error', 'Failed to export audits to Excel.', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await api.importAudits(file);
      MySwal.fire('Success', 'Audits imported successfully.', 'success');
      fetchAudits();
    } catch (err) {
      console.error('Failed to import audits:', err);
      MySwal.fire('Error', 'Failed to import audits. Please check the file format.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
    }
  };

  const handleDownloadWord = async (auditId: number) => {
    try {
      const blob = await api.downloadAuditReportWord(auditId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${auditId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download Word doc:', err);
      MySwal.fire('Error', 'Failed to download Word report.', 'error');
    }
  };
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handlePreviewReport = async (auditId: number) => {
    try {
      const blob = await api.previewAuditReport(auditId);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      console.error('Failed to preview audit report', err);
      MySwal.fire('Error', 'Failed to preview audit report.', 'error');
    }
  };
  const handleDownloadStoredReport = async (auditId: number) => {
    try {
      const blob = await api.downloadStoredAuditReport(auditId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${auditId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download stored report', err);
      MySwal.fire('Error', 'Failed to download stored report.', 'error');
    }
  };

  // Approval State
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [auditToApprove, setAuditToApprove] = useState<number | null>(null);

  // Check roles
  const isAuditor = currentUser?.role?.toLowerCase().includes('auditor');
  const isCAE = currentUser?.role?.toLowerCase().includes('cae') || currentUser?.role?.toLowerCase().includes('chief');
  const isManager = currentUser?.role?.toLowerCase().includes('manager');
  const isProcessOwner = currentUser?.role?.toLowerCase().includes('owner');

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

  const workflowSteps = ['Planned', 'Approved', 'In Progress', 'Under Review', 'Execution Finished', 'Finalized', 'Reviewed by Owner', 'Closed'];

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await api.getAudits();
      // Map snake_case to camelCase
      const mappedData = Array.isArray(data) ? data.map((a: any) => ({
        ...a,
        auditName: a.auditName || a.audit_name,
        auditType: a.auditType || a.audit_type,
        startDate: a.startDate || a.start_date,
        endDate: a.endDate || a.end_date,
        assignedTo: a.assignedManager ? a.assignedManager.name : (a.assignedTo || a.assigned_to),
        entityName: a.auditUniverse?.entityName || a.entityName || 'General'
      })) : [];
      
      setAudits(mappedData);
      localStorage.setItem('cached_audits', JSON.stringify(mappedData));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch audits", err);
      const cached = localStorage.getItem('cached_audits');
      if (cached) {
        setAudits(JSON.parse(cached));
        setError("Working offline. Showing cached data.");
      } else {
        MySwal.fire('Error', 'Failed to load audits and no cached data available.', 'error');
      }
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
          // Filter Auditors - Check nested userRoles from backend
          const validAuditors = usersData.filter((u: any) => 
            u.userRoles?.some((ur: any) => ur.role?.roleName === "Auditor")
          ).map((u: any) => ({
            id: u.id,
            name: u.name,
            role: "Auditor"
          }));
          setAuditors(validAuditors);

          // Filter Managers - Check nested userRoles from backend
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
        console.error("Failed to load real data:", err);
        // Do not fallback to mock data silently, let the user know or keep lists empty
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
    const isProcessOwner = currentUser.role === 'Process Owner' || currentUser.role === 'process_owner';

    if (isAuditor) {
      const userName = currentUser.name || currentUser.username || '';
      // Auditors ONLY see their own audits
      return audits.filter((a) => {
        const isAssigned = (a.assignedAuditors && a.assignedAuditors.length > 0) ? (
            currentUser.id ? a.assignedAuditors.some(u => u.id === currentUser.id) : a.assignedAuditors.some(u => u.name.toLowerCase() === userName.toLowerCase())
        ) : (a.assignedTo && a.assignedTo.toLowerCase().includes(userName.toLowerCase()));

        if (!isAssigned) return false;

        if (filterType === 'new') {
          return ['Planned', 'Approved', 'In Progress'].includes(a.status);
        }

        if (filterType === 'executed') {
          return ['Completed', 'Finalized', 'Under Review'].includes(a.status);
        }

        return true;
      });
    }

    if (isProcessOwner) {
      // Process Owners ONLY see audits for their entities
      return audits.filter((a: any) => {
        // The audit Universe ownerId should match the currentUser id
        return a.auditUniverse?.ownerId === currentUser.id;
      });
    }

    if (filterMode === 'my' || filterType === 'my') {
      const userName = currentUser.name || currentUser.username || '';
      return audits.filter((a) => {
         // For Managers, check if they are the assigned manager or if they are in the assignedAuditors (though usually they are the manager)
         const isAssigned = (a.assignedTo && a.assignedTo.toLowerCase().includes(userName.toLowerCase())) ||
                           (a.assignedAuditors && a.assignedAuditors.some(u => u.id === currentUser.id || u.name.toLowerCase() === userName.toLowerCase()));
         return isAssigned;
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
      MySwal.fire('Error', "Failed to assign auditor.", 'error');
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
    
    setView("execution");
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
          await api.transitionAudit(auditToApprove, "Approved", currentUser?.role);
          setAudits(audits.map((a) => (a.id === auditToApprove ? { ...a, status: "Approved" } : a)));
        }
      } catch (err) {
        console.error("Failed to approve audit", err);
        MySwal.fire('Error', "Failed to approve audit.", 'error');
      }
    }
    setApproveDialogOpen(false);
    setAuditToApprove(null);
  };

  const handleStartAudit = useCallback(async (audit: Audit) => {
    try {
      const toStatus = "In Progress";
      await api.transitionAudit(audit.id, toStatus, currentUser?.role);
      const updatedAudit = { ...audit, status: toStatus };
      setAudits((prev) => prev.map((a) => (a.id === audit.id ? updatedAudit : a)));
      handleReviewFindings(updatedAudit);
    } catch (err) {
      console.error("Failed to start audit", err);
      MySwal.fire('Error', "Failed to start audit.", 'error');
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
        const toStatus = "Under Review";
        await api.transitionAudit(auditToEdit.id, toStatus, currentUser?.role);
        const updatedAudit = { ...auditToEdit, status: toStatus };
        setAudits(audits.map(a => a.id === auditToEdit.id ? updatedAudit : a));
        setView("list");
      } catch (err) {
        console.error("Failed to submit for review", err);
        MySwal.fire('Error', "Failed to submit audit for review.", 'error');
      }
    }
  };

  const handleFinalizeAudit = async () => {
    if (auditToEdit) {
      try {
        const toStatus = "Finalized";
        await api.transitionAudit(auditToEdit.id, toStatus, currentUser?.role);
        const updatedAudit = { ...auditToEdit, status: toStatus };
        setAudits(audits.map(a => a.id === auditToEdit.id ? updatedAudit : a));
        setView("list");
      } catch (err) {
        console.error("Failed to finalize audit", err);
        MySwal.fire('Error', "Failed to finalize audit.", 'error');
      }
    }
  };

  const handleCloseAudit = async (audit?: Audit) => {
    const target = audit || auditToEdit;
    if (target) {
      try {
        const toStatus = "Closed";
        await api.transitionAudit(target.id, toStatus, currentUser?.role);
        const updatedAudit = { ...target, status: toStatus };
        setAudits(audits.map(a => a.id === target.id ? updatedAudit : a));
        setView("list");
      } catch (err) {
        console.error("Failed to close audit", err);
        MySwal.fire('Error', "Failed to close audit.", 'error');
      }
    }
  };

  const handleDeleteAudit = async (id: number) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteAudit(id);
        setAudits(audits.filter((a) => a.id !== id));
        MySwal.fire(
          'Deleted!',
          'Audit has been deleted.',
          'success'
        );
      } catch (err) {
        console.error("Failed to delete audit", err);
        MySwal.fire('Error', 'Failed to delete audit.', 'error');
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
    // Re-use role checks from outer scope if possible, or re-calculate
    // Note: useMemo dependency array must include currentUser
    
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
      { field: "entityName", headerName: "Entity", width: 150 },
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
      ...(!isAuditor ? [{
        field: "actions",
        headerName: "Actions",
        width: 150,
        sortable: false,
        renderCell: (params: any) => (
          <Stack direction="row" spacing={1}>
            {!isProcessOwner && (
              <Tooltip title="Edit Audit">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {isCAE && (params.row.status === 'Finalized' || params.row.status === 'Process Owner Review') && (
              <Tooltip title="Close Audit">
                <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleCloseAudit(params.row); }}>
                  <CheckCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {(isManager || isCAE) && (
              <Tooltip title="Delete Audit">
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteAudit(params.row.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )
      }] : []),
    ];
  }, [isMobile, isTablet, currentUser, isAuditor, isManager, isCAE, isProcessOwner]);

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
            ? (isManager || isAuditor ? "My Audits" : "Audit Universe & Planning")
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
            <TextField
              placeholder="Search Audits..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ bgcolor: 'white', minWidth: 200 }}
            />
            
            {/* Hidden Input for Import */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
            />

            {(isManager || isCAE) && (
              <>
                <Tooltip title="Import Audit Plans (CSV/Excel)">
                  <Button
                    variant="outlined"
                    startIcon={<FileUploadIcon />}
                    onClick={handleImportClick}
                    sx={{ color: "#0F1A2B", borderColor: "#0F1A2B" }}
                  >
                    Import
                  </Button>
                </Tooltip>

                <Tooltip title="Export Audits to Excel">
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportAuditsExcel}
                    sx={{ color: "#0F1A2B", borderColor: "#0F1A2B" }}
                  >
                    Export
                  </Button>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setView("create")}
                  sx={{ bgcolor: "#0F1A2B" }}
                  fullWidth={isMobile}
                >
                  New Audit
                </Button>
              </>
            )}
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
        <Alert severity={error.includes("offline") ? "warning" : "error"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isOffline && !error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Some actions may be limited and data might be out of date.
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
                  <Card 
                    key={audit.id} 
                    variant="outlined"
                    onClick={() => {
                        setAuditToEdit(audit);
                        setActionsModalOpen(true);
                    }}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }}
                  >
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
                onRowClick={(params) => {
                  setAuditToEdit(params.row);
                  setActionsModalOpen(true);
                }}
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
            <Stepper activeStep={workflowSteps.indexOf(auditToEdit?.status || 'Planned')} alternativeLabel>
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
                      {finding.status !== "Approved" && (isManager || isCAE) && (
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

            {/* CAE: Finalize */}
            {auditToEdit?.status === 'Under Review' && (isCAE) && (
              <Button variant="contained" color="success" onClick={handleFinalizeAudit}>Finalize Audit</Button>
            )}
            {/* CAE: Close */}
            {auditToEdit?.status === 'Finalized' && (isCAE) && (
              <Button variant="contained" color="warning" onClick={() => handleCloseAudit()}>Close Audit</Button>
            )}
          </Box>
        </Paper>
      ) : view === "programs" ? (
          <AuditProgramsModule 
            audit={auditToEdit!} 
            onBack={() => setView("list")} 
          />
        ) : view === "execution" ? (
        <AuditExecutionModule 
           initialAudit={auditToEdit} 
           onBack={() => setView("list")} 
           onEdit={handleEdit}
           onDelete={handleDeleteAudit}
           onAssign={handleAssignClick}
           onApprove={handleApproveClick}
           onManagePrograms={(audit) => { setAuditToEdit(audit); setView("programs"); }}
           onFinalize={handleFinalizeAudit}
           onClose={handleCloseAudit}
           onPreview={handlePreviewReport}
           onDownload={handleDownloadStoredReport}
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

      {/* Report Preview Dialog (Manager review-only) */}
      <Dialog open={previewOpen} onClose={() => { if (previewUrl) { window.URL.revokeObjectURL(previewUrl); } setPreviewOpen(false); setPreviewUrl(null); }} maxWidth="lg" fullWidth>
        <DialogTitle>Audit Report Preview</DialogTitle>
        <DialogContent dividers>
          {previewUrl ? (
            <Box sx={{ height: 600 }}>
              <iframe title="Audit Report" src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
            </Box>
          ) : (
            <Typography variant="body2">No preview available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { if (previewUrl) { window.URL.revokeObjectURL(previewUrl); } setPreviewOpen(false); setPreviewUrl(null); }}>Close</Button>
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
          {auditToEdit && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">{auditToEdit.auditName}</Typography>
                <Typography variant="body2" color="text.secondary">Status: <Chip label={auditToEdit.status} size="small" color="primary" sx={{ ml: 1 }} /></Typography>
              </Box>
              
              <Stack spacing={1.5}>
                {/* Execute/View Audit - Always available if selected */}
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<VisibilityIcon />} 
                  sx={{ bgcolor: '#0F1A2B', '&:hover': { bgcolor: '#1a2b45' } }}
                  onClick={() => {
                    setActionsModalOpen(false);
                    if (isAuditor && (auditToEdit.status === 'Planned' || auditToEdit.status === 'Approved')) {
                        handleStartAudit(auditToEdit);
                    } else {
                        setView("execution");
                    }
                  }}
                >
                  {isAuditor && (auditToEdit.status === 'Planned' || auditToEdit.status === 'Approved') 
                    ? "Start & Execute Audit" 
                    : (auditToEdit.status === 'Under Review' || auditToEdit.status === 'Execution Finished' ? "Review Audit" : "View / Execute Audit")
                  }
                </Button>

                {/* Assign Auditor - Managers/CAE when Approved/Planned */}
                {(isManager || isCAE) && (auditToEdit.status === 'Approved' || auditToEdit.status === 'Planned') && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary"
                    startIcon={<PersonAddIcon />} 
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleAssignClick(auditToEdit);
                    }}
                  >
                    Assign Auditor
                  </Button>
                )}

                {/* Approve Plan - CAE when Planned */}
                {isCAE && auditToEdit.status === 'Planned' && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="success"
                    startIcon={<CheckCircleIcon />} 
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleApproveClick(auditToEdit.id);
                    }}
                  >
                    Approve Audit Plan
                  </Button>
                )}

                {/* Finalize Audit - CAE when Under Review / Execution Finished */}
                {isCAE && (auditToEdit.status === 'Under Review' || auditToEdit.status === 'Execution Finished') && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="success"
                    startIcon={<FactCheckIcon />} 
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleFinalizeAudit();
                    }}
                  >
                    Finalize Audit
                  </Button>
                )}

                {/* Close Audit - CAE when Finalized */}
                {isCAE && (auditToEdit.status === 'Finalized' || auditToEdit.status === 'Process Owner Review') && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="warning"
                    startIcon={<LockIcon />} 
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleCloseAudit(auditToEdit);
                    }}
                  >
                    Close Audit
                  </Button>
                )}
                
                {/* Programs - Managers when Planned */}
                {isManager && auditToEdit.status === 'Planned' && (
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

                {/* Edit Plan - Managers when not closed */}
                {isManager && auditToEdit.status !== 'Closed' && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<EditIcon />} 
                    onClick={() => {
                      setActionsModalOpen(false);
                      handleEdit(auditToEdit);
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
    </Box>
  );
};

export default AuditsPage;
