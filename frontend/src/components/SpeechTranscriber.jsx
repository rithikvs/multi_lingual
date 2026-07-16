import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon, Send as SendIcon, Clear as ClearIcon } from '@mui/icons-material';

const SpeechTranscriber = ({ textScale, ttsLanguage, onSpeechSend, onShareMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError('Speech Recognition is not supported by your browser. Please try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = ttsLanguage;

    recognition.onstart = () => { setIsListening(true); setRecognitionError(''); };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setRecognitionError(`Error: ${event.error}. Ensure microphone permissions are granted.`);
        setIsListening(false);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }
      setTranscription((prev) => (finalTranscript ? prev + ' ' + finalTranscript : prev));
      setInterimText(interimTranscript || '');
    };

    recognitionRef.current = recognition;
    return () => recognitionRef.current?.abort();
  }, [ttsLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else { setRecognitionError(''); try { recognitionRef.current.start(); } catch (err) { console.error(err); } }
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

  const handleClear = () => { setTranscription(''); setInterimText(''); };

  return (
    <Paper className="surface-card p-5 space-y-4 flex flex-col h-full justify-between">
      <Box className="space-y-2">
        <Box className="flex justify-between items-center">
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Speech-to-Text</Typography>
          <Tooltip title="Clear transcription">
            <IconButton size="small" onClick={handleClear} disabled={!transcription && !interimText} sx={{ color: '#64748b' }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Listen to the hearing person speak, then tap send to display their words in chat.
        </Typography>
      </Box>

      <Box className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[160px] flex flex-col justify-between overflow-y-auto">
        <Typography sx={{ color: '#0f172a', lineHeight: 1.6 }} className={textScale === 'sm' ? 'text-size-sm' : textScale === 'base' ? 'text-size-base' : textScale === 'lg' ? 'text-size-lg' : textScale === 'xl' ? 'text-size-xl' : 'text-size-2xl'}>
          {transcription || interimText ? (
            <>{transcription}{interimText && <span style={{ color: '#64748b', fontStyle: 'italic' }}> {interimText}</span>}</>
          ) : (
            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Tap the microphone below and start speaking...</span>
          )}
        </Typography>
        {recognitionError && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>{recognitionError}</Typography>}
      </Box>

      <Box className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Box className="flex items-center gap-2">
          <Button variant="contained" color={isListening ? 'error' : 'primary'} onClick={toggleListening} startIcon={isListening ? <MicOffIcon /> : <MicIcon />} className={isListening ? 'animate-pulse' : ''}>
            {isListening ? 'Stop Mic' : 'Listen'}
          </Button>
          {isListening && <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>Active...</Typography>}
        </Box>
        <Button variant="contained" color="secondary" onClick={handleSendToChat} disabled={!(transcription.trim() || interimText.trim())} endIcon={<SendIcon />}>Send to Chat</Button>
        <Button variant="outlined" color="primary" onClick={handleSendMessage} disabled={!(transcription.trim() || interimText.trim())} endIcon={<SendIcon />}>Send Message</Button>
      </Box>
    </Paper>
  );
};

export default SpeechTranscriber;
