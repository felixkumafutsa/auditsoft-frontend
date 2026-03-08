/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import AuditWorkpaperPage from './pages/AuditWorkpaperPage';
import { ColorModeProvider } from './contexts/ColorModeContext';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for token on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        // A hard refresh can be simple way to reset all state
        window.location.href = '/';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <ColorModeProvider>
                {isAuthenticated ? (
                    <Routes>
                        <Route path="/workpaper/:programId" element={<AuditWorkpaperPage />} />
                        <Route path="/*" element={<MainLayout onLogout={handleLogout} />} />
                    </Routes>
                ) : (
                    <LoginPage onLoginSuccess={handleLoginSuccess} />
                )}
            </ColorModeProvider>
        </Box>
    );
};

export default App;
