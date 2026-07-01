import React, { useState } from 'react';
import { Box, Typography, Divider, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import { getCurrentLocation } from '../utils/location';

const SettingsPage = ({ textScale, setTextScale, ttsLanguage, setTtsLanguage }) => {
  // Theme toggle (dark mode only for now)
  const [darkMode, setDarkMode] = useState(true);

  // Location test state
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  const handleLocationTest = async () => {
    setLocLoading(true);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      console.error('Location error', err);
      setLocation({ error: err.message });
    } finally {
      setLocLoading(false);
    }
  };

  const handleTextScaleChange = (e) => {
    setTextScale(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setTtsLanguage(e.target.value);
  };

  return (
    <Box className="p-6 glass">
      <Typography variant="h4" className="font-bold mb-4 text-white">
        Settings
      </Typography>
      <Divider className="my-4 border-slate-500/30" />
      {/* Dark mode toggle */}
      <FormControlLabel
        control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="primary" />}
        label={<Typography className="text-white">Dark Mode</Typography>}
        className="mb-4"
      />
      {/* Text size selector */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mb: 4 }}>
        <InputLabel id="text-scale-label" sx={{ color: '#94a3b8' }}>Text Size</InputLabel>
        <Select
          labelId="text-scale-label"
          value={textScale}
          onChange={handleTextScaleChange}
          label="Text Size"
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
            '.MuiSvgIcon-root': { color: '#94a3b8' }
          }}
        >
          <MenuItem value="sm">Small</MenuItem>
          <MenuItem value="base">Normal</MenuItem>
          <MenuItem value="lg">Large</MenuItem>
          <MenuItem value="xl">XL</MenuItem>
          <MenuItem value="2xl">2XL</MenuItem>
        </Select>
      </FormControl>
      {/* Voice language selector */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mb: 4, ml: 4 }}>
        <InputLabel id="voice-lang-label" sx={{ color: '#94a3b8' }}>Voice Language</InputLabel>
        <Select
          labelId="voice-lang-label"
          value={ttsLanguage}
          onChange={handleLanguageChange}
          label="Voice Language"
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
      {/* Geolocation test */}
      <Box className="mt-6">
        <Button variant="contained" color="secondary" onClick={handleLocationTest} disabled={locLoading}>
          {locLoading ? <CircularProgress size={20} /> : 'Test Geolocation'}
        </Button>
        {location && (
          <Typography variant="body2" className="mt-2 text-slate-300">
            {location.error ? `Error: ${location.error}` : `Lat: ${location.latitude}, Lon: ${location.longitude}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SettingsPage;
