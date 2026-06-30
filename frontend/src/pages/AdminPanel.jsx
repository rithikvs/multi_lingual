import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import { 
  Group as UsersIcon, 
  History as LogsIcon, 
  ContactPhone as ContactsIcon, 
  TrendingUp as AccuracyIcon,
  Warning as AlertIcon,
  Language as LangIcon
} from '@mui/icons-material';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      // 1. Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // 2. Fetch users
      const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      // 3. Fetch logs
      const logsRes = await axios.get('http://localhost:5000/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logsRes.data.success) {
        setLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Access Denied or Server Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their records? This is irreversible.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData(); // Refresh all stats
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-darkBg flex items-center justify-center">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <Alert severity="error" className="rounded-xl">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8 px-4 md:px-8 space-y-8">
      
      {/* Header Banner */}
      <Box className="bg-darkCard/35 p-5 rounded-2xl border border-white/5">
        <Typography variant="h4" className="font-extrabold text-white">
          System Administration Deck
        </Typography>
        <Typography variant="body2" className="text-slate-400">
          Monitor system stats, track database logs, and oversee user profiles.
        </Typography>
      </Box>

      {/* Aggregate metrics grid */}
      <Grid container spacing={3}>
        
        {/* Metric 1 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card p-2 text-center">
            <CardContent className="space-y-2">
              <UsersIcon color="primary" fontSize="large" />
              <Typography variant="h4" className="font-black text-white">{stats?.totalUsers}</Typography>
              <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-wider text-xs font-bold">Total Accounts</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card p-2 text-center">
            <CardContent className="space-y-2">
              <LogsIcon color="secondary" fontSize="large" />
              <Typography variant="h4" className="font-black text-white">{stats?.totalLogs}</Typography>
              <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-wider text-xs font-bold">Inferences Logged</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card p-2 text-center">
            <CardContent className="space-y-2">
              <AccuracyIcon color="primary" fontSize="large" sx={{ color: '#a855f7' }} />
              <Typography variant="h4" className="font-black text-white">
                {stats?.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(1)}%` : '0%'}
              </Typography>
              <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-wider text-xs font-bold">Avg AI Confidence</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 4 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card p-2 text-center">
            <CardContent className="space-y-2">
              <AlertIcon color="error" fontSize="large" />
              <Typography variant="h4" className="font-black text-white">{stats?.totalSOSAlerts}</Typography>
              <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-wider text-xs font-bold">SOS dispatches</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Model accuracy split */}
      <Card className="glass-panel p-4">
        <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-wider text-xs font-bold mb-3">
          Sign Language System Log Distributions
        </Typography>
        <Box className="flex gap-4">
          <ChipWrapper label={`Indian Sign Language (ISL): ${stats?.signLanguageBreakdown?.ISL || 0} counts`} color="primary" />
          <ChipWrapper label={`American Sign Language (ASL): ${stats?.signLanguageBreakdown?.ASL || 0} counts`} color="secondary" />
        </Box>
      </Card>

      {/* Tables Grid Layout */}
      <Grid container spacing={4}>
        
        {/* User Account controls */}
        <Grid item xs={12} lg={5}>
          <Card className="glass-panel p-2 shadow-xl h-full">
            <CardContent className="space-y-4">
              <Typography variant="h6" className="font-bold text-white flex items-center gap-2">
                <UsersIcon color="primary" /> User Database
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ 'th': { borderColor: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 'bold' } }}>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((row) => (
                      <TableRow key={row._id} sx={{ 'td': { borderColor: 'rgba(255,255,255,0.04)', color: 'white' } }}>
                        <TableCell className="font-medium">
                          {row.username}
                          <Typography variant="caption" className="block text-slate-500">{row.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            row.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {row.role.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteUser(row._id)}
                            disabled={row.role === 'admin'}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Global recognition logs tracking */}
        <Grid item xs={12} lg={7}>
          <Card className="glass-panel p-2 shadow-xl h-full">
            <CardContent className="space-y-4">
              <Typography variant="h6" className="font-bold text-white flex items-center gap-2">
                <LogsIcon color="secondary" /> Global Recognition Logs
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none', maxHeight: '400px', overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 'th': { bgcolor: '#1e293b', borderColor: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 'bold' } }}>
                      <TableCell>User</TableCell>
                      <TableCell>Sign</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell align="right">Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: '#94a3b8', fontStyle: 'italic', py: 4 }}>
                          No recognition metrics registered yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((row) => (
                        <TableRow key={row._id} sx={{ 'td': { borderColor: 'rgba(255,255,255,0.04)', color: 'white' } }}>
                          <TableCell className="font-medium">{row.userId?.username || 'Deleted User'}</TableCell>
                          <TableCell className="font-black text-accentBlue text-lg">{row.signRecognized}</TableCell>
                          <TableCell>
                            <span className={`font-bold ${row.confidence > 0.8 ? 'text-accentGreen' : 'text-amber-500'}`}>
                              {(row.confidence * 100).toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-400 font-mono">{row.signLanguageType}</span>
                          </TableCell>
                          <TableCell align="right" className="text-slate-500">
                            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
      
    </Container>
  );
};

// Local UI Helper
const ChipWrapper = ({ label, color }) => (
  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
    color === 'primary' ? 'bg-accentBlue/10 text-accentBlue border border-accentBlue/20' : 'bg-accentGreen/10 text-accentGreen border border-accentGreen/20'
  }`}>
    {label}
  </span>
);

export default AdminPanel;
