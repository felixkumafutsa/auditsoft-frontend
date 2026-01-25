import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';

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

    const theme = useMemo(() => createTheme({
        palette: {
            primary: {
                main: '#0F1A2B',
            },
        },
    }), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
        </ThemeProvider>
    );
};

export default App;
