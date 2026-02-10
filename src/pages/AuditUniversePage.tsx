import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Tab,
  Tabs,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Hub as HubIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

interface AuditUniverseItem {
  id: number;
  entityType: string;
  entityName: string;
  riskRating: string;
  owner?: { name: string };
  createdAt: string;
}

const AuditUniversePage: React.FC = () => {
  const [items, setItems] = useState<AuditUniverseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AuditUniverseItem | null>(null);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    entityType: 'Business Unit',
    entityName: '',
    riskRating: 'Medium',
    ownerId: 1 // Default to current user or admin for now
  });

  const userRole = localStorage.getItem('userRole');
  const isManager = userRole === 'Manager' || userRole === 'Audit Manager';

  const fetchUniverse = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditUniverse();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch audit universe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniverse();
  }, []);

  // Filter Logic
  const filteredItems = items.filter(item => {
    // 1. Filter by Tab (Entity Type)
    let typeMatch = true;
    switch (tabValue) {
      case 0: typeMatch = true; break; // All
      case 1: typeMatch = item.entityType === 'Business Unit'; break;
      case 2: typeMatch = item.entityType === 'Process'; break;
      case 3: typeMatch = item.entityType === 'System' || item.entityType === 'Product'; break; // Grouping Systems/Apps
      case 4: typeMatch = item.entityType === 'Vendor'; break; // Third Parties
      default: typeMatch = true;
    }

    // 2. Filter by Search Query
    const searchMatch = 
      item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.owner?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && searchMatch;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: AuditUniverseItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        entityType: item.entityType,
        entityName: item.entityName,
        riskRating: item.riskRating,
        ownerId: 1
      });
    } else {
      setEditingItem(null);
      setFormData({
        entityType: 'Business Unit',
        entityName: '',
        riskRating: 'Medium',
        ownerId: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await api.updateAuditUniverse(editingItem.id, formData);
      } else {
        await api.createAuditUniverse(formData);
      }
      handleCloseDialog();
      fetchUniverse();
    } catch (error) {
      console.error('Failed to save audit universe item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteAuditUniverse(id);
        fetchUniverse();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'entityName', headerName: 'Entity Name', flex: 1 },
    { field: 'entityType', headerName: 'Type', width: 150 },
    { 
      field: 'riskRating', 
      headerName: 'Risk Rating', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getRiskColor(params.value as string) as any} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'owner', 
      headerName: 'Owner', 
      width: 150,
      valueGetter: (value, row) => row.owner?.name || 'N/A'
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HubIcon fontSize="large" /> Audit Universe
        </Typography>
        {!isManager && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Entity
          </Button>
        )}
      </Box>

      {/* Tabs and Search Bar */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="audit universe tabs">
            <Tab label="All Entities" />
            <Tab label="Business Units" />
            <Tab label="Processes" />
            <Tab label="Systems & Apps" />
            <Tab label="Vendors" />
          </Tabs>
        </Box>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search entities by name, type, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>
      </Card>

      <Card elevation={2}>
        <CardContent sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredItems}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            onRowClick={(params) => handleOpenDialog(params.row as AuditUniverseItem)}
            sx={{ cursor: 'pointer' }}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Entity' : 'Add New Entity'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 } as any}>
              <TextField
                fullWidth
                label="Entity Name"
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 6 } as any}>
              <TextField
                fullWidth
                select
                label="Entity Type"
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
              >
                <MenuItem value="Business Unit">Business Unit</MenuItem>
                <MenuItem value="Process">Process</MenuItem>
                <MenuItem value="System">System</MenuItem>
                <MenuItem value="Vendor">Vendor</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 } as any}>
              <TextField
                fullWidth
                select
                label="Risk Rating"
                value={formData.riskRating}
                onChange={(e) => setFormData({ ...formData, riskRating: e.target.value })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
            </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditUniversePage;
