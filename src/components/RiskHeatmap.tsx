import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Tooltip,
    Chip,
} from '@mui/material';

interface Risk {
    id: number;
    riskId: string;
    title: string;
    category: string;
    impact: string;
    likelihood: string;
    status: string;
}

interface RiskHeatmapProps {
    risks: Risk[];
    title?: string;
}

const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const LIKELIHOOD_LEVELS = ['High', 'Medium', 'Low'];

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks, title = "Organizational Risk Heatmap" }) => {
    const getCellColor = (impact: string, likelihood: string) => {
        const impactIdx = IMPACT_LEVELS.indexOf(impact);
        const likelihoodIdx = ['Low', 'Medium', 'High'].indexOf(likelihood);
        const score = (impactIdx + 1) * (likelihoodIdx + 1);

        if (score >= 8) return '#ffebee'; // Light Red
        if (score >= 4) return '#fffde7'; // Light Yellow
        return '#f1f8e9'; // Light Green
    };

    const getBorderColor = (impact: string, likelihood: string) => {
        const impactIdx = IMPACT_LEVELS.indexOf(impact);
        const likelihoodIdx = ['Low', 'Medium', 'High'].indexOf(likelihood);
        const score = (impactIdx + 1) * (likelihoodIdx + 1);

        if (score >= 8) return '#ef5350'; // Red
        if (score >= 4) return '#fbc02d'; // Yellow
        return '#66bb6a'; // Green
    };

    const getRisksForCell = (impact: string, likelihood: string) => {
        return risks.filter(r =>
            r.impact === impact && r.likelihood === likelihood
        );
    };

    return (
        <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {title}
            </Typography>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Likelihood / Impact Grid */}
                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    {/* Y-Axis Label (Likelihood) */}
                    <Box sx={{
                        width: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Typography
                            variant="caption"
                            sx={{
                                transform: 'rotate(-90deg)',
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                                color: 'text.secondary'
                            }}
                        >
                            LIKELIHOOD
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        {LIKELIHOOD_LEVELS.map((likelihood) => (
                            <Box key={likelihood} sx={{ display: 'flex', height: '33.33%' }}>
                                <Box sx={{
                                    width: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    pr: 1
                                }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                        {likelihood}
                                    </Typography>
                                </Box>

                                {IMPACT_LEVELS.map((impact) => {
                                    const cellRisks = getRisksForCell(impact, likelihood);
                                    const bgColor = getCellColor(impact, likelihood);
                                    const borderColor = getBorderColor(impact, likelihood);

                                    return (
                                        <Box
                                            key={`${likelihood}-${impact}`}
                                            sx={{
                                                flex: 1,
                                                bgcolor: bgColor,
                                                border: `1px solid ${borderColor}`,
                                                m: 0.2,
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                minHeight: 60
                                            }}
                                        >
                                            {cellRisks.length > 0 ? (
                                                <Tooltip title={`${cellRisks.length} Risks: ${cellRisks.map(r => r.riskId).join(', ')}`}>
                                                    <Chip
                                                        label={cellRisks.length}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'white',
                                                            fontWeight: 'bold',
                                                            boxShadow: 1
                                                        }}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}

                        {/* X-Axis Labels (Impact) */}
                        <Box sx={{ display: 'flex', mt: 1 }}>
                            <Box sx={{ width: 60 }} /> {/* Spacer for Y-Axis labels */}
                            {IMPACT_LEVELS.map((impact) => (
                                <Box key={impact} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                        {impact}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ textAlign: 'center', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                IMPACT
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default RiskHeatmap;
