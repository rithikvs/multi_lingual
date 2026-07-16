import React, { useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from '@mui/material';
import {
  FormatSize as FontSizeIcon,
  Hearing as HearingIcon,
  SignLanguage as SignLanguageIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  ContactPhone as ContactIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import SignRecognition from './pages/SignRecognition';
import SpeechTranscription from './pages/SpeechTranscription';
import Conversation from './pages/Conversation';
import EmergencyContacts from './pages/EmergencyContacts';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

const textScales = ['sm', 'base', 'lg', 'xl', '2xl'];

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Sign Recognition', path: '/sign-recognition', icon: <SignLanguageIcon fontSize="small" /> },
  { label: 'Speech', path: '/speech-transcription', icon: <HearingIcon fontSize="small" /> },
  { label: 'Conversation', path: '/conversation', icon: <ChatIcon fontSize="small" /> },
  { label: 'Contacts', path: '/emergency-contacts', icon: <ContactIcon fontSize="small" /> },
];

function AppContent() {
  const [textScale, setTextScale] = useState('base');
  const [ttsLanguage, setTtsLanguage] = useState('en-US');
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLanding = location.pathname === '/';

  const textScaleLabel = useMemo(() => {
    const labels = { sm: 'Small', base: 'Normal', lg: 'Large', xl: 'XL', '2xl': '2XL' };
    return labels[textScale];
  }, [textScale]);

  const cycleTextScale = () => {
    const currentIndex = textScales.indexOf(textScale);
    setTextScale(textScales[(currentIndex + 1) % textScales.length]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box className="min-h-screen bg-appBg text-slate-900">
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a',
        }}
      >
        <Toolbar className="flex flex-wrap gap-3 justify-between px-4 md:px-8 py-2">
          <Box className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(token ? '/dashboard' : '/')}>
            <Box className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              <SignLanguageIcon sx={{ color: '#0284c7' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Sign Interpreter
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Signs · Speech · Chat · Emergency SOS
              </Typography>
            </Box>
          </Box>

          {token && !isAuthPage && (
            <Box className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  size="small"
                  startIcon={link.icon}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: location.pathname === link.path ? '#0284c7' : '#475569',
                    bgcolor: location.pathname === link.path ? '#f0f9ff' : 'transparent',
                    fontWeight: location.pathname === link.path ? 700 : 500,
                    '&:hover': { bgcolor: '#f0f9ff', color: '#0284c7' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          <Box className="flex flex-wrap items-center gap-2">
            <Chip
              icon={<HearingIcon />}
              label={token ? 'Connected' : 'Login Required'}
              size="small"
              variant="outlined"
              sx={{ color: '#0369a1', borderColor: '#bae6fd', bgcolor: '#f0f9ff' }}
            />
            {token && (
              <Chip
                icon={<WarningIcon />}
                label="SOS Ready"
                size="small"
                sx={{ color: '#b91c1c', borderColor: '#fecaca', bgcolor: '#fef2f2' }}
                variant="outlined"
              />
            )}
            {!isAuthPage && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FontSizeIcon />}
                  onClick={cycleTextScale}
                  sx={{ color: '#475569', borderColor: '#e2e8f0' }}
                >
                  Text: {textScaleLabel}
                </Button>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="voice-language-label">Voice</InputLabel>
                  <Select
                    labelId="voice-language-label"
                    value={ttsLanguage}
                    label="Voice"
                    onChange={(event) => setTtsLanguage(event.target.value)}
                  >
                    <MenuItem value="en-US">English</MenuItem>
                    <MenuItem value="hi-IN">Hindi</MenuItem>
                    <MenuItem value="ta-IN">Tamil</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {token ? (
              <>
                <Button variant="outlined" size="small" onClick={() => navigate('/profile')} sx={{ borderColor: '#e2e8f0', color: '#475569' }}>
                  Profile
                </Button>
                <Button variant="contained" color="error" size="small" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" size="small" onClick={() => navigate('/register')} sx={{ borderColor: '#e2e8f0', color: '#475569' }}>
                  Sign Up
                </Button>
                <Button variant="contained" size="small" onClick={() => navigate('/login')} sx={{ bgcolor: '#0284c7' }}>
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {!isAuthPage && !isLanding && (
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: token ? '#bbf7d0' : '#fde68a',
              bgcolor: token ? '#f0fdf4' : '#fffbeb',
              px: 2,
              py: 1.5,
              fontSize: '0.875rem',
              color: token ? '#166534' : '#92400e',
            }}
          >
            {token
              ? 'Signed in. Emergency contacts and message history are saved securely.'
              : 'Please sign in to save emergency contacts and send SMS with message history.'}
          </Box>
        </Container>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard textScale={textScale} ttsLanguage={ttsLanguage} /></ProtectedRoute>} />
        <Route path="/sign-recognition" element={<ProtectedRoute><SignRecognition textScale={textScale} ttsLanguage={ttsLanguage} /></ProtectedRoute>} />
        <Route path="/speech-transcription" element={<ProtectedRoute><SpeechTranscription textScale={textScale} ttsLanguage={ttsLanguage} /></ProtectedRoute>} />
        <Route path="/conversation" element={<ProtectedRoute><Conversation textScale={textScale} ttsLanguage={ttsLanguage} /></ProtectedRoute>} />
        <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts textScale={textScale} ttsLanguage={ttsLanguage} /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile textScale={textScale} /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
