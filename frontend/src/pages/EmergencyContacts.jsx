import React from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { 
  Emergency as EmergencyIcon,
  ContactPhone as ContactIcon,
  LocationOn as LocationIcon,
  Sms as SmsIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import EmergencyContactsPanel from '../components/EmergencyContactsPanel';

const EmergencyContacts = ({ textScale, ttsLanguage }) => {
  return (
    <Container maxWidth="xl" className="py-6 px-4 md:px-8 space-y-6">
      {/* Page Header */}
      <Box className="bg-darkCard/35 p-6 rounded-2xl border border-white/5">
        <Box className="flex items-start gap-4">
          <Box className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <EmergencyIcon sx={{ fontSize: 40, color: '#ef4444' }} />
          </Box>
          <Box className="flex-1">
            <Typography variant="h4" className="font-extrabold text-white mb-2">
              Emergency SOS & Contacts
            </Typography>
            <Typography variant="body1" className="text-slate-300 leading-relaxed mb-4">
              Manage your emergency contacts and configure SOS alerts. In case of emergency, 
              your location and distress signal will be sent to your trusted contacts via SMS.
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip icon={<ShieldIcon />} label="GPS Tracking" className="bg-red-500/10 text-red-400" size="small" />
              <Chip icon={<SmsIcon />} label="SMS Alerts" className="bg-accentBlue/10 text-accentBlue" size="small" />
              <Chip icon={<LocationIcon />} label="Location Sharing" className="bg-accentGreen/10 text-accentGreen" size="small" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Important Notice */}
      <Alert 
        severity="info" 
        className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue"
        icon={<ShieldIcon />}
      >
        <Typography variant="body2" className="font-semibold">
          How Emergency SOS Works:
        </Typography>
        <Typography variant="body2" className="mt-1">
          1. Add at least one emergency contact with their phone number (include country code, e.g., +91XXXXXXXXXX)<br/>
          2. In the Conversation page, use the Emergency SOS button or show HELP/SOS signs to trigger alerts<br/>
          3. Your current GPS location will be automatically shared via Google Maps link<br/>
          4. SMS will be sent to all selected emergency contacts<br/>
          5. You can also manually send messages to contacts from the chat interface
        </Typography>
      </Alert>

      {/* Features Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-5 border border-white/5 h-full">
            <Box className="text-center space-y-3">
              <Box className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <EmergencyIcon sx={{ fontSize: 40, color: '#ef4444' }} />
              </Box>
              <Typography variant="h6" className="font-bold text-white">
                One-Tap SOS
              </Typography>
              <Typography variant="body2" className="text-slate-300 leading-relaxed">
                Trigger emergency alerts instantly with a single button click. 
                Perfect for urgent situations where every second counts.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-5 border border-white/5 h-full">
            <Box className="text-center space-y-3">
              <Box className="w-16 h-16 rounded-full bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center mx-auto">
                <LocationIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
              </Box>
              <Typography variant="h6" className="font-bold text-white">
                GPS Location
              </Typography>
              <Typography variant="body2" className="text-slate-300 leading-relaxed">
                Automatically captures and shares your exact location via Google Maps. 
                Emergency contacts can navigate directly to your position.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-5 border border-white/5 h-full">
            <Box className="text-center space-y-3">
              <Box className="w-16 h-16 rounded-full bg-accentGreen/10 border border-accentGreen/20 flex items-center justify-center mx-auto">
                <SmsIcon sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
              <Typography variant="h6" className="font-bold text-white">
                SMS Notifications
              </Typography>
              <Typography variant="body2" className="text-slate-300 leading-relaxed">
                Sends SMS alerts to all selected emergency contacts with your location. 
                Works with your phone's default messaging app.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Emergency Contacts Management */}
      <Box className="space-y-4">
        <Box className="flex items-center gap-2">
          <ContactIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
          <Typography variant="h5" className="font-extrabold text-white">
            Manage Emergency Contacts
          </Typography>
        </Box>
        <Typography variant="body2" className="text-slate-400">
          Add, edit, and manage your emergency contacts below. These contacts will receive SOS alerts and location updates.
        </Typography>
        
        <EmergencyContactsPanel
          contacts={[]}
          setContacts={() => {}}
          selectedContactIds={[]}
          setSelectedContactIds={() => {}}
        />
      </Box>

      {/* Usage Instructions */}
      <Paper className="glass-panel p-6 border border-white/5">
        <Typography variant="h6" className="font-bold text-white mb-4 flex items-center gap-2">
          <EmergencyIcon sx={{ color: '#ef4444' }} />
          How to Use Emergency Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="space-y-3">
              <Typography variant="subtitle2" className="text-accentBlue font-bold">
                Method 1: Manual SOS Button
              </Typography>
              <Typography variant="body2" className="text-slate-300 leading-relaxed">
                1. Go to the <strong>Conversation</strong> page<br/>
                2. Scroll to the chat section<br/>
                3. Click the red <strong>"Emergency SOS Alert"</strong> button<br/>
                4. Confirm the action in the dialog<br/>
                5. Your location will be shared with selected contacts
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="space-y-3">
              <Typography variant="subtitle2" className="text-accentGreen font-bold">
                Method 2: Gesture Recognition
              </Typography>
              <Typography variant="body2" className="text-slate-300 leading-relaxed">
                1. Go to <strong>Sign Recognition</strong> or <strong>Conversation</strong> page<br/>
                2. Start your webcam<br/>
                3. Show an open palm for <strong>"HELP"</strong> gesture<br/>
                4. Or show a closed fist for <strong>"SOS"</strong> gesture<br/>
                5. Alert will be logged and notification displayed
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EmergencyContacts;