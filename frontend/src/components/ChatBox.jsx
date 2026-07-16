import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import { VolumeUp as SpeakIcon, DeleteSweep as ClearHistoryIcon } from '@mui/icons-material';

const ChatBox = ({ textScale, ttsLanguage, messages, setMessages, localMessagesKey }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakMessage = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = ttsLanguage;
    const voices = synth.getVoices();
    const targetVoice = voices.find((v) => v.lang.includes(ttsLanguage));
    if (targetVoice) utterance.voice = targetVoice;
    synth.speak(utterance);
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear the conversation history? This cannot be undone.')) return;
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
      localStorage.removeItem(localMessagesKey);
      setMessages([]);
    }
  };

  return (
    <Paper className="surface-card p-5 space-y-4 flex flex-col h-full justify-between">
      <Box className="flex justify-between items-center pb-2">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Conversation Chat
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Real-time multi-lingual dialogue history.
          </Typography>
        </Box>
        <Tooltip title="Clear chat feed">
          <IconButton onClick={handleClearHistory} disabled={messages.length === 0} sx={{ color: '#64748b', '&:hover': { color: '#dc2626' } }}>
            <ClearHistoryIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <Box className="flex-1 overflow-y-auto pr-1 my-3 min-h-[300px] max-h-[460px] space-y-4">
        {messages.length === 0 ? (
          <Box className="h-full flex items-center justify-center text-slate-400 italic p-4 text-center">
            No dialogue history. Use the Sign Compiler or Microphone to start translating!
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isDeaf = msg.sender === 'deaf_user';
            const isSOS = msg.messageType === 'sos';
            return (
              <Box key={msg._id || index} className={`flex flex-col ${isDeaf ? 'items-start' : 'items-end'}`}>
                <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, px: 0.5 }}>
                  {isDeaf ? 'Sign Interpreter (Deaf)' : 'Speech Transcriber (Hearing)'}
                </Typography>
                <Box
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 relative flex items-start gap-2 ${
                    isSOS
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : isDeaf
                        ? 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                        : 'bg-sky-100 text-sky-900 rounded-tr-none border border-sky-200 font-medium'
                  }`}
                >
                  <Box className="flex-1 space-y-1">
                    <Typography className={textScale === 'sm' ? 'text-size-sm' : textScale === 'base' ? 'text-size-base' : textScale === 'lg' ? 'text-size-lg' : textScale === 'xl' ? 'text-size-xl' : 'text-size-2xl'} sx={{ color: 'inherit' }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {!isSOS && (
                    <Tooltip title="Speak message">
                      <IconButton size="small" onClick={() => speakMessage(msg.content)} sx={{ color: '#64748b', p: 0.5, '&:hover': { color: '#0284c7' } }}>
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
    </Paper>
  );
};

export default ChatBox;
