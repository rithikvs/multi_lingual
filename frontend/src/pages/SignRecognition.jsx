import React from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Chip,
  Grid
} from '@mui/material';
import { 
  Videocam as CameraIcon,
  Translate as TranslateIcon,
  Speed as SpeedIcon,
  Psychology as AIIcon
} from '@mui/icons-material';
import SignDetector from '../components/SignDetector';

const SignRecognition = ({ textScale, ttsLanguage }) => {
  return (
    <Container maxWidth="xl" className="py-6 px-4 md:px-8 space-y-6">
      {/* Page Header */}
      <Box className="bg-darkCard/35 p-6 rounded-2xl border border-white/5">
        <Box className="flex items-start gap-4">
          <Box className="w-16 h-16 rounded-2xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center flex-shrink-0">
            <CameraIcon sx={{ fontSize: 40, color: '#38bdf8' }} />
          </Box>
          <Box className="flex-1">
            <Typography variant="h4" className="font-extrabold text-white mb-2">
              Sign Language Recognition
            </Typography>
            <Typography variant="body1" className="text-slate-300 leading-relaxed mb-4">
              Use your webcam to detect sign language gestures in real-time. Our AI model recognizes 
              Indian Sign Language (ISL) and American Sign Language (ASL) alphabets with high accuracy.
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip icon={<AIIcon />} label="AI-Powered" className="bg-accentBlue/10 text-accentBlue" size="small" />
              <Chip icon={<SpeedIcon />} label="Real-time" className="bg-accentGreen/10 text-accentGreen" size="small" />
              <Chip icon={<TranslateIcon />} label="ISL & ASL" className="bg-purple-500/10 text-purple-400" size="small" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tips Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-accentBlue font-bold mb-2">
              💡 How to Use
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              1. Click "Start" to activate your webcam<br/>
              2. Show hand signs clearly to the camera<br/>
              3. Wait for the AI to recognize the sign<br/>
              4. Letters will compile into words automatically<br/>
              5. Use "Speak Aloud" to hear the text
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-accentGreen font-bold mb-2">
              ✨ Best Practices
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              • Ensure good lighting conditions<br/>
              • Keep hand within camera frame<br/>
              • Make clear, deliberate gestures<br/>
              • Hold each sign for 2-3 seconds<br/>
              • Maintain consistent distance from camera
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-purple-400 font-bold mb-2">
              🚨 Emergency Features
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              • Show "HELP" sign for emergency alert<br/>
              • Show closed fist "SOS" for distress signal<br/>
              • Emergency gestures trigger instant alerts<br/>
              • GPS location is automatically shared<br/>
              • SMS sent to your emergency contacts
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sign Detector Component */}
      <SignDetector 
        textScale={textScale} 
        ttsLanguage={ttsLanguage}
        onCompiledTextSend={() => {}}
        onEmergencyGesture={() => {}}
        onShareMessage={() => {}}
      />
    </Container>
  );
};

export default SignRecognition;