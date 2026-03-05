import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tooltip,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    Grid,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import {
    Warning as WarningIcon,
    Assessment as AssessmentIcon,
    Security as SecurityIcon,
    AccountBalance as AccountBalanceIcon,
    SettingsSuggest as SettingsIcon,
    Gavel as ComplianceIcon,
    PrecisionManufacturing as OperationalIcon,
    TrendingUp as StrategicIcon
} from '@mui/icons-material';

interface Risk {
    id: number;
    riskId: string;
    title: string;
    category: string;
    impact: string;
    likelihood: string;
    status: string;
    inherentImpact?: string;
    inherentLikelihood?: string;
    residualImpact?: string;
    residualLikelihood?: string;
}

interface RiskHeatmapProps {
    risks: Risk[];
    title?: string;
}

const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const LIKELIHOOD_LEVELS = ['Certain', 'Likely', 'Possible', 'Unlikely', 'Rare'];

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks = [], title = "Enterprise Risk Heat Map" }) => {
    const theme = useTheme();
    const [viewMode, setViewMode] = useState<'inherent' | 'residual'>('inherent');

    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: 'inherent' | 'residual',
    ) => {
        if (newView !== null) {
            setViewMode(newView);
        }
    };

    const getCellColor = (impact: string, likelihood: string) => {
        const impactIdx = IMPACT_LEVELS.indexOf(impact);
        const l_levels_reversed = [...LIKELIHOOD_LEVELS].reverse();
        const likelihoodIdx = l_levels_reversed.indexOf(likelihood);
        const heatScore = (impactIdx + 1) * (likelihoodIdx + 1);

        if (heatScore >= 12) return '#FFF5F5';
        if (heatScore >= 8) return '#FFF9F2';
        if (heatScore >= 4) return '#FFFDF0';
        return '#F6FFF8';
    };

    const getBorderColor = (impact: string, likelihood: string) => {
        const impactIdx = IMPACT_LEVELS.indexOf(impact);
        const l_levels_reversed = [...LIKELIHOOD_LEVELS].reverse();
        const likelihoodIdx = l_levels_reversed.indexOf(likelihood);
        const heatScore = (impactIdx + 1) * (likelihoodIdx + 1);

        if (heatScore >= 12) return '#FC8181';
        if (heatScore >= 8) return '#F6AD55';
        if (heatScore >= 4) return '#F6E05E';
        return '#68D391';
    };

    const getRisksForCell = (impact: string, likelihood: string) => {
        return risks.filter(r => {
            const targetImpact = (viewMode === 'inherent'
                ? (r.inherentImpact || r.impact)
                : (r.residualImpact || r.impact)) || 'Medium';
            const targetLikelihood = (viewMode === 'inherent'
                ? (r.inherentLikelihood || r.likelihood)
                : (r.residualLikelihood || r.likelihood)) || 'Possible';

            return targetImpact === impact && targetLikelihood === likelihood;
        });
    };

    const categories = risks.reduce((acc: any, risk) => {
        const cat = risk.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('it') || cat.includes('cyber') || cat.includes('tech')) return <SecurityIcon />;
        if (cat.includes('finan')) return <AccountBalanceIcon />;
        if (cat.includes('compli') || cat.includes('regula') || cat.includes('legal')) return <ComplianceIcon />;
        if (cat.includes('operat')) return <OperationalIcon />;
        if (cat.includes('strate')) return <StrategicIcon />;
        return <WarningIcon />;
    };

    const getCategoryColor = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('it') || cat.includes('cyber') || cat.includes('tech')) return '#3182ce';
        if (cat.includes('finan')) return '#38a169';
        if (cat.includes('compli') || cat.includes('regula') || cat.includes('legal')) return '#e53e3e';
        if (cat.includes('operat')) return '#d69e2e';
        if (cat.includes('strate')) return '#805ad5';
        return '#718096';
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px', color: '#0F1A2B' }}>
                        {title}
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    sx={{ p: 0.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                >
                    <ToggleButton value="inherent" sx={{ px: 2, textTransform: 'none', fontWeight: 'bold' }}>Inherent</ToggleButton>
                    <ToggleButton value="residual" sx={{ px: 2, textTransform: 'none', fontWeight: 'bold' }}>Residual</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ position: 'relative', overflowX: 'auto', pb: 2 }}>
                <Box sx={{ minWidth: 600 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {LIKELIHOOD_LEVELS.map((likelihood) => (
                            <Box key={likelihood} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                                <Box sx={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: '700', color: 'text.secondary' }}>{likelihood}</Typography>
                                </Box>
                                <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                                    {IMPACT_LEVELS.map((impact) => {
                                        const cellRisks = getRisksForCell(impact, likelihood);
                                        const bgColor = getCellColor(impact, likelihood);
                                        const borderColor = getBorderColor(impact, likelihood);
                                        return (
                                            <Grid key={`${likelihood}-${impact}`} size={{ xs: 3 }}>
                                                <Box sx={{
                                                    height: 70,
                                                    bgcolor: bgColor,
                                                    border: `1.5px solid ${borderColor}`,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 }
                                                }}>
                                                    {cellRisks.length > 0 ? (
                                                        <Tooltip title={`${cellRisks.length} Risks`}>
                                                            <Chip
                                                                label={cellRisks.length}
                                                                size="small"
                                                                sx={{ bgcolor: 'white', fontWeight: 'bold', border: `1px solid ${borderColor}` }}
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ opacity: 0.2 }}>-</Typography>
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        ))}

                        {/* X-Axis Labels */}
                        <Box sx={{ display: 'flex', mt: 1 }}>
                            <Box sx={{ width: 100 }} />
                            <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                                {IMPACT_LEVELS.map((impact) => (
                                    <Grid key={impact} size={{ xs: 3 }} sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: '700', color: 'text.secondary' }}>{impact}</Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

            <Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" sx={{ fontSize: 18 }} />
                    Risk Distribution by Category
                </Typography>

                <Grid container spacing={2}>
                    {Object.entries(categories).map(([category, count]) => (
                        <Grid key={category} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    borderRadius: 3,
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: getCategoryColor(category), bgcolor: alpha(getCategoryColor(category), 0.02) }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: alpha(getCategoryColor(category), 0.1),
                                        color: getCategoryColor(category),
                                        width: 32,
                                        height: 32
                                    }}
                                >
                                    {getCategoryIcon(category)}
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1 }}>{category}</Typography>
                                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F1A2B' }}>{count as number}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Paper>
    );
};

export default RiskHeatmap;
