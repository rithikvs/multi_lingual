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
import './App.css';

const textScales = ['sm', 'base', 'lg', 'xl', '2xl'];

function AppContent() {
  const [textScale, setTextScale] = useState('base');
  const [ttsLanguage, setTtsLanguage] = useState('en-US');
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const textScaleLabel = useMemo(() => {
    const labels = {
      sm: 'Small',
      base: 'Normal',
      lg: 'Large',
      xl: 'XL',
      '2xl': '2XL'
    };
    return labels[textScale];
  }, [textScale]);

  const cycleTextScale = () => {
    const currentIndex = textScales.indexOf(textScale);
    const nextIndex = (currentIndex + 1) % textScales.length;
    setTextScale(textScales[nextIndex]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Box className="min-h-screen bg-darkBg text-slate-100">
      {!isAuthPage && (
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(15, 23, 42, 0.92)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            backdropFilter: 'blur(14px)'
          }}
        >
          <Toolbar className="flex flex-wrap gap-4 justify-between px-4 md:px-8 py-3">
            <Box className="flex items-center gap-3">
              <Box className="h-11 w-11 rounded-xl bg-sky-400/10 border border-sky-300/20 flex items-center justify-center">
                <SignLanguageIcon sx={{ color: '#38bdf8' }} />
              </Box>
              <Box>
                <Typography variant="h6" className="font-extrabold tracking-wide text-white">
                  Multi-Lingual Sign Interpreter
                </Typography>
                <Typography variant="caption" className="text-slate-400">
                  Webcam signs, speech conversion, chat, and emergency SOS
                </Typography>
              </Box>
            </Box>

            <Box className="flex flex-wrap items-center gap-3">
              <Chip
                icon={<HearingIcon />}
                label={token ? 'Atlas Connected' : 'Login Required'}
                variant="outlined"
                sx={{ color: '#dbeafe', borderColor: 'rgba(56,189,248,0.35)' }}
              />
              <Chip
                icon={<WarningIcon />}
                label="SOS Ready"
                color="error"
                variant="outlined"
              />
              <Button
                variant="outlined"
                startIcon={<FontSizeIcon />}
                onClick={cycleTextScale}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Text: {textScaleLabel}
              </Button>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="voice-language-label" sx={{ color: '#94a3b8' }}>
                  Voice
                </InputLabel>
                <Select
                  labelId="voice-language-label"
                  value={ttsLanguage}
                  label="Voice"
                  onChange={(event) => setTtsLanguage(event.target.value)}
                  sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.22)' },
                    '.MuiSvgIcon-root': { color: '#94a3b8' }
                  }}
                >
                  <MenuItem value="en-US">English</MenuItem>
                  <MenuItem value="hi-IN">Hindi</MenuItem>
                  <MenuItem value="ta-IN">Tamil</MenuItem>
                </Select>
              </FormControl>
              {token ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    Profile
                  </Button>
                  <Button variant="contained" color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {!isAuthPage && (
        <Container maxWidth="xl" className="pt-6">
          <Box className="rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            {token
              ? 'Signed in. Emergency contacts and message history are saved in MongoDB Atlas.'
              : 'Please log in to save emergency contacts and send phone-SIM SMS with MongoDB history.'}
          </Box>
        </Container>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard textScale={textScale} ttsLanguage={ttsLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sign-recognition"
          element={
            <ProtectedRoute>
              <SignRecognition textScale={textScale} ttsLanguage={ttsLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/speech-transcription"
          element={
            <ProtectedRoute>
              <SpeechTranscription textScale={textScale} ttsLanguage={ttsLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation"
          element={
            <ProtectedRoute>
              <Conversation textScale={textScale} ttsLanguage={ttsLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency-contacts"
          element={
            <ProtectedRoute>
              <EmergencyContacts textScale={textScale} ttsLanguage={ttsLanguage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile textScale={textScale} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
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
