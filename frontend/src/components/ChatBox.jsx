import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { 
  Warning as SOSIcon, 
  VolumeUp as SpeakIcon, 
  DeleteSweep as ClearHistoryIcon,
  MyLocation as GpsIcon
} from '@mui/icons-material';
import { api, getAuthHeaders } from '../utils/api';
import { getCurrentLocation } from '../utils/location';

const ChatBox = ({ textScale, ttsLanguage, messages, setMessages, fetchMessages, localMessagesKey, selectedContactIds = [] }) => {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Read message content aloud using TTS
  const speakMessage = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    
    // Remove metadata prefixes if present (e.g. [ALERT] or [SOS])
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = ttsLanguage;

    const voices = synth.getVoices();
    const targetVoice = voices.find(v => v.lang.includes(ttsLanguage));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    synth.speak(utterance);
  };

  // Clear message history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear the conversation history? This cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem(localMessagesKey);
      setMessages([]);
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear message history:', err.message);
      localStorage.removeItem(localMessagesKey);
      setMessages([]);
    }
  };

  // Trigger Geolocation and SOS SMS alert dispatch
  const handleSOSAlert = async () => {
    setSosLoading(true);
    setSosResult(null);
    setSosDialogOpen(true);

    try {
      const location = await getCurrentLocation();
      const token = localStorage.getItem('token');

      if (!token) {
        triggerLocalSos(location.latitude, location.longitude);
        setSosLoading(false);
        return;
      }

      const response = await api.post('/api/emergency/send-sos', {
        latitude: location.latitude,
        longitude: location.longitude,
        contactIds: selectedContactIds
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const hasFailedSms = response.data.smsStatus?.some((status) => status.status === 'failed');
        setSosResult({
          success: !hasFailedSms,
          message: hasFailedSms
            ? 'SOS was saved, but SMS delivery failed. Check recipient details below.'
            : response.data.isSimulated
            ? 'SOS simulated successfully. Add Twilio credentials for live delivery.'
            : 'SOS SMS sent successfully.',
          mapsLink: response.data.mapsLink,
          smsStatus: response.data.smsStatus,
          isSimulated: response.data.isSimulated
        });
        fetchMessages();
      }
    } catch (err) {
      setSosResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to trigger SOS alert.'
      });
    } finally {
      setSosLoading(false);
    }
  };

  const triggerLocalSos = (latitude, longitude) => {
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const alertMessage = `[ALERT] Demo SOS generated. Location: Latitude ${latitude}, Longitude ${longitude}. Maps: ${mapsLink}`;

    const newMessage = {
      _id: crypto.randomUUID(),
      sender: 'deaf_user',
      messageType: 'sos',
      content: alertMessage,
      timestamp: new Date().toISOString()
    };

    setMessages((previousMessages) => {
      const nextMessages = [...previousMessages, newMessage];
      localStorage.setItem(localMessagesKey, JSON.stringify(nextMessages));
      return nextMessages;
    });

    setSosResult({
      success: true,
      mapsLink,
      isSimulated: true,
      note: 'Demo mode: log in and configure Twilio credentials for real SMS delivery.',
      smsStatus: [
        {
          contactName: 'Demo Emergency Contact',
          phone: '+91XXXXXXXXXX',
          status: 'simulated_success'
        }
      ]
    });
  };

  return (
    <Paper className="glass-panel p-5 space-y-4 border border-white/5 shadow-xl flex flex-col h-full justify-between">
      
      {/* Header Panel */}
      <Box className="flex justify-between items-center pb-2">
        <Box>
          <Typography variant="h6" className="font-bold text-white">
            Conversation Chat
          </Typography>
          <Typography variant="caption" className="text-slate-400">
            Real-time multi-lingual dialogue history.
          </Typography>
        </Box>

        <Tooltip title="Clear chat feed">
          <IconButton 
            onClick={handleClearHistory} 
            color="inherit" 
            disabled={messages.length === 0}
            sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
          >
            <ClearHistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Messages Feed View */}
      <Box className="flex-1 overflow-y-auto pr-1 my-3 min-h-[300px] max-h-[460px] space-y-4">
        {messages.length === 0 ? (
          <Box className="h-full flex items-center justify-center text-slate-500 italic p-4 text-center">
            No dialogue history. Use the Sign Compiler or Microphone to start translating!
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isDeaf = msg.sender === 'deaf_user';
            const isSOS = msg.messageType === 'sos';
            
            return (
              <Box 
                key={msg._id || index}
                className={`flex flex-col ${isDeaf ? 'items-start' : 'items-end'}`}
              >
                {/* Sender Title */}
                <Typography variant="caption" className="text-slate-400 mb-1 px-1">
                  {isDeaf ? 'Sign Interpreter (Deaf)' : 'Speech Transcriber (Hearing)'}
                </Typography>

                {/* Message bubble */}
                <Box 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 relative flex items-start gap-2 shadow-md ${
                    isSOS 
                      ? 'bg-red-950/80 text-red-200 border border-red-500/30' 
                      : isDeaf 
                        ? 'bg-slate-800 text-white rounded-tl-none border border-white/5' 
                        : 'bg-accentBlue/90 text-slate-950 rounded-tr-none font-medium'
                  }`}
                >
                  <Box className="flex-1 space-y-1">
                    <Typography className={textScale === 'sm' ? 'text-size-sm' : textScale === 'base' ? 'text-size-base' : textScale === 'lg' ? 'text-size-lg' : textScale === 'xl' ? 'text-size-xl' : 'text-size-2xl'}>
                      {msg.content}
                    </Typography>
                    
                    {/* Timestamp */}
                    <Typography variant="caption" className={`block text-[10px] ${isDeaf || isSOS ? 'text-slate-400' : 'text-slate-700'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  {/* Play audio button */}
                  {!isSOS && (
                    <Tooltip title="Speak message">
                      <IconButton 
                        size="small" 
                        onClick={() => speakMessage(msg.content)}
                        sx={{ 
                          color: isDeaf ? '#94a3b8' : '#0f172a',
                          padding: 0.5,
                          '&:hover': { color: isDeaf ? '#38bdf8' : '#1e293b' }
                        }}
                      >
                        <SpeakIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Emergency SOS Button Widget */}
      <Box className="pt-3">
        <Button
          variant="contained"
          color="error"
          fullWidth
          size="large"
          startIcon={<SOSIcon className="animate-bounce" />}
          onClick={handleSOSAlert}
          className="glow-border-red py-3 text-lg font-black tracking-widest uppercase transition-all duration-300 transform active:scale-95"
          sx={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
            color: 'white',
            borderRadius: '16px',
            '&:hover': {
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)'
            }
          }}
        >
          Emergency SOS Alert
        </Button>
      </Box>

      {/* SOS Alert Dialog Confirmation Logs */}
      <Dialog 
        open={sosDialogOpen} 
        onClose={() => !sosLoading && setSosDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#0f172a',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px',
            color: 'white'
          }
        }}
      >
        <DialogTitle className="flex items-center gap-2 text-red-500 font-extrabold">
          <SOSIcon /> Emergency SOS Dispatcher
        </DialogTitle>
        
        <DialogContent className="space-y-4">
          {sosLoading ? (
            <Box className="flex flex-col items-center justify-center py-6 gap-3">
              <CircularProgress color="error" />
              <Typography variant="body2" className="text-slate-400">
                Retrieving GPS Location & dispatching SMS alerts...
              </Typography>
            </Box>
          ) : (
            <Box className="space-y-3">
              {sosResult?.success ? (
                <>
                  <Alert severity="success" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#34d399', borderRadius: '8px' }}>
                    {sosResult.message || 'SOS Event logged. Coordinates transmitted successfully.'}
                  </Alert>

                  {sosResult.note && (
                    <Typography variant="caption" className="text-amber-400 block italic">
                      {sosResult.note}
                    </Typography>
                  )}

                  <Box className="bg-slate-900 p-3 rounded-lg border border-white/5 space-y-2">
                    <Typography variant="subtitle2" className="font-bold flex items-center gap-1 text-accentBlue">
                      <GpsIcon fontSize="small" /> Google Maps Link
                    </Typography>
                    <a 
                      href={sosResult.mapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-accentBlue hover:underline break-all block"
                    >
                      {sosResult.mapsLink}
                    </a>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="subtitle2" className="font-bold text-slate-300">
                      SMS Broadcast Status:
                    </Typography>
                    {sosResult.smsStatus.map((status, idx) => (
                      <Box 
                        key={idx} 
                        className="flex justify-between items-center text-xs bg-slate-950 p-2 rounded border border-white/5"
                      >
                        <span className="font-medium text-white">{status.contactName} ({status.phone})</span>
                        <span className={`font-bold ${
                          status.status.includes('success') || status.status === 'sent' 
                            ? 'text-accentGreen' 
                            : 'text-red-500'
                        }`}>
                          {status.status.includes('success') ? 'SIMULATED' : status.status.toUpperCase()}
                        </span>
                      </Box>
                    ))}
                  </Box>
                  
                  {sosResult.isSimulated && (
                    <Typography variant="caption" className="text-slate-500 block text-center pt-2">
                      (Running in Development mode. Twilio SMS outputs were output to console logs).
                    </Typography>
                  )}
                </>
              ) : (
                <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '8px' }}>
                  {sosResult?.message || 'An unknown error occurred during dispatch.'}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 2 }}>
          <Button 
            onClick={() => setSosDialogOpen(false)} 
            color="inherit" 
            disabled={sosLoading}
          >
            Close Panel
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ChatBox;
