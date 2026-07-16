import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Grid, Card, CardContent, Chip } from '@mui/material';
import {
  SignLanguage as SignIcon,
  Hearing as HearingIcon,
  Chat as ChatIcon,
  Emergency as EmergencyIcon,
  ArrowForward as ArrowIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const primaryBtn = {
  background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
  color: '#ffffff',
  fontWeight: 700,
  px: 4,
  py: 1.5,
  '&:hover': { background: 'linear-gradient(135deg, #0369a1 0%, #047857 100%)', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(2,132,199,0.25)' },
  transition: 'all 0.2s ease',
};

const outlineBtn = {
  color: '#475569',
  borderColor: '#cbd5e1',
  px: 4,
  py: 1.5,
  '&:hover': { borderColor: '#0284c7', color: '#0284c7', bgcolor: '#f0f9ff' },
};

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated: token } = useAuth();

  const features = [
    { icon: <SignIcon sx={{ fontSize: 40 }} />, title: 'Sign Recognition', description: 'Real-time AI sign detection via webcam. Supports ISL and ASL.', color: '#0284c7', path: '/sign-recognition' },
    { icon: <HearingIcon sx={{ fontSize: 40 }} />, title: 'Speech Transcription', description: 'Convert spoken words to text instantly for seamless dialogue.', color: '#059669', path: '/speech-transcription' },
    { icon: <ChatIcon sx={{ fontSize: 40 }} />, title: 'Smart Conversation', description: 'Bidirectional chat with full message history and TTS playback.', color: '#7c3aed', path: '/conversation' },
    { icon: <EmergencyIcon sx={{ fontSize: 40 }} />, title: 'Emergency SOS', description: 'One-tap alert with GPS location sharing to trusted contacts.', color: '#dc2626', path: '/emergency-contacts' },
  ];

  const stats = [
    { label: 'Sign Languages', value: '2+' },
    { label: 'Accuracy', value: '95%' },
    { label: 'Voice Languages', value: '3' },
    { label: 'Contacts', value: 'Unlimited' },
  ];

  return (
    <Box className="min-h-screen bg-appBg">
      <Box className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-appBg">
        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, px: 3 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="AI-Powered Communication" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2, mb: 2 }}>
                Breaking Barriers with{' '}
                <Box component="span" sx={{ background: 'linear-gradient(135deg, #0284c7, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sign Language AI
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ color: '#475569', lineHeight: 1.7, fontWeight: 400, mb: 4 }}>
                Empowering communication between deaf and hearing communities through real-time sign recognition, speech transcription, and emergency assistance.
              </Typography>
              <Box className="flex flex-wrap gap-3">
                {token ? (
                  <>
                    <Button variant="contained" size="large" endIcon={<ArrowIcon />} onClick={() => navigate('/dashboard')} sx={primaryBtn}>Go to Dashboard</Button>
                    <Button variant="outlined" size="large" onClick={() => navigate('/profile')} sx={outlineBtn}>My Profile</Button>
                  </>
                ) : (
                  <>
                    <Button variant="contained" size="large" endIcon={<ArrowIcon />} onClick={() => navigate('/register')} sx={primaryBtn}>Get Started Free</Button>
                    <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={outlineBtn}>Sign In</Button>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box className="surface-card p-6 md:p-8">
                {[
                  { icon: <SignIcon sx={{ color: '#0284c7' }} />, label: 'Detecting Sign', value: 'HELLO', sub: 'Confidence: 96%', bg: '#f0f9ff' },
                  { icon: <HearingIcon sx={{ color: '#059669' }} />, label: 'Transcribing Speech', value: 'How are you?', sub: 'English (US)', bg: '#f0fdf4' },
                  { icon: <EmergencyIcon sx={{ color: '#dc2626' }} />, label: 'Emergency Alert', value: 'SOS Sent', sub: 'Location shared', bg: '#fef2f2' },
                ].map((item, i) => (
                  <Box key={i}>
                    {i > 0 && <Box sx={{ height: 1, bgcolor: '#e2e8f0', my: 2 }} />}
                    <Box className="flex items-center gap-4">
                      <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>{item.label}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>{item.value}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.sub}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 6, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box className="text-center">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stat.value}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', mt: 0.5 }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, px: 3 }}>
        <Container maxWidth="xl">
          <Box className="text-center mb-10">
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Powerful Features</Typography>
            <Typography sx={{ color: '#64748b', maxWidth: 560, mx: 'auto' }}>Everything you need for seamless communication between deaf and hearing individuals.</Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card onClick={() => navigate(f.path)} sx={{ height: '100%', cursor: 'pointer', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', transition: 'all 0.2s', '&:hover': { borderColor: f.color, boxShadow: `0 8px 24px ${f.color}18`, transform: 'translateY(-2px)' } }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ width: 72, height: 72, borderRadius: 3, bgcolor: `${f.color}12`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: f.color }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>{f.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: 10, px: 3 }}>
        <Container maxWidth="md">
          <Card sx={{ textAlign: 'center', p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid #bae6fd', bgcolor: '#f0f9ff' }}>
            <SecurityIcon sx={{ fontSize: 56, color: '#0284c7', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Ready to Start?</Typography>
            <Typography sx={{ color: '#475569', mb: 4, maxWidth: 480, mx: 'auto' }}>Join users breaking communication barriers with our AI-powered platform.</Typography>
            <Box className="flex flex-wrap gap-3 justify-center">
              {token ? (
                <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} sx={{ ...primaryBtn, px: 5 }}>Launch Dashboard</Button>
              ) : (
                <>
                  <Button variant="contained" size="large" onClick={() => navigate('/register')} sx={{ ...primaryBtn, px: 5 }}>Create Free Account</Button>
                  <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={outlineBtn}>Sign In</Button>
                </>
              )}
            </Box>
          </Card>
        </Container>
      </Box>

      <Box sx={{ py: 4, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>© 2024 Multi-Lingual Sign Interpreter · Built for inclusive communication</Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Powered by TensorFlow.js & MediaPipe</Typography>
      </Box>
    </Box>
  );
};

export default Landing;
