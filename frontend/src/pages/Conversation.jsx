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
  Chat as ChatIcon,
  Forum as ForumIcon,
  History as HistoryIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import ChatBox from '../components/ChatBox';
import { getCurrentLocation } from '../utils/location';
import { buildManualSmsBody, getSelectedSmsContacts, openSmsCompose, toSmsStatus } from '../utils/smsLinks';

const LOCAL_MESSAGES_KEY = 'sign_interpreter_messages';

const Conversation = ({ textScale, ttsLanguage }) => {
  const [messages, setMessages] = React.useState([]);
  const [contacts, setContacts] = React.useState([]);
  const [selectedContactIds, setSelectedContactIds] = React.useState([]);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [sharePayload, setSharePayload] = React.useState(null);
  const [shareLocation, setShareLocation] = React.useState(null);
  const [shareLoading, setShareLoading] = React.useState(false);
  const [shareResult, setShareResult] = React.useState(null);

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

  const fetchMessages = async () => {
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
      loadLocalMessages();
    }
  };

  React.useEffect(() => {
    fetchMessages();
  }, []);

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
    try {
      const location = await getCurrentLocation();
      const smsContacts = getSelectedSmsContacts({ contacts, selectedContactIds });

      if (smsContacts.length === 0) {
        await saveMessageOnly({ sender, messageType, content: text });
        return;
      }

      const body = buildManualSmsBody({ body: text, mapsLink: location.mapsLink });
      openSmsCompose({ phone: smsContacts[0].phone || smsContacts[0].mobileNumber, body });
      await saveMessageOnly({ sender, messageType, content: text });
    } catch (err) {
      console.error('Error sending chat SMS:', err);
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

    setShareLoading(true);
    setShareResult(null);

    try {
      const location = shareLocation || await getCurrentLocation();
      setShareLocation(location);
      const smsContacts = getSelectedSmsContacts({ contacts, selectedContactIds });

      if (smsContacts.length === 0) {
        setShareResult({
          success: false,
          message: 'Add or select at least one active emergency contact.'
        });
        return;
      }

      const body = buildManualSmsBody({ body: sharePayload.text, mapsLink: location.mapsLink });
      openSmsCompose({ phone: smsContacts[0].phone || smsContacts[0].mobileNumber, body });
      await saveMessageOnly({
        sender: sharePayload.messageType === 'speech' ? 'hearing_user' : 'deaf_user',
        messageType: sharePayload.messageType,
        content: sharePayload.text
      });
      setShareResult({
        success: true,
        message: 'Linked phone SMS app opened. Confirm Send in the messaging window.',
        smsStatus: smsContacts.map((contact) => toSmsStatus(contact))
      });
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
      {/* Page Header */}
      <Box className="bg-darkCard/35 p-6 rounded-2xl border border-white/5">
        <Box className="flex items-start gap-4">
          <Box className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <ForumIcon sx={{ fontSize: 40, color: '#a855f7' }} />
          </Box>
          <Box className="flex-1">
            <Typography variant="h4" className="font-extrabold text-white mb-2">
              Smart Conversation
            </Typography>
            <Typography variant="body1" className="text-slate-300 leading-relaxed mb-4">
              Real-time bidirectional communication between deaf and hearing users. 
              Sign language recognition and speech transcription work together seamlessly.
            </Typography>
            <Box className="flex flex-wrap gap-2">
              <Chip icon={<ChatIcon />} label="Real-time Chat" className="bg-purple-500/10 text-purple-400" size="small" />
              <Chip icon={<SpeedIcon />} label="Instant Translation" className="bg-accentBlue/10 text-accentBlue" size="small" />
              <Chip icon={<HistoryIcon />} label="Chat History" className="bg-accentGreen/10 text-accentGreen" size="small" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Panel: Sign Recognition */}
        <Grid item xs={12} lg={7}>
          <Paper className="glass-panel p-4 border border-white/5">
            <SignDetector 
              textScale={textScale} 
              ttsLanguage={ttsLanguage} 
              onCompiledTextSend={handleSendCompiledText} 
              onEmergencyGesture={handleEmergencyGesture}
              onShareMessage={handleOpenShareDialog}
            />
          </Paper>
        </Grid>

        {/* Right Panel: Speech & Chat */}
        <Grid item xs={12} lg={5} className="flex flex-col gap-4">
          <Paper className="glass-panel p-4 border border-white/5">
            <SpeechTranscriber 
              textScale={textScale} 
              ttsLanguage={ttsLanguage} 
              onSpeechSend={handleSendSpeechText} 
              onShareMessage={handleOpenShareDialog}
            />
          </Paper>

          <Paper className="glass-panel p-4 border border-white/5 flex-1">
            <ChatBox 
              textScale={textScale} 
              ttsLanguage={ttsLanguage} 
              messages={messages} 
              setMessages={setMessages}
              fetchMessages={fetchMessages}
              localMessagesKey={LOCAL_MESSAGES_KEY}
              selectedContactIds={selectedContactIds}
              contacts={contacts}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Emergency Contacts Panel */}
      <EmergencyContactsPanel
        contacts={contacts}
        setContacts={setContacts}
        selectedContactIds={selectedContactIds}
        setSelectedContactIds={setSelectedContactIds}
      />

      {/* Share Dialog */}
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

export default Conversation;