import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        role
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please make sure the backend is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-darkBg px-4">
      <Card className="w-full max-w-md glass-panel p-2 shadow-2xl">
        <CardContent className="space-y-6">
          <Box className="text-center space-y-2">
            <Typography variant="h4" className="font-extrabold text-white tracking-wide">
              Create Account
            </Typography>
            <Typography variant="body2" className="text-slate-400">
              Sign up to get started with real-time interpretation
            </Typography>
          </Box>

          {error && <Alert severity="error" className="rounded-lg">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Username"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#38bdf8' },
                }
              }}
            />

            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#38bdf8' },
                }
              }}
            />

            <TextField
              label="Password (min 6 characters)"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: '#38bdf8' },
                }
              }}
            />

            <FormControl variant="outlined" fullWidth>
              <InputLabel id="role-label" sx={{ color: '#94a3b8' }}>Account Type</InputLabel>
              <Select
                labelId="role-label"
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Account Type"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                  '.MuiSvgIcon-root': { color: '#94a3b8' }
                }}
              >
                <MenuItem value="user">User (Sign Language Interpreter)</MenuItem>
                <MenuItem value="admin">Administrator (View Stats & Logs)</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                background: 'linear-gradient(to right, #38bdf8, #10b981)',
                color: '#0f172a',
                fontSize: '1rem',
                py: 1.5,
                '&:hover': {
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>

          <Box className="text-center">
            <Typography variant="body2" className="text-slate-400">
              Already have an account?{' '}
              <RouterLink to="/login" className="text-accentBlue hover:underline font-semibold">
                Sign In
              </RouterLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
