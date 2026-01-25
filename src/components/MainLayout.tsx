import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    CircularProgress, 
    AppBar, 
    Toolbar, 
    IconButton, 
    Typography, 
    Badge, 
    Avatar, 
    Menu, 
    MenuItem,
    CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Sidebar, { Page } from './Sidebar';
import DashboardPage from '../pages/DashboardPage';
import AuditsPage from '../pages/AuditsPage';
import FindingsPage from '../pages/FindingsPage';
import UsersPage from '../pages/UsersPage';
import RolesPage from '../pages/RolesPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import ProfilePage from '../pages/ProfilePage';
import AuditExecutionModule from './AuditExecutionModule';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        setMobileOpen(false); // Close mobile drawer on navigation
    };

    const handleProfileNavigate = () => {
        handleProfileMenuClose();
        handleNavigate('profile');
    };

    const handleLogoutClick = () => {
        handleProfileMenuClose();
        handleLogout();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage onNavigate={handleNavigate} />;
            case 'audits':
                return <AuditsPage filterType="all" />;
            case 'audits-new':
                return <AuditsPage filterType="new" />;
            case 'audits-executed':
                return <AuditsPage filterType="executed" />;
            case 'findings':
                return <FindingsPage viewMode="all" />;
            case 'findings-draft':
                return <FindingsPage viewMode="draft" />;
            case 'users':
                return <UsersPage />;
            case 'roles':
                return <RolesPage />;
            case 'audit-logs':
                return <AuditLogsPage />;
            case 'profile':
                return <ProfilePage />;
            case 'execution':
                return <AuditExecutionModule />;
            default:
                return <DashboardPage onNavigate={handleNavigate} />;
        }
    };

    if (!currentUser) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            
            {/* Top Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - 240px)` },
                    ml: { sm: `240px` },
                    bgcolor: 'white',
                    color: '#0F1A2B',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {/* Page Title could go here */}
                    </Typography>
                    
                    <IconButton size="large" aria-label="show notifications" color="inherit">
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F1A2B' }}>
                            {currentUser.name?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleProfileNavigate}>My Profile</MenuItem>
                        <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Sidebar
                userRole={currentUser.role}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                mobileOpen={mobileOpen}
                onDrawerToggle={handleDrawerToggle}
            />
            
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
                <Toolbar /> {/* Spacer for AppBar */}
                {renderPage()}
            </Box>
        </Box>
    );
};

export default MainLayout;