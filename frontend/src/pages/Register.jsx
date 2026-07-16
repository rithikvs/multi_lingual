import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { SignLanguage as SignLanguageIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#0284c7' },
    '&.Mui-focused fieldset': { borderColor: '#0284c7' },
  },
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register({ username, email, password, role });
      if (result.success) navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-appBg px-4 py-12">
      <Card sx={{ width: '100%', maxWidth: 440, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box className="text-center mb-6">
            <Box className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 mb-3">
              <SignLanguageIcon sx={{ color: '#0284c7', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Create Account</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Sign up for real-time sign language interpretation
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label="Username" required fullWidth value={username} onChange={(e) => setUsername(e.target.value)} sx={fieldSx} />
            <TextField label="Email Address" type="email" required fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} />
            <TextField label="Password (min 6 characters)" type="password" required fullWidth value={password} onChange={(e) => setPassword(e.target.value)} sx={fieldSx} />
            <FormControl fullWidth sx={fieldSx}>
              <InputLabel>Account Type</InputLabel>
              <Select value={role} label="Account Type" onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="user">User (Sign Language Interpreter)</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, bgcolor: '#0284c7', background: 'linear-gradient(135deg, #0284c7, #059669)', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#64748b' }}>
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>Sign In</RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
