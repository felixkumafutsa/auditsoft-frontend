/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

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
import StrategicAuditPlanPage from '../pages/StrategicAuditPlanPage';
import AuditProgramsPage from '../pages/AuditProgramsPage';
import StandardsLibraryPage from '../pages/StandardsLibraryPage';
import ControlMappingPage from '../pages/ControlMappingPage';
import CoverageAnalysisPage from '../pages/CoverageAnalysisPage';
import PolicyManagementPage from '../pages/PolicyManagementPage';
import FindingsPage from '../pages/FindingsPage';
import EvidencePage from '../pages/EvidencePage';
import RemediationPage from '../pages/RemediationPage';
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
import ReportsPage from '../pages/ReportsPage';
import ExecutiveReportsPage from '../pages/ExecutiveReportsPage';
import AuditUniversePage from '../pages/AuditUniversePage';
import ContinuousAuditsPage from '../pages/ContinuousAuditsPage';
import IntegrationsPage from '../pages/IntegrationsPage';
import MessagingPage from '../pages/MessagingPage';
import BoardViewerPage from '../pages/BoardViewerPage';
import OperationalReportsPage from '../pages/OperationalReportsPage';
import CustomReportsPage from '../pages/CustomReportsPage';
import ReportsFilesPage from '../pages/ReportsFilesPage';
import AuditWorkpaperPage from '../pages/AuditWorkpaperPage';
import WorkpapersPage from '../pages/WorkpapersPage';
import TimesheetsPage from '../pages/TimesheetsPage';
import GlobalTopBar from './GlobalTopBar';
import ContextualTopBar from './ContextualTopBar';

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

    // Handle URL changes and sync with page state
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const pathToPage: Record<string, Page> = {
                '/': 'dashboard',
                '/audits': 'audits',
                '/audits/new': 'audits-new',
                '/audits/executed': 'audits-executed',
                '/audits/my': 'my-audits',
                '/audit-plans': 'audit-plans',
                '/strategic-audit-plan': 'strategic-audit-plan',
                '/audit-programs': 'audit-programs',
                '/audit-universe': 'audit-universe',
                '/continuous-audits': 'continuous-audits',
                '/findings': 'findings',
                '/findings/draft': 'findings-draft',
                '/findings/my': 'my-findings',
                '/remediation': 'remediation',
                '/evidence': 'evidence',
                '/workpapers': 'workpapers',
                '/timesheets': 'timesheets',
                '/users': 'users',
                '/roles': 'roles',
                '/audit-logs': 'audit-logs',
                '/workflow-config': 'workflow-config',
                '/system-settings': 'system-settings',
                '/reports': 'reports',
                '/reports/executive': 'reports-executive',
                '/reports/operational': 'reports-operational',
                '/reports/custom': 'reports-custom',
                '/reports/files': 'reports-files',
                '/risk-register': 'risk-register',
                '/risk/kri': 'risk-kri',
                '/risk/heatmaps': 'risk-heatmaps',
                '/compliance/standards': 'compliance-standards',
                '/compliance/policies': 'compliance-policies',
                '/policy-management': 'policy-management',
                '/compliance/controls': 'compliance-controls',
                '/compliance/coverage': 'compliance-coverage',
                '/profile': 'profile',
                '/execution': 'execution',
                '/notifications': 'notifications',
                '/messaging': 'messaging',
                '/board-viewer': 'board-viewer'
            };
            
            const page = pathToPage[path];
            if (page && page !== currentPage) {
                setCurrentPage(page);
            }
        };

        // Handle initial URL on mount
        handlePopState();
        
        // Listen for browser back/forward
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentPage]);

    // Handle deep links (SPA paths that land directly on a page)
    useEffect(() => {
        try {
            const path = window.location.pathname || '/';
            if (path === '/' || !path) return;
            const trimmed = path.replace(/^\/+|\/+$/g, '');

            // Support deep link to create audit (e.g. /audits/create?entityId=12&riskLevel=High)
            if (trimmed.startsWith('audits/create')) {
                const params = new URLSearchParams(window.location.search);
                const prefill: any = {};
                if (params.has('entityId')) prefill.auditUniverseId = Number(params.get('entityId'));
                if (params.has('riskLevel')) prefill.riskLevel = params.get('riskLevel');
                if (Object.keys(prefill).length > 0) {
                    try { localStorage.setItem('createAuditPrefill', JSON.stringify(prefill)); } catch (e) { /* ignore */ }
                }
                // Let React Router handle the navigation
                return;
            }
        } catch (e) {
            // Non-fatal
            // console.error('Failed to parse deep link', e);
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setMobileOpen(false); // Close mobile drawer on navigation
        
        // Update browser URL to match the current page
        const pageToPath: Record<Page, string> = {
            'dashboard': '/',
            'audits': '/audits',
            'audits-new': '/audits/new',
            'audits-executed': '/audits/executed',
            'my-audits': '/audits/my',
            'audit-plans': '/audit-plans',
            'strategic-audit-plan': '/strategic-audit-plan',
            'audit-programs': '/audit-programs',
            'audit-universe': '/audit-universe',
            'continuous-audits': '/continuous-audits',
            'findings': '/findings',
            'findings-draft': '/findings/draft',
            'my-findings': '/findings/my',
            'remediation': '/remediation',
            'evidence': '/evidence',
            'workpapers': '/workpapers',
            'timesheets': '/timesheets',
            'users': '/users',
            'roles': '/roles',
            'audit-logs': '/audit-logs',
            'workflow-config': '/workflow-config',
            'system-settings': '/system-settings',
            'reports': '/reports',
            'reports-executive': '/reports/executive',
            'reports-operational': '/reports/operational',
            'reports-custom': '/reports/custom',
            'reports-files': '/reports/files',
            'risk-register': '/risk-register',
            'risk-kri': '/risk/kri',
            'risk-heatmaps': '/risk/heatmaps',
            'compliance-standards': '/compliance/standards',
            'compliance-policies': '/compliance/policies',
            'policy-management': '/policy-management',
            'compliance-controls': '/compliance/controls',
            'compliance-coverage': '/compliance/coverage',
            'profile': '/profile',
            'execution': '/execution',
            'notifications': '/notifications',
            'messaging': '/messaging',
            'board-viewer': '/board-viewer'
        };
        
        const newPath = pageToPath[page];
        if (newPath && window.location.pathname !== newPath) {
            window.history.pushState({}, '', newPath);
        }
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
            case 'strategic-audit-plan':
                return <StrategicAuditPlanPage />;
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

            // Evidence
            case 'evidence':
                return <EvidencePage />;

            // Workpapers & Time Tracking
            case 'workpapers':
                return <WorkpapersPage />;
            case 'timesheets':
                return <TimesheetsPage />;

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
            case 'reports':
                return <ReportsPage />;
            case 'reports-executive':
                return <ReportsPage />;
            case 'reports-operational':
                return <OperationalReportsPage />;
            case 'reports-custom':
                return <CustomReportsPage />;
            case 'reports-files':
                return <ReportsFilesPage />;

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
            case 'compliance-policies':
                return <PolicyManagementPage />;
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <CssBaseline />

            {/* Global Top Bar */}
            <GlobalTopBar
                user={currentUser}
                onDrawerToggle={handleDrawerToggle}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
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
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}>
                    {renderPage()}
                </Box>
                
                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        mt: 'auto',
                        py: 2,
                        px: 3,
                        backgroundColor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                    }}
                >
                    <Typography variant="body2" color="text.primary" sx={{ order: { xs: 2, sm: 1 } }}>
                        © 2026 Auditsoft. All rights reserved.
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ order: { xs: 1, sm: 2 } }}>
                        Developed by Kapeleta
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
