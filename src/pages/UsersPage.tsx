/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  userRoles?: { role: { id: number; roleName: string } }[];
  auditUniverseEntities?: { id: number; entityName: string; entityType: string }[];
}

interface Role {
  id: number;
  roleName: string;
}

interface AuditUniverseEntity {
  id: number;
  entityName: string;
  entityType: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditUniverseEntities, setAuditUniverseEntities] = useState<AuditUniverseEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');
  const [selectedAuditUniverseEntities, setSelectedAuditUniverseEntities] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, auditUniverseData] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        api.getAuditUniverse()
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setAuditUniverseEntities(Array.isArray(auditUniverseData) ? auditUniverseData : []);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load users or roles.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      setPassword(''); // Don't populate password on edit
      // Attempt to pre-select first role if exists
      const roleId = user.userRoles && user.userRoles.length > 0 ? user.userRoles[0].role.id : '';
      setSelectedRoleId(roleId);
      // Pre-select audit universe entities
      const entityIds = user.auditUniverseEntities?.map(entity => entity.id) || [];
      setSelectedAuditUniverseEntities(entityIds);
    } else {
      setCurrentUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedRoleId('');
      setSelectedAuditUniverseEntities([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const userData: any = { 
        name, 
        email,
        auditUniverseEntityIds: selectedAuditUniverseEntities 
      };
      if (password) userData.password = password;

      if (currentUser) {
        // Update
        await api.updateUser(currentUser.id, userData);
        
        // Handle Role Update (Simple implementation: remove old, add new if changed)
        // Note: A robust backend would handle this in updateUser, but we can chain calls if needed.
        const currentRoleId = currentUser.userRoles?.[0]?.role.id;
        if (selectedRoleId && selectedRoleId !== currentRoleId) {
            if (currentRoleId) await api.removeRoleFromUser(currentUser.id, currentRoleId);
            await api.assignRoleToUser(currentUser.id, Number(selectedRoleId));
        }
      } else {
        // Create
        if (!password) {
          setError('Password is required for new users.');
          return;
        }
        userData.password = password;
        // Pass roleId if backend supports it directly, otherwise create then assign
        const newUser = await api.createUser(userData);
        if (selectedRoleId && newUser && newUser.id) {
            await api.assignRoleToUser(newUser.id, Number(selectedRoleId));
        }
      }
      fetchData();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Save failed', err);
      setError('Failed to save user. ' + (err.message || ''));
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the user "${userName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete user!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteUser(id);
        await Swal.fire({
          title: 'Deleted!',
          text: `User "${userName}" has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } catch (err) {
        console.error('Delete failed', err);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to delete user. Please try again.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { 
      field: 'role', 
      headerName: 'Role', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => {
        const roles = params.row.userRoles?.map((ur: any) => ur.role.roleName).join(', ');
        return roles ? <Chip label={roles} size="small" /> : '-';
      }
    },
    { 
      field: 'auditUniverse', 
      headerName: 'Audit Universe Entities', 
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => {
        const entities = params.row.auditUniverseEntities?.map((entity: any) => 
          `${entity.entityName} (${entity.entityType})`
        ).join(', ');
        return entities ? <Chip label={entities} size="small" variant="outlined" /> : '-';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id, params.row.name)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#0F1A2B">
          User Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#0F1A2B' }}>
          Add User
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label={currentUser ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.roleName}
              </MenuItem>
            ))}
          </TextField>
          <FormControl fullWidth margin="dense">
            <InputLabel>Audit Universe Entities</InputLabel>
            <Select
              multiple
              value={selectedAuditUniverseEntities}
              onChange={(e) => setSelectedAuditUniverseEntities(e.target.value as number[])}
              renderValue={(selected) => {
                const selectedEntities = auditUniverseEntities.filter(entity => 
                  selectedAuditUniverseEntities.includes(entity.id)
                );
                return selectedEntities.map(entity => entity.entityName).join(', ');
              }}
            >
              {auditUniverseEntities.map((entity) => (
                <MenuItem key={entity.id} value={entity.id}>
                  {entity.entityName} ({entity.entityType})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#0F1A2B' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;