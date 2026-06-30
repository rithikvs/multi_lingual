import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, Container } from '@mui/material';
import SignDetector from '../components/SignDetector';
import SpeechTranscriber from '../components/SpeechTranscriber';
import ChatBox from '../components/ChatBox';
import EmergencyContactsPanel from '../components/EmergencyContactsPanel';
import ContactSelectionDialog from '../components/ContactSelectionDialog';
import { api, getAuthHeaders } from '../utils/api';
import { getCurrentLocation } from '../utils/location';

const LOCAL_MESSAGES_KEY = 'sign_interpreter_messages';

const Dashboard = ({ textScale, ttsLanguage }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState(null);
  const [shareLocation, setShareLocation] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareResult, setShareResult] = useState(null);

  const loadLocalMessages = () => {
    try {
      const storedMessages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
      setMessages(storedMessages);
    } catch (err) {
      console.error('Failed to read local messages:', err);
      setMessages([]);
    }
  };

  const saveLocalMessage = (sender, messageType, content) => {
    const newMessage = {
      _id: crypto.randomUUID(),
      sender,
      messageType,
      content,
      timestamp: new Date().toISOString()
    };

    setMessages((previousMessages) => {
      const nextMessages = [...previousMessages, newMessage];
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(nextMessages));
      return nextMessages;
    });

    return newMessage;
  };

  const fetchMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      loadLocalMessages();
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Backend is offline, so messages are being stored in this browser.');
      loadLocalMessages();
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const saveMessageOnly = async ({ sender, messageType, content }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      saveLocalMessage(sender, messageType, content);
      return null;
    }

    const response = await axios.post('http://localhost:5000/api/messages', {
      sender,
      messageType,
      content
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      setMessages(prev => [...prev, response.data.data]);
      return response.data.data;
    }

    return null;
  };

  const sendChatMessageWithSms = async ({ sender, messageType, text }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      saveLocalMessage(sender, messageType, text);
      return;
    }

    try {
      const location = await getCurrentLocation();
      const response = await api.post('/api/messages/send', {
        text,
        messageType,
        latitude: location.latitude,
        longitude: location.longitude,
        contactIds: selectedContactIds
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        if (response.data.data) {
          setMessages(prev => [...prev, response.data.data]);
        }
        setError(response.data.isSimulated
          ? 'Chat saved. SMS was simulated because Twilio is not using live delivery settings.'
          : 'Chat saved and server SMS delivery processed.');
      }
    } catch (err) {
      console.error('Error sending chat SMS:', err);
      setError(err.response?.data?.message || err.message || 'SMS failed. Chat was saved without SMS.');
      try {
        await saveMessageOnly({ sender, messageType, content: text });
      } catch (saveError) {
        console.error('Error saving chat fallback:', saveError);
        saveLocalMessage(sender, messageType, text);
      }
    }
  };

  const handleSendCompiledText = async (text) => {
    await sendChatMessageWithSms({
      sender: 'deaf_user',
      messageType: 'sign',
      text
    });
  };

  const handleSendSpeechText = async (text) => {
    await sendChatMessageWithSms({
      sender: 'hearing_user',
      messageType: 'speech',
      text
    });
  };

  const handleEmergencyGesture = (gesture) => {
    const content = `[ALERT] Emergency gesture detected: ${gesture}. Use the Emergency SOS Alert button to send GPS-based SMS.`;
    saveLocalMessage('deaf_user', 'sos', content);
  };

  const handleOpenShareDialog = async (text, messageType) => {
    setSharePayload({ text, messageType });
    setShareResult(null);
    setShareLocation(null);
    setShareDialogOpen(true);

    try {
      const location = await getCurrentLocation();
      setShareLocation(location);
    } catch (err) {
      setShareResult({ success: false, message: err.message });
    }
  };

  const handleSendSharedMessage = async () => {
    if (!sharePayload) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setShareResult({
        success: false,
        message: 'Log in and configure Twilio/MongoDB to send real SMS messages.'
      });
      return;
    }

    setShareLoading(true);
    setShareResult(null);

    try {
      const location = shareLocation || await getCurrentLocation();
      setShareLocation(location);

      const response = await api.post('/api/messages/send', {
        text: sharePayload.text,
        messageType: sharePayload.messageType,
        latitude: location.latitude,
        longitude: location.longitude,
        contactIds: selectedContactIds
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const hasFailedSms = response.data.smsStatus?.some((status) => status.status === 'failed');
        const hasSentSms = response.data.smsStatus?.some((status) => status.status === 'sent' || status.status.includes('success'));
        setShareResult({
          success: hasSentSms && !hasFailedSms,
          message: hasFailedSms
            ? 'SMS failed. Check the failed recipient details below.'
            : response.data.isSimulated
            ? 'SMS simulated successfully. Add Twilio credentials for live delivery.'
            : 'SMS sent successfully.',
          smsStatus: response.data.smsStatus
        });
        if (response.data.data) {
          setMessages((previous) => [...previous, response.data.data]);
        }
      }
    } catch (err) {
      setShareResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to send SMS.'
      });
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" className="py-6 px-4 md:px-8 space-y-6">
      
      {/* Welcome Greeting */}
      <Box className="flex justify-between items-center bg-darkCard/35 p-5 rounded-2xl border border-white/5">
        <Box>
          <Typography variant="h5" className="font-extrabold text-white">
            Communication Workspace
          </Typography>
          <Typography variant="body2" className="text-slate-400">
            Real-time sign language interpreter dashboard and voice transcribing deck.
          </Typography>
        </Box>
        <Typography variant="caption" className="text-slate-500 font-medium">
          Workspace Active
        </Typography>
      </Box>

      {error && (
        <Box className="bg-red-950/40 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </Box>
      )}

      {/* Main Grid Layout */}
      <Grid container spacing={4}>
        
        {/* Left Panel: Camera & Sign Recognition Compiler */}
        <Grid item xs={12} lg={7} className="space-y-4">
          <SignDetector 
            textScale={textScale} 
            ttsLanguage={ttsLanguage} 
            onCompiledTextSend={handleSendCompiledText} 
            onEmergencyGesture={handleEmergencyGesture}
            onShareMessage={handleOpenShareDialog}
          />
        </Grid>

        {/* Right Panel: Speech Transcriber & Dialogue Chat history */}
        <Grid item xs={12} lg={5} className="flex flex-col gap-6">
          
          {/* Speech-to-Text Microphone input */}
          <Box className="flex-initial">
            <SpeechTranscriber 
              textScale={textScale} 
              ttsLanguage={ttsLanguage} 
              onSpeechSend={handleSendSpeechText} 
              onShareMessage={handleOpenShareDialog}
            />
          </Box>

          {/* Combined Dialogue logs + SOS Button */}
          <Box className="flex-1">
          <ChatBox 
              textScale={textScale} 
              ttsLanguage={ttsLanguage} 
              messages={messages} 
              setMessages={setMessages}
              fetchMessages={fetchMessages}
              localMessagesKey={LOCAL_MESSAGES_KEY}
              selectedContactIds={selectedContactIds}
            />
          </Box>

        </Grid>
        
      </Grid>

      <EmergencyContactsPanel
        contacts={contacts}
        setContacts={setContacts}
        selectedContactIds={selectedContactIds}
        setSelectedContactIds={setSelectedContactIds}
      />

      <ContactSelectionDialog
        open={shareDialogOpen}
        title="Send Recognized Message"
        body={sharePayload?.text}
        contacts={contacts}
        selectedContactIds={selectedContactIds}
        setSelectedContactIds={setSelectedContactIds}
        location={shareLocation}
        loading={shareLoading}
        result={shareResult}
        onClose={() => setShareDialogOpen(false)}
        onConfirm={handleSendSharedMessage}
      />
      
    </Container>
  );
};

export default Dashboard;
