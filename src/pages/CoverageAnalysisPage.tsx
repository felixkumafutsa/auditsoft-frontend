import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

interface FrameworkStats {
  id: number;
  frameworkName: string;
  version: string;
  totalMappings: number;
  covered: number;
  partial: number;
  notCovered: number;
  coverageScore: number;
}

const CoverageAnalysisPage: React.FC = () => {
  const [stats, setStats] = useState<FrameworkStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await api.getCoverageStats();
        setStats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch coverage stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#2e7d32', '#ed6c02', '#d32f2f']; // Covered, Partial, Not Covered

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Coverage Analysis
      </Typography>

      <Grid container spacing={3}>
        {stats.map((fw) => (
          <Grid key={fw.id} size={{ xs: 12, sm: 6, md: 4 } as any}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {fw.frameworkName} <Typography component="span" variant="caption" color="textSecondary">({fw.version})</Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: fw.coverageScore >= 80 ? 'success.main' : fw.coverageScore >= 50 ? 'warning.main' : 'error.main' }}>
                    {fw.coverageScore}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Overall Coverage Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={fw.coverageScore} 
                  color={fw.coverageScore >= 80 ? 'success' : fw.coverageScore >= 50 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 5, mb: 2 }}
                />
                <Box display="flex" justifyContent="space-between" fontSize="0.875rem">
                  <span style={{ color: '#2e7d32' }}>Covered: {fw.covered}</span>
                  <span style={{ color: '#ed6c02' }}>Partial: {fw.partial}</span>
                  <span style={{ color: '#d32f2f' }}>Missing: {fw.notCovered}</span>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Charts Section */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Coverage Distribution by Framework
            </Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="frameworkName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="covered" stackId="a" fill="#2e7d32" name="Covered" />
                  <Bar dataKey="partial" stackId="a" fill="#ed6c02" name="Partial" />
                  <Bar dataKey="notCovered" stackId="a" fill="#d32f2f" name="Not Covered" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Total Mappings Overview
            </Typography>
            <Box height={300} display="flex" justifyContent="center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                       <Pie
                          data={[
                             { name: 'Covered', value: stats.reduce((acc, curr) => acc + curr.covered, 0) },
                             { name: 'Partial', value: stats.reduce((acc, curr) => acc + curr.partial, 0) },
                             { name: 'Not Covered', value: stats.reduce((acc, curr) => acc + curr.notCovered, 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                       >
                          {['#2e7d32', '#ed6c02', '#d32f2f'].map((color, index) => (
                             <Cell key={`cell-${index}`} fill={color} />
                          ))}
                       </Pie>
                       <Tooltip />
                       <Legend />
                    </PieChart>
                 </ResponsiveContainer>
              </Box>
           </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CoverageAnalysisPage;
