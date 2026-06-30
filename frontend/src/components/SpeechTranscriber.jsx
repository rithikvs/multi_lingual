import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  Tooltip,
  Paper
} from '@mui/material';
import { 
  Mic as MicIcon, 
  MicOff as MicOffIcon, 
  Send as SendIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';

const SpeechTranscriber = ({ textScale, ttsLanguage, onSpeechSend, onShareMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError('Speech Recognition is not supported by your browser. Please try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set language based on selected TTS language (mapped correctly for speech)
    recognition.lang = ttsLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setRecognitionError('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setRecognitionError(`Error: ${event.error}. Ensure microphone permissions are granted.`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Append result
      setTranscription((prev) => {
        // If there's new final text, append it. Otherwise show interim inside local display
        return finalTranscript ? prev + ' ' + finalTranscript : prev;
      });
      
      // If we only have interim transcript, display it temporarily
      if (interimTranscript) {
        setInterimText(interimTranscript);
      } else {
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [ttsLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setRecognitionError('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendToChat = () => {
    const finalMsg = (transcription + ' ' + interimText).trim();
    if (!finalMsg) return;
    onSpeechSend(finalMsg);
    setTranscription('');
    setInterimText('');
  };

  const handleSendMessage = () => {
    const finalMsg = (transcription + ' ' + interimText).trim();
    if (!finalMsg) return;
    onShareMessage?.(finalMsg, 'speech');
  };

  const handleClear = () => {
    setTranscription('');
    setInterimText('');
  };

  return (
    <Paper className="glass-panel p-5 space-y-4 border border-white/5 shadow-xl flex flex-col h-full justify-between">
      <Box className="space-y-2">
        <Box className="flex justify-between items-center">
          <Typography variant="h6" className="font-bold text-white">
            Speech-to-Text (Hearing User)
          </Typography>
          
          <Tooltip title="Clear transcription">
            <IconButton 
              size="small" 
              onClick={handleClear} 
              color="error" 
              disabled={!transcription && !interimText}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" className="text-slate-400">
          Listen to the hearing person speak, then tap send to display their words on the chat panel.
        </Typography>
      </Box>

      {/* Transcription Display Screen */}
      <Box className="flex-1 bg-slate-950/60 p-4 rounded-xl border border-white/5 min-h-[160px] flex flex-col justify-between overflow-y-auto">
        <Typography className={`text-white leading-relaxed ${textScale === 'sm' ? 'text-size-sm' : textScale === 'base' ? 'text-size-base' : textScale === 'lg' ? 'text-size-lg' : textScale === 'xl' ? 'text-size-xl' : 'text-size-2xl'}`}>
          {transcription || interimText ? (
            <>
              {transcription}
              {interimText && <span className="text-slate-400 italic"> {interimText}</span>}
            </>
          ) : (
            <span className="text-slate-600 italic">Tap the microphone below and start speaking to see transcription...</span>
          )}
        </Typography>

        {recognitionError && (
          <Typography variant="caption" color="error" className="block mt-2">
            {recognitionError}
          </Typography>
        )}
      </Box>

      {/* Audio controls */}
      <Box className="flex items-center justify-between gap-4 pt-2">
        <Box className="flex items-center gap-2">
          <Button
            variant="contained"
            color={isListening ? 'error' : 'primary'}
            onClick={toggleListening}
            startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
            className={`${isListening ? 'animate-pulse' : ''}`}
            sx={{ px: 3 }}
          >
            {isListening ? 'Stop Mic' : 'Listen'}
          </Button>

          {isListening && (
            <Typography variant="caption" className="text-accentGreen font-semibold animate-pulse">
              Microphone Active...
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleSendToChat}
          disabled={!(transcription.trim() || interimText.trim())}
          endIcon={<SendIcon />}
          sx={{ px: 4 }}
        >
          Send to Chat
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSendMessage}
          disabled={!(transcription.trim() || interimText.trim())}
          endIcon={<SendIcon />}
          sx={{ px: 3 }}
        >
          Send Message
        </Button>
      </Box>
    </Paper>
  );
};

export default SpeechTranscriber;
