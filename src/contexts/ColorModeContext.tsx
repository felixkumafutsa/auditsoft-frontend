import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type Mode = 'light' | 'dark';

interface ColorModeContextValue {
    mode: Mode;
    toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>({
    mode: 'light',
    toggleColorMode: () => { },
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<Mode>(() => {
        const saved = localStorage.getItem('colorMode');
        return (saved === 'dark' || saved === 'light') ? saved : 'light';
    });

    const toggleColorMode = useCallback(() => {
        setMode(prev => {
            const next: Mode = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('colorMode', next);
            return next;
        });
    }, []);

    const theme = useMemo(() => {
        const isDark = mode === 'dark';
        return createTheme({
            palette: {
                mode,
                ...(isDark
                    ? {
                        primary: { main: '#90caf9' },
                        secondary: { main: '#ce93d8' },
                        background: { default: '#0d1117', paper: '#161b22' },
                        text: { primary: '#ffffff', secondary: '#c9d1d9' },
                        divider: 'rgba(255,255,255,0.12)',
                        action: {
                            active: '#ffffff',
                            hover: 'rgba(255,255,255,0.08)',
                        },
                    }
                    : {
                        primary: { main: '#0F1A2B' },
                        background: { default: '#f5f7fa', paper: '#ffffff' },
                    }
                ),
            },
            components: {
                // ── AppBar ─────────────────────────────────────────────────────────
                MuiAppBar: {
                    styleOverrides: {
                        root: isDark
                            ? { borderBottom: '1px solid rgba(255,255,255,0.12)' }
                            : {},
                    },
                },
                // ── Buttons inside contextual toolbar ──────────────────────────────
                // When AppBar uses background.paper in dark mode the text must be
                // explicitly set to the theme text colour (not AppBar's white default)
                MuiButton: {
                    styleOverrides: {
                        root: ({ theme: t }) => ({
                            // Toolbar buttons that have color="inherit" inherit the AppBar
                            // foreground; when the AppBar is paper-coloured (contextual bar)
                            // the color should always be the text.primary token to stay legible.
                            '&.MuiButton-colorInherit': {
                                color: t.palette.text.primary,
                            },
                            // Enhanced button text visibility in dark mode
                            ...(isDark && {
                                color: '#ffffff',
                                '&:hover': {
                                    color: '#ffffff',
                                },
                                '&.MuiButton-contained': {
                                    color: '#ffffff',
                                    '&:hover': {
                                        color: '#ffffff',
                                    },
                                },
                                '&.MuiButton-outlined': {
                                    color: '#ffffff',
                                    borderColor: 'rgba(255,255,255,0.23)',
                                    '&:hover': {
                                        color: '#ffffff',
                                        borderColor: '#90caf9',
                                    },
                                },
                            }),
                        }),
                    },
                },
                // ── Typography (Headings) ───────────────────────────────────────────
                MuiTypography: {
                    styleOverrides: {
                        root: isDark ? {
                            color: '#ffffff',
                        } : {},
                        h1: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                        h2: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                        h3: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                        h4: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                        h5: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                        h6: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                    },
                },
                // ── Drawer ─────────────────────────────────────────────────────────
                MuiDrawer: {
                    styleOverrides: {
                        paper: isDark
                            ? { backgroundColor: '#161b22', borderRight: '1px solid rgba(255,255,255,0.12)' }
                            : {},
                    },
                },
                // ── Global Body Reset ──────────────────────────────────────────────
                MuiCssBaseline: {
                    styleOverrides: {
                        body: {
                            background: isDark 
                                ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)' 
                                : 'linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)',
                            backgroundAttachment: 'fixed',
                            minHeight: '100vh',
                        },
                    },
                },
                // ── Cards & Papers (Glassmorphism) ─────────────────────────────────
                MuiCard: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                            backdropFilter: 'blur(12px)',
                            backgroundColor: isDark ? 'rgba(22, 27, 34, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                            borderRadius: '16px',
                        },
                    },
                },
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                            backdropFilter: 'blur(12px)',
                            backgroundColor: isDark ? 'rgba(22, 27, 34, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                            borderRadius: '16px',
                        },
                    },
                },
                // ── Table ──────────────────────────────────────────────────────────
                MuiTableCell: {
                    styleOverrides: {
                        root: isDark
                            ? {
                                borderBottomColor: 'rgba(255,255,255,0.12)',
                                color: '#ffffff',
                            }
                            : {},
                        head: isDark
                            ? {
                                backgroundColor: '#1c2128',
                                color: '#ffffff',
                                fontWeight: 600,
                            }
                            : {},
                    },
                },
                // ── Input fields ───────────────────────────────────────────────────
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: isDark
                            ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.23)' } }
                            : {},
                    },
                },
                MuiInputLabel: {
                    styleOverrides: {
                        root: isDark ? { color: '#c9d1d9' } : {},
                    },
                },
                // ── Chips ──────────────────────────────────────────────────────────
                MuiChip: {
                    styleOverrides: {
                        root: isDark ? { 
                            borderColor: 'rgba(255,255,255,0.23)',
                            color: '#ffffff',
                        } : {},
                    },
                },
                // ── Dialog ─────────────────────────────────────────────────────────
                MuiDialogTitle: {
                    styleOverrides: {
                        root: isDark ? {
                            color: '#ffffff',
                            fontWeight: 600,
                        } : {},
                    },
                },
                MuiDialogContentText: {
                    styleOverrides: {
                        root: isDark ? {
                            color: '#c9d1d9',
                        } : {},
                    },
                },
            },
        });
    }, [mode]);

    return (
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
