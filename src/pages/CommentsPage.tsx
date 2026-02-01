import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  role: string;
}

const CommentsPage: React.FC = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | ''>('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    if (selectedAuditId) {
      fetchComments(Number(selectedAuditId));
    } else {
      setComments([]);
    }
  }, [selectedAuditId]);

  const fetchAudits = async () => {
    try {
      const data = await api.getAudits();
      setAudits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch audits:', error);
    }
  };

  const fetchComments = async (auditId: number) => {
    setLoading(true);
    try {
      const data = await api.getAuditComments(auditId);
      // Map backend data to frontend Comment interface if needed
      // Backend returns: { id, auditId, author, comment, commentType, createdAt }
      const mappedComments = Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        author: c.author,
        content: c.comment,
        timestamp: new Date(c.createdAt).toLocaleString(),
        role: c.commentType || 'User'
      })) : [];
      setComments(mappedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!selectedAuditId || !commentText.trim()) return;

    setSending(true);
    try {
      // Assuming userId is handled by backend via token or I need to pass it?
      // Backend DTO: { userId, comment, commentType }
      // Frontend doesn't strictly know userId unless from auth context.
      // But api.post sends token, backend extracts user from token?
      // AuditCommentsService.addComment takes userId in DTO.
      // If controller extracts it from @Req(), then good.
      // Controller: @Body() body: Omit<AddCommentDto, 'auditId'>.
      // And: return this.commentsService.addComment({ ...body, auditId });
      // It does NOT seem to extract userId from req.user and override body.userId!
      // Wait, let's check controller again.
      // @Body() body: Omit<AddCommentDto, 'auditId'>
      // So I must send userId.
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 }; // Fallback

      await api.addAuditComment(Number(selectedAuditId), {
        userId: user.id,
        comment: commentText,
        commentType: 'observation'
      });
      
      setCommentText('');
      setSuccess('Comment added successfully');
      fetchComments(Number(selectedAuditId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send comment:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#0F1A2B', fontWeight: 'bold' }}>
        Audit Comments & Observations
      </Typography>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ width: '100%' }}>
          <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>Select Audit</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Audit</InputLabel>
              <Select
                value={selectedAuditId}
                label="Audit"
                onChange={(e) => setSelectedAuditId(Number(e.target.value))}
              >
                <MenuItem value=""><em>Select an Audit</em></MenuItem>
                {audits.map((audit) => (
                  <MenuItem key={audit.id} value={audit.id}>
                    {audit.auditName} ({audit.status})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }} sx={{ width: '100%' }}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : selectedAuditId ? (
                comments.length > 0 ? (
                  <List>
                    {comments.map((comment) => (
                      <Card key={comment.id} sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#0F1A2B' }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {comment.author}
                            </Typography>
                            <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                              {comment.timestamp}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {comment.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="textSecondary">No comments yet. Start the conversation.</Typography>
                  </Box>
                )
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="textSecondary">Please select an audit to view comments.</Typography>
                </Box>
              )}
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Type your response to the auditor..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!selectedAuditId || sending}
                multiline
                maxRows={3}
              />
              <Button
                variant="contained"
                endIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendComment}
                disabled={!selectedAuditId || !commentText.trim() || sending}
                sx={{ bgcolor: '#0F1A2B' }}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommentsPage;
