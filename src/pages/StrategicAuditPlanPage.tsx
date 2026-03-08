import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import api from '../services/api';

interface AnnualPlan {
  year: number;
  summary: {
    totalAudits: number;
    totalBudget: number;
    totalResourceHours: number;
    highRiskAudits: number;
    approvedAudits: number;
    riskDistribution: { [key: string]: number };
    quarterlyDistribution: { [key: string]: number };
  };
  quarterlyPlan: {
    Q1: any[];
    Q2: any[];
    Q3: any[];
    Q4: any[];
    Unassigned: any[];
  };
  audits: any[];
}

const StrategicAuditPlanPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const fetchAnnualPlan = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAnnualPlan(selectedYear);
      setAnnualPlan(data);
    } catch (error) {
      console.error('Failed to fetch annual plan:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const data = await api.getRiskBasedRecommendations(10);
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnnualPlan();
    fetchRecommendations();
  }, [selectedYear, fetchAnnualPlan, fetchRecommendations]);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return '#d32f2f';
      case 'High': return '#f57c00';
      case 'Medium': return '#fbc02d';
      case 'Low': return '#388e3c';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0F1A2B' }}>
          Strategic Audit Plan
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Quarterly Plan" />
        <Tab label="Risk Analysis" />
        <Tab label="Recommendations" />
      </Tabs>

      {tabValue === 0 && annualPlan && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Audits</Typography>
                <Typography variant="h4">{annualPlan.summary.totalAudits}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Budget</Typography>
                <Typography variant="h4">${annualPlan.summary.totalBudget.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Hours</Typography>
                <Typography variant="h4">{annualPlan.summary.totalResourceHours.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>High Risk Audits</Typography>
                <Typography variant="h4" color="error">{annualPlan.summary.highRiskAudits}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Distribution */}
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Risk Distribution</Typography>
              {Object.entries(annualPlan.summary.riskDistribution).map(([risk, count]) => (
                <Box key={risk} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 100 }}>{risk}:</Typography>
                  <Chip 
                    label={count.toString()} 
                    size="small"
                    sx={{ backgroundColor: getRiskColor(risk), color: 'white', ml: 1 }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Quarterly Distribution */}
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Quarterly Distribution</Typography>
              {Object.entries(annualPlan.summary.quarterlyDistribution).map(([quarter, count]) => (
                <Box key={quarter} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 100 }}>{quarter}:</Typography>
                  <Chip 
                    label={count.toString()} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && annualPlan && (
        <Grid container spacing={3}>
          {Object.entries(annualPlan.quarterlyPlan).map(([quarter, audits]) => (
            <Grid size={{ xs: 12, md: 6 }} key={quarter}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {quarter === 'Unassigned' ? 'Unassigned Audits' : `${quarter} ${selectedYear}`}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Audit Name</TableCell>
                        <TableCell>Risk</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Budget</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {audits.map((audit: any) => (
                        <TableRow key={audit.id}>
                          <TableCell>{audit.auditName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={audit.riskLevel || 'Unset'} 
                              size="small"
                              sx={{ backgroundColor: getRiskColor(audit.riskLevel), color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={audit.priority || 'Unset'} 
                              size="small"
                              color={getPriorityColor(audit.priority) as any}
                            />
                          </TableCell>
                          <TableCell>{audit.resourceHours || '-'}</TableCell>
                          <TableCell>${audit.budgetAllocation?.toLocaleString() || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {audits.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography color="textSecondary">No audits scheduled for {quarter}</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 2 && annualPlan && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Risk Analysis</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Risk-based audit planning ensures that high-risk areas receive appropriate audit attention.
              </Alert>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Audit Name</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Risk Score</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Executive Approval</TableCell>
                      <TableCell>Justification</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {annualPlan.audits
                      .filter(audit => audit.riskLevel || audit.riskScore)
                      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
                      .map((audit: any) => (
                        <TableRow key={audit.id}>
                          <TableCell>{audit.auditName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={audit.riskLevel || 'Unset'} 
                              size="small"
                              sx={{ backgroundColor: getRiskColor(audit.riskLevel), color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>{audit.riskScore || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={audit.priority || 'Unset'} 
                              size="small"
                              color={getPriorityColor(audit.priority) as any}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={audit.executiveApproval ? 'Approved' : 'Pending'} 
                              size="small"
                              color={audit.executiveApproval ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            {audit.justification ? (
                              <Typography variant="body2" noWrap title={audit.justification}>
                                {audit.justification}
                              </Typography>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Risk-Based Recommendations</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                High-risk entities from the audit universe that haven't been audited this year.
              </Alert>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Entity</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Risk Rating</TableCell>
                      <TableCell>Recommended Priority</TableCell>
                      <TableCell>Suggested Quarter</TableCell>
                      <TableCell>Estimated Hours</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.map((rec: any, index) => (
                      <TableRow key={index}>
                        <TableCell>{rec.entity.entityName}</TableCell>
                        <TableCell>{rec.entity.entityType}</TableCell>
                        <TableCell>
                          <Chip 
                            label={rec.entity.riskRating} 
                            size="small"
                            sx={{ backgroundColor: getRiskColor(rec.entity.riskRating), color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={rec.recommendedPriority} 
                            size="small"
                            color={getPriorityColor(rec.recommendedPriority) as any}
                          />
                        </TableCell>
                        <TableCell>{rec.suggestedQuarter}</TableCell>
                        <TableCell>{rec.estimatedHours}</TableCell>
                        <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                // Prefill audit creation and navigate to app root.
                                // The Audits page will read this key and open the Create form.
                                const prefill = { auditUniverseId: rec.entity.id, riskLevel: rec.entity.riskRating };
                                try {
                                  localStorage.setItem('createAuditPrefill', JSON.stringify(prefill));
                                } catch (e) {
                                  console.error('Failed to set prefill', e);
                                }
                                window.location.href = '/';
                              }}
                            >
                              Create Audit
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recommendations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary">
                            All high-risk entities have been audited this year.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

    </Box>
  );
};

export default StrategicAuditPlanPage;
