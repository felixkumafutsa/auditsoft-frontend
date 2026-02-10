import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    CircularProgress, 
    CssBaseline,
    Drawer,
    Typography
} from '@mui/material';
import Sidebar from './Sidebar';
import { Page } from '../types/navigation';
import DashboardPage from '../pages/DashboardPage';
import AuditsPage from '../pages/AuditsPage';
import AuditPlansPage from '../pages/AuditPlansPage';
import AuditProgramsPage from '../pages/AuditProgramsPage';
import StandardsLibraryPage from '../pages/StandardsLibraryPage';
import ControlMappingPage from '../pages/ControlMappingPage';
import CoverageAnalysisPage from '../pages/CoverageAnalysisPage';
import FindingsPage from '../pages/FindingsPage';
import EvidencePage from '../pages/EvidencePage';
import RemediationPage from '../pages/RemediationPage';
import CommentsPage from '../pages/CommentsPage';
import UsersPage from '../pages/UsersPage';
import RolesPage from '../pages/RolesPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import WorkflowConfigPage from '../pages/WorkflowConfigPage';
import ProfilePage from '../pages/ProfilePage';
import AuditExecutionModule from './AuditExecutionModule';
import NotificationsPage from '../pages/NotificationsPage';
import RiskRegisterPage from '../pages/RiskRegisterPage';
import RiskKRIsPage from '../pages/RiskKRIsPage';
import RiskHeatmapPage from '../pages/RiskHeatmapPage';
import ExecutiveReportsPage from '../pages/ExecutiveReportsPage';
import AuditUniversePage from '../pages/AuditUniversePage';
import ContinuousAuditsPage from '../pages/ContinuousAuditsPage';
import IntegrationsPage from '../pages/IntegrationsPage';
import MessagingPage from '../pages/MessagingPage';
import ProcessOwnerPage from '../pages/ProcessOwnerPage';
import BoardViewerPage from '../pages/BoardViewerPage';
import OperationalReportsPage from '../pages/OperationalReportsPage';
import CustomReportsPage from '../pages/CustomReportsPage';
import GlobalTopBar from './GlobalTopBar';
import ContextualTopBar from './ContextualTopBar';
import api from '../services/api';

interface User {
    name: string;
    username: string;
    role: string;
}

interface MainLayoutProps {
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = useCallback(() => {
        onLogout();
    }, [onLogout]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            localStorage.setItem('userRole', user.role);
        } else {
            handleLogout();
        }
    }, [handleLogout]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setMobileOpen(false); // Close mobile drawer on navigation
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage onNavigate={handleNavigate} />;
            
            // Audits
            case 'audits':
                return <AuditsPage filterType="all" />;
            case 'audits-new':
                return <AuditsPage filterType="new" />;
            case 'audits-executed':
                return <AuditsPage filterType="executed" />;
            case 'my-audits':
                return <AuditsPage filterType="my" />;
            case 'audit-plans':
                return <AuditPlansPage />;
            case 'audit-programs':
                return <AuditProgramsPage />;
            case 'audit-universe':
                return <AuditUniversePage />;
            case 'continuous-audits':
                return <ContinuousAuditsPage />;
            
            // Findings
            case 'findings':
                return <FindingsPage viewMode="all" />;
            case 'findings-draft':
                return <FindingsPage viewMode="draft" />;
            case 'my-findings':
                return <FindingsPage viewMode="my" />;
            
            // Process Owner
            case 'remediation':
                return <RemediationPage />;
            case 'comments':
                return <CommentsPage />;
            
            // Evidence
            case 'evidence':
                return <EvidencePage />;

            // Admin
            case 'users':
                return <UsersPage />;
            case 'roles':
                return <RolesPage />;
            case 'audit-logs':
                return <AuditLogsPage />;
            case 'workflow-config':
                return <WorkflowConfigPage />;
            case 'system-settings':
                return <IntegrationsPage />;


            // Reports
            case 'reports-executive':
                return <ExecutiveReportsPage />;
            case 'reports-operational':
                return <OperationalReportsPage />;
            case 'reports-custom':
                return <CustomReportsPage />;

            // Risk Management
            case 'risk-register':
                return <RiskRegisterPage />;
            case 'risk-kri':
                return <RiskKRIsPage />;
            case 'risk-heatmaps':
                return <RiskHeatmapPage />;

            // Compliance
            case 'compliance-standards':
                return <StandardsLibraryPage />;
            case 'compliance-controls':
                return <ControlMappingPage />;
            case 'compliance-coverage':
                return <CoverageAnalysisPage />;
            
            // Others
            case 'profile':
                return <ProfilePage />;
            case 'execution':
                return <AuditExecutionModule />;
            case 'notifications':
                return <NotificationsPage />;
            case 'messaging':
                return <MessagingPage />;
            case 'process-owner':
                return <ProcessOwnerPage />;
            case 'board-viewer':
                return <BoardViewerPage />;
            default:
                return <DashboardPage onNavigate={handleNavigate} />;
        }
    };

    if (!currentUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
            <CssBaseline />
            
            {/* Global Top Bar */}
            <GlobalTopBar 
                user={currentUser}
                onDrawerToggle={handleDrawerToggle}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                unreadCount={unreadCount}
            />
            
            {/* Spacer for fixed GlobalTopBar */}
            <Box sx={{ height: 64 }} />

            {/* Contextual Top Bar (Hidden on Mobile) */}
            <ContextualTopBar 
                userRole={currentUser.role}
                currentPage={currentPage}
                onNavigate={handleNavigate}
            />

            {/* Sidebar (Drawer) */}
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    <Sidebar 
                        userRole={currentUser.role}
                        currentPage={currentPage}
                        onNavigate={handleNavigate}
                        mobileOpen={mobileOpen}
                        onDrawerToggle={handleDrawerToggle}
                    />
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                {renderPage()}
            </Box>
        </Box>
    );
};

export default MainLayout;
