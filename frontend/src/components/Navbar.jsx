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
  Person as PersonIcon, 
  Dashboard as DashboardIcon, 
  AdminPanelSettings as AdminIcon,
  FormatSize as FontSizeIcon
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

  if (!token) return null;

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
        <Box className="flex items-center gap-3 md:gap-6">
          
          {/* Navigation Links */}
          <Box className="hidden md:flex items-center gap-2">
            <Button 
              startIcon={<DashboardIcon />} 
              color={location.pathname === '/dashboard' ? 'primary' : 'inherit'}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
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

          {/* Accessibility Font Size Toggle */}
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

          {/* Multi-lingual Selector for Speech */}
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
              <MenuItem value="ta-IN">Tamil (தமிழ்)</MenuItem>
            </Select>
          </FormControl>

          {/* Profile & Logout (Mobile Icons / Desktop Buttons) */}
          <Box className="flex items-center gap-1">
            <IconButton 
              className="md:hidden" 
              color={location.pathname === '/profile' ? 'primary' : 'inherit'}
              onClick={() => navigate('/profile')}
            >
              <PersonIcon />
            </IconButton>

            {user?.role === 'admin' && (
              <IconButton 
                className="md:hidden" 
                color={location.pathname === '/admin' ? 'primary' : 'inherit'}
                onClick={() => navigate('/admin')}
              >
                <AdminIcon />
              </IconButton>
            )}
            
            <IconButton 
              className="md:hidden" 
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

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
