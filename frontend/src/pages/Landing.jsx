import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Container,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  SignLanguage as SignIcon,
  Hearing as HearingIcon,
  Chat as ChatIcon,
  Emergency as EmergencyIcon,
  ArrowForward as ArrowIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const features = [
    {
      icon: <SignIcon sx={{ fontSize: 48 }} />,
      title: 'Sign Language Recognition',
      description: 'Real-time AI-powered sign language detection using your webcam. Supports Indian Sign Language (ISL) and American Sign Language (ASL).',
      color: '#38bdf8',
      path: '/sign-recognition'
    },
    {
      icon: <HearingIcon sx={{ fontSize: 48 }} />,
      title: 'Speech Transcription',
      description: 'Convert spoken words to text instantly. Perfect for hearing users to communicate with deaf individuals.',
      color: '#10b981',
      path: '/speech-transcription'
    },
    {
      icon: <ChatIcon sx={{ fontSize: 48 }} />,
      title: 'Smart Conversation',
      description: 'Bidirectional communication with real-time chat history. Both parties can communicate seamlessly.',
      color: '#a855f7',
      path: '/conversation'
    },
    {
      icon: <EmergencyIcon sx={{ fontSize: 48 }} />,
      title: 'Emergency SOS',
      description: 'One-tap emergency alert with GPS location sharing to your trusted contacts via SMS.',
      color: '#ef4444',
      path: '/emergency-contacts'
    }
  ];

  const stats = [
    { label: 'Sign Languages', value: '2+' },
    { label: 'Recognition Accuracy', value: '95%' },
    { label: 'Supported Languages', value: '3' },
    { label: 'Emergency Contacts', value: 'Unlimited' }
  ];

  return (
    <Box className="min-h-screen bg-darkBg">
      {/* Hero Section */}
      <Box className="relative overflow-hidden">
        <Box className="absolute inset-0 bg-gradient-to-br from-accentBlue/10 via-transparent to-accentGreen/10"></Box>
        <Container maxWidth="xl" className="relative py-20 px-4">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="space-y-6">
                <Chip 
                  label="AI-Powered Communication" 
                  className="bg-accentBlue/10 text-accentBlue border border-accentBlue/20"
                />
                <Typography variant="h2" className="font-extrabold text-white leading-tight">
                  Breaking Barriers with{' '}
                  <span className="bg-gradient-to-r from-accentBlue to-accentGreen bg-clip-text text-transparent">
                    Sign Language AI
                  </span>
                </Typography>
                <Typography variant="h6" className="text-slate-300 leading-relaxed">
                  Empowering communication between deaf and hearing communities through advanced AI technology. 
                  Real-time sign recognition, speech transcription, and emergency assistance in one platform.
                </Typography>
                <Box className="flex flex-wrap gap-4 pt-4">
                  {token ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                          background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
                          color: '#0f172a',
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Go to Dashboard
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/profile')}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)'
                          }
                        }}
                      >
                        My Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowIcon />}
                        onClick={() => navigate('/register')}
                        sx={{
                          background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
                          color: '#0f172a',
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Get Started Free
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)'
                          }
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box className="relative">
                <Box className="absolute -inset-4 bg-gradient-to-r from-accentBlue/20 to-accentGreen/20 rounded-full blur-3xl"></Box>
                <Box className="relative bg-darkCard/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <Box className="space-y-6">
                    <Box className="flex items-center gap-4">
                      <Box className="w-16 h-16 rounded-2xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center">
                        <SignIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="body2" className="text-slate-400">Detecting Sign</Typography>
                        <Typography variant="h5" className="font-bold text-white">HELLO</Typography>
                        <Typography variant="caption" className="text-accentGreen">Confidence: 96%</Typography>
                      </Box>
                    </Box>

                    <Box className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></Box>

                    <Box className="flex items-center gap-4">
                      <Box className="w-16 h-16 rounded-2xl bg-accentGreen/10 border border-accentGreen/20 flex items-center justify-center">
                        <HearingIcon sx={{ fontSize: 40, color: '#10b981' }} />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="body2" className="text-slate-400">Transcribing Speech</Typography>
                        <Typography variant="h5" className="font-bold text-white">How are you?</Typography>
                        <Typography variant="caption" className="text-accentBlue">English (US)</Typography>
                      </Box>
                    </Box>

                    <Box className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></Box>

                    <Box className="flex items-center gap-4">
                      <Box className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <EmergencyIcon sx={{ fontSize: 40, color: '#ef4444' }} />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="body2" className="text-slate-400">Emergency Alert</Typography>
                        <Typography variant="h5" className="font-bold text-white">SOS Sent</Typography>
                        <Typography variant="caption" className="text-red-400">Location shared</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box className="py-12 border-y border-white/5 bg-darkCard/20">
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box className="text-center space-y-2">
                  <Typography variant="h3" className="font-black text-white">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" className="text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box className="py-20 px-4">
        <Container maxWidth="xl">
          <Box className="text-center mb-16 space-y-4">
            <Typography variant="h3" className="font-extrabold text-white">
              Powerful Features
            </Typography>
            <Typography variant="body1" className="text-slate-400 max-w-2xl mx-auto">
              Everything you need for seamless communication between deaf and hearing individuals
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card
                  className="h-full transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => navigate(feature.path)}
                  sx={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      border: `1px solid ${feature.color}40`,
                      boxShadow: `0 8px 32px ${feature.color}20`
                    }
                  }}
                >
                  <CardContent className="p-6 space-y-4 text-center">
                    <Box 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110"
                      sx={{ 
                        background: `${feature.color}15`,
                        border: `1px solid ${feature.color}30`
                      }}
                    >
                          <Box sx={{ color: feature.color }}>
                            {feature.icon}
                          </Box>
                    </Box>
                    <Typography variant="h6" className="font-bold text-white">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </Typography>
                    <Box className="pt-2">
                      <Typography 
                        variant="button" 
                        className="font-semibold"
                        sx={{ color: feature.color }}
                      >
                        Learn More →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box className="py-20 px-4">
        <Container maxWidth="md">
          <Card 
            className="text-center p-12 space-y-6"
            sx={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <SecurityIcon sx={{ fontSize: 64, color: '#38bdf8' }} />
            <Typography variant="h3" className="font-extrabold text-white">
              Ready to Start Communicating?
            </Typography>
            <Typography variant="body1" className="text-slate-300 max-w-lg mx-auto">
              Join thousands of users who are already breaking communication barriers with our AI-powered platform.
            </Typography>
            <Box className="flex flex-wrap gap-4 justify-center pt-4">
              {token ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
                    color: '#0f172a',
                    fontWeight: 'bold',
                    px: 6,
                    py: 2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Launch Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
                      color: '#0f172a',
                      fontWeight: 'bold',
                      px: 6,
                      py: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Free Account
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      px: 6,
                      py: 2,
                      '&:hover': {
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)'
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Footer */}
      <Box className="py-8 px-4 border-t border-white/5">
        <Container maxWidth="xl">
          <Box className="text-center space-y-2">
            <Typography variant="body2" className="text-slate-500">
              © 2024 Multi-Lingual Sign Interpreter. Built with ❤️ for inclusive communication.
            </Typography>
            <Typography variant="caption" className="text-slate-600">
              Powered by TensorFlow.js & MediaPipe
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;