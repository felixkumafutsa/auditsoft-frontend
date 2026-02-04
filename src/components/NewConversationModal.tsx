import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectContact: (user: User) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '80vh',
};

const NewConversationModal: React.FC<Props> = ({ open, onClose, onSelectContact }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const data = await api.getUsers();
          setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Failed to fetch users', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]);

  const handleSelectUser = (user: User) => {
    onSelectContact(user);
    onClose();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Start a New Conversation
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search for a user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ overflowY: 'auto' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {filteredUsers.map(user => (
                <ListItem key={user.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectUser(user)}>
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.name} secondary={user.email} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default NewConversationModal;
