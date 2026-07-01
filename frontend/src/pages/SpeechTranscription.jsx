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
  Mic as MicIcon,
  Translate as TranslateIcon,
  RecordVoiceOver as VoiceIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import SpeechTranscriber from '../components/SpeechTranscriber';

const SpeechTranscription = ({ textScale, ttsLanguage }) => {
  return (
    <Container maxWidth="xl" className="py-6 px-4 md:px-8 space-y-6">
      {/* Page Header */}
      <Box className="bg-darkCard/35 p-6 rounded-2xl border border-white/5">
        <Box className="flex items-start gap-4">
          <Box className="w-16 h-16 rounded-2xl bg-accentGreen/10 border border-accentGreen/20 flex items-center justify-center flex-shrink-0">
            <MicIcon sx={{ fontSize: 40, color: '#10b981' }} />
          </Box>
          <Box className="flex-1">
            <Typography variant="h4" className="font-extrabold text-white mb-2">
              Speech Transcription
            </Typography>
            <Typography variant="body1" className="text-slate-300 leading-relaxed mb-4">
              Convert spoken words to text instantly using advanced speech recognition. 
              Perfect for hearing users to communicate with deaf individuals in real-time.
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip icon={<VoiceIcon />} label="Multi-language" className="bg-accentGreen/10 text-accentGreen" size="small" />
              <Chip icon={<SpeedIcon />} label="Real-time" className="bg-accentBlue/10 text-accentBlue" size="small" />
              <Chip icon={<TranslateIcon />} label="3 Languages" className="bg-purple-500/10 text-purple-400" size="small" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tips Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-accentGreen font-bold mb-2">
              🎤 How to Use
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              1. Select your preferred language<br/>
              2. Click "Listen" to start microphone<br/>
              3. Speak clearly and naturally<br/>
              4. See transcription appear in real-time<br/>
              5. Send to chat or message directly
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-accentBlue font-bold mb-2">
              ✨ Best Practices
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              • Use a good quality microphone<br/>
              • Speak at a moderate pace<br/>
              • Minimize background noise<br/>
              • Enunciate words clearly<br/>
              • Pause between sentences
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel p-4 border border-white/5 h-full">
            <Typography variant="subtitle2" className="text-purple-400 font-bold mb-2">
              🌍 Supported Languages
            </Typography>
            <Typography variant="body2" className="text-slate-300 leading-relaxed">
              • English (US) - Default<br/>
              • Hindi (हिंदी) - हिंदी<br/>
              • Tamil (தமிழ்) - தமிழ்<br/>
              <br/>
              Switch languages anytime using the dropdown in the transcriber panel.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Speech Transcriber Component */}
      <Paper className="glass-panel p-6 border border-white/5">
        <SpeechTranscriber 
          textScale={textScale} 
          ttsLanguage={ttsLanguage}
          onSpeechSend={() => {}}
          onShareMessage={() => {}}
        />
      </Paper>
    </Container>
  );
};

export default SpeechTranscription;