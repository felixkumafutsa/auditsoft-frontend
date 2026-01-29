import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  Tooltip
} from '@mui/material';
import api from '../services/api';

interface Risk {
  id: number;
  riskId: string;
  title: string;
  category: string;
  impact: string;
  likelihood: string;
  status: string;
}

const IMPACT_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const LIKELIHOOD_LEVELS = ['High', 'Medium', 'Low']; // Top to Bottom

const RiskHeatmapPage: React.FC = () => {
  const theme = useTheme();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const data = await api.getRisks();
        setRisks(data);
      } catch (error) {
        console.error('Failed to fetch risks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  const getCellColor = (impact: string, likelihood: string) => {
    // Simple logic for heatmap colors
    const impactIdx = IMPACT_LEVELS.indexOf(impact);
    const likelihoodIdx = ['Low', 'Medium', 'High'].indexOf(likelihood); // 0=Low, 2=High
    
    // Score = (Impact + 1) * (Likelihood + 1)
    // Max = 4 * 3 = 12
    const score = (impactIdx + 1) * (likelihoodIdx + 1);

    if (score >= 8) return '#ffcdd2'; // Red
    if (score >= 4) return '#fff9c4'; // Yellow
    return '#c8e6c9'; // Green
  };

  const getRisksForCell = (impact: string, likelihood: string) => {
    return risks.filter(r => 
      r.impact === impact && r.likelihood === likelihood && r.status === 'open'
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Risk Heatmap
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Visual representation of open risks based on Impact and Likelihood.
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3, overflowX: 'auto' }}>
        <Box sx={{ minWidth: 800 }}>
          {/* Header Row (Impact) */}
          <Box display="flex" mb={1}>
            <Box width={100} display="flex" alignItems="center" justifyContent="center">
              <Typography variant="subtitle2" sx={{ transform: 'rotate(-90deg)', fontWeight: 'bold' }}>
                LIKELIHOOD
              </Typography>
            </Box>
            {IMPACT_LEVELS.map(impact => (
              <Box key={impact} flex={1} textAlign="center" p={1} bgcolor="grey.100" mx={0.5} borderRadius={1}>
                <Typography variant="subtitle1" fontWeight="bold">{impact}</Typography>
              </Box>
            ))}
          </Box>

          {/* Rows (Likelihood) */}
          {LIKELIHOOD_LEVELS.map(likelihood => (
            <Box key={likelihood} display="flex" mb={1} minHeight={150}>
              {/* Y-Axis Label */}
              <Box width={100} display="flex" alignItems="center" justifyContent="center" bgcolor="grey.100" borderRadius={1} mr={1}>
                <Typography variant="subtitle1" fontWeight="bold">{likelihood}</Typography>
              </Box>
              
              {/* Cells */}
              {IMPACT_LEVELS.map(impact => {
                const cellRisks = getRisksForCell(impact, likelihood);
                const bgColor = getCellColor(impact, likelihood);
                
                return (
                  <Box 
                    key={`${likelihood}-${impact}`} 
                    flex={1} 
                    bgcolor={bgColor} 
                    mx={0.5} 
                    p={1} 
                    borderRadius={1}
                    border="1px solid rgba(0,0,0,0.05)"
                    sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 1 } }}
                  >
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {cellRisks.map(risk => (
                        <Tooltip key={risk.id} title={`${risk.riskId}: ${risk.title}`}>
                          <Chip 
                            label={risk.riskId} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'white', 
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 20
                            }} 
                          />
                        </Tooltip>
                      ))}
                      {cellRisks.length === 0 && (
                        <Typography variant="caption" color="textSecondary" sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                          -
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
          
          <Box textAlign="center" mt={2}>
            <Typography variant="subtitle2" fontWeight="bold">IMPACT</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RiskHeatmapPage;
