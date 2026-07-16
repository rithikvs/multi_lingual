import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { 
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as SignUpIcon,
  Person as PersonIcon, 
  Dashboard as DashboardIcon, 
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  FormatSize as FontSizeIcon,
  RecordVoiceOver as HearingIcon,
  Handshake as SignLanguageIcon
} from '@mui/icons-material';

const Navbar = ({ textScale, setTextScale, ttsLanguage, setTtsLanguage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Cycle through font sizes: sm -> base -> lg -> xl -> 2xl
  const handleFontSizeCycle = () => {
    const scales = ['sm', 'base', 'lg', 'xl', '2xl'];
    const nextIdx = (scales.indexOf(textScale) + 1) % scales.length;
    setTextScale(scales[nextIdx]);
  };

  return (
    <AppBar position="static" sx={{ background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Toolbar className="flex justify-between items-center py-2 px-4 md:px-8">
        
        {/* App Title */}
        <Box className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Typography variant="h6" className="font-bold text-white flex items-center gap-2 tracking-wide">
            <span className="bg-gradient-to-r from-accentBlue to-accentGreen bg-clip-text text-transparent">
              Sign Interpreter
            </span>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-extrabold animate-pulse">
              SOS
            </span>
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box className="flex items-center gap-3 md:gap-6 flex-wrap">
          
          {/* Navigation Links - Only show when logged in */}
          {token && (
            <Box className="hidden md:flex items-center gap-2">
            <Button 
              startIcon={<DashboardIcon />} 
              color={location.pathname === '/dashboard' ? 'primary' : 'inherit'}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              startIcon={<SignLanguageIcon />} 
              color={location.pathname === '/sign' ? 'primary' : 'inherit'}
              onClick={() => navigate('/sign')}
            >
              Sign Detector
            </Button>
            <Button 
              startIcon={<HearingIcon />} 
              color={location.pathname === '/speech' ? 'primary' : 'inherit'}
              onClick={() => navigate('/speech')}
            >
              Speech
            </Button>
            <Button 
              startIcon={<SettingsIcon />} 
              color={location.pathname === '/settings' ? 'primary' : 'inherit'}
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
            
            {user?.role === 'admin' && (
              <Button 
                startIcon={<AdminIcon />} 
                color={location.pathname === '/admin' ? 'primary' : 'inherit'}
                onClick={() => navigate('/admin')}
              >
                Admin Panel
              </Button>
            )}

            <Button 
              startIcon={<PersonIcon />} 
              color={location.pathname === '/profile' ? 'primary' : 'inherit'}
              onClick={() => navigate('/profile')}
            >
              Profile
            </Button>
          </Box>
          )}

          {/* Accessibility Font Size Toggle - Only show when logged in */}
          {token && (
            <Tooltip title="Cycle Text Size (Accessibility)">
              <Button
                variant="outlined"
                size="small"
                onClick={handleFontSizeCycle}
                startIcon={<FontSizeIcon />}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                A{textScale === 'sm' ? '-' : textScale === 'base' ? '' : textScale === 'lg' ? '+' : textScale === 'xl' ? '++' : '+++'}
              </Button>
            </Tooltip>
          )}

          {/* Multi-lingual Selector for Speech - Only show when logged in */}
          {token && (
            <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="tts-lang-label" sx={{ color: '#94a3b8' }}>Voice Lang</InputLabel>
              <Select
                labelId="tts-lang-label"
                id="tts-lang-select"
                value={ttsLanguage}
                onChange={(e) => setTtsLanguage(e.target.value)}
                label="Voice Lang"
                sx={{ 
                  color: 'white', 
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                  '.MuiSvgIcon-root': { color: '#94a3b8' }
                }}
              >
                <MenuItem value="en-US">English</MenuItem>
                <MenuItem value="hi-IN">Hindi (हिंदी)</MenuItem>
                <MenuItem value="ta-IN">Tamil (தமிழ्)</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* LOGIN / LOGOUT BUTTONS */}
          {token ? (
            // When logged in - show Profile and Sign Out
            <Box className="flex items-center gap-2">
              {/* Desktop buttons */}
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => navigate('/profile')}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                My Profile
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                  },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                Sign Out
              </Button>
              
              {/* Mobile icons */}
              <Box className="md:hidden flex items-center gap-1">
                <IconButton 
                  color={location.pathname === '/profile' ? 'primary' : 'inherit'}
                  onClick={() => navigate('/profile')}
                >
                  <PersonIcon />
                </IconButton>

                {user?.role === 'admin' && (
                  <IconButton 
                    color={location.pathname === '/admin' ? 'primary' : 'inherit'}
                    onClick={() => navigate('/admin')}
                  >
                    <AdminIcon />
                  </IconButton>
                )}
                
                <IconButton 
                  color="inherit" 
                  onClick={() => navigate('/dashboard')}
                >
                  <DashboardIcon />
                </IconButton>

                <Tooltip title="Sign Out">
                  <IconButton color="error" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            // When NOT logged in - show Sign Up and Sign In
            <Box className="flex items-center gap-2">
              {/* Desktop buttons */}
              <Button 
                variant="outlined"
                startIcon={<SignUpIcon />}
                onClick={() => navigate('/register')}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.1)'
                  },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                Sign Up
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(56,189,248,0.5)'
                  },
                  display: { xs: 'none', md: 'inline-flex' }
                }}
              >
                Sign In
              </Button>

              {/* Mobile buttons */}
              <Button 
                variant="outlined"
                startIcon={<SignUpIcon />}
                size="small"
                onClick={() => navigate('/register')}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.2)',
                  display: { xs: 'inline-flex', md: 'none' }
                }}
              >
                Sign Up
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<LoginIcon />}
                size="small"
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' }
                }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
