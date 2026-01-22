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
  Chip
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  userRoles?: { role: { id: number; roleName: string } }[];
}

interface Role {
  id: number;
  roleName: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        api.getUsers(),
        api.getRoles()
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
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
      // Attempt to pre-select the first role if exists
      const roleId = user.userRoles && user.userRoles.length > 0 ? user.userRoles[0].role.id : '';
      setSelectedRoleId(roleId);
    } else {
      setCurrentUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedRoleId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const userData: any = { name, email };
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        fetchData();
      } catch (err) {
        console.error('Delete failed', err);
        alert('Failed to delete user.');
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
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
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