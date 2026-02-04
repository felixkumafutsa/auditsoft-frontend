import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  Badge,
  CircularProgress,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../services/api';
import io, { Socket } from 'socket.io-client';
import NewConversationModal from '../components/NewConversationModal';

interface Contact {
  id: number;
  name: string;
  email: string;
  role: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
}

const MessagingPage: React.FC = () => {
  const [conversations, setConversations] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const socketRef = useRef<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await api.getProfile();
        setCurrentUserId(user.id);
      } catch (e) {
        showSnackbar('Failed to get user profile', 'error');
      }
    };
    fetchUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const socket = io('http://localhost:4000', {
        query: { userId: currentUserId },
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      socket.on(`recMessage_${currentUserId}`, (message: Message) => {
        if (selectedContact && (message.senderId === selectedContact.id || message.receiverId === selectedContact.id)) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [currentUserId, selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar('Failed to fetch conversations', 'error');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (contactId: number, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const data = await api.getMessages(contactId);
      setMessages(Array.isArray(data) ? data : []);
      
      await api.markMessagesAsRead(contactId);
      setConversations(prev => prev.map(c => 
        c.id === contactId ? { ...c, unreadCount: 0 } : c
      ));

    } catch (error) {
      showSnackbar('Failed to fetch messages', 'error');
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    fetchMessages(contact.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      receiverId: selectedContact.id,
      content: newMessage,
    });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteConversation = async () => {
    if (selectedContact) {
      try {
        await api.deleteConversation(selectedContact.id);
        setSelectedContact(null);
        setMessages([]);
        fetchConversations();
        showSnackbar('Conversation deleted successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to delete conversation', 'error');
      }
    }
    handleMenuClose();
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', gap: 2 }}>
      {/* Sidebar: Conversations List */}
      <Paper elevation={3} sx={{ width: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Messages
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{ textTransform: 'none' }}
            >
              New
            </Button>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {loadingConversations ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((contact) => (
              <React.Fragment key={contact.id}>
                <ListItem disablePadding component="li">
                  <ListItemButton
                    selected={selectedContact?.id === contact.id}
                    onClick={() => handleSelectContact(contact)}
                    alignItems="flex-start"
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedContact?.id === contact.id ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge color="error" badgeContent={contact.unreadCount} invisible={contact.unreadCount === 0}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                          {contact.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {contact.name}
                          </Typography>
                          {contact.lastMessageTime && (
                            <Typography variant="caption" color="textSecondary">
                              {new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {contact.lastMessage}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          ) : (
            <Box p={3} textAlign="center">
              <Typography color="textSecondary">No conversations yet</Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Paper elevation={3} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>{selectedContact.name.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedContact.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedContact.role}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleDeleteConversation}>Delete Conversation</MenuItem>
              </Menu>
            </Box>

            {/* Messages List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f8f9fa' }}>
              {loadingMessages ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <Box 
                      key={msg.id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box 
                        sx={{ 
                          maxWidth: '70%', 
                          bgcolor: isMe ? '#1976d2' : '#fff',
                          color: isMe ? '#fff' : '#000',
                          borderRadius: 2,
                          p: 2,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="body1">{msg.content}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8, textAlign: 'right', fontSize: '0.7rem' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" color="text.secondary">
                  <ChatIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                  <Typography>Start a conversation with {selectedContact.name}</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fff' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  multiline
                  maxRows={3}
                />
                <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" color="text.secondary">
            <ChatIcon sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
            <Typography variant="h6">Select a conversation to start chatting</Typography>
          </Box>
        )}
      </Paper>
      <NewConversationModal open={isModalOpen} onClose={handleCloseModal} onSelectContact={handleSelectContact} />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagingPage;