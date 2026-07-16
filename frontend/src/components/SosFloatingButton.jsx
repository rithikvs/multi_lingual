import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Warning as SOSIcon, MyLocation as GpsIcon } from '@mui/icons-material';
import { getCurrentLocation } from '../utils/location';
import { buildSmsUri, getSelectedSmsContacts, openSmsCompose, toSmsStatus } from '../utils/smsLinks';

const SosFloatingButton = ({
  contacts = [],
  selectedContactIds = [],
  fetchMessages,
  localMessagesKey = 'sign_interpreter_messages',
  setMessages
}) => {
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);

  const failedSosStatuses = sosResult?.smsStatus?.filter((status) => status.status !== 'sent') || [];
  const manualSosBody = [
    'EMERGENCY ALERT',
    '',
    'The user requires immediate assistance.',
    '',
    sosResult?.mapsLink ? `Current Location:\n${sosResult.mapsLink}` : '',
    '',
    'Please respond immediately.'
  ].filter(Boolean).join('\n');
  const isPositiveSmsStatus = (status) =>
    status.status === 'sent' || status.status === 'ready_to_send' || status.status.includes('success');

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

    if (setMessages) {
      setMessages((previousMessages) => {
        const nextMessages = [...previousMessages, newMessage];
        localStorage.setItem(localMessagesKey, JSON.stringify(nextMessages));
        return nextMessages;
      });
    }

    setSosResult({
      success: true,
      mapsLink,
      isSimulated: true,
      note: 'Demo mode: log in and use the linked phone SMS flow for real SMS delivery.',
      smsStatus: [{ contactName: 'Demo Emergency Contact', phone: '+91XXXXXXXXXX', status: 'simulated_success' }]
    });
  };

  const handleSOSAlert = async () => {
    setSosLoading(true);
    setSosResult(null);
    setSosDialogOpen(true);

    try {
      const location = await getCurrentLocation();
      const token = localStorage.getItem('token');
      const smsContacts = getSelectedSmsContacts({ contacts, selectedContactIds });
      const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      const body = [
        'EMERGENCY ALERT',
        '',
        'The user requires immediate assistance.',
        '',
        'Current Location:',
        mapsLink,
        '',
        'Please respond immediately.'
      ].join('\n');

      if (!token) {
        triggerLocalSos(location.latitude, location.longitude);
        setSosLoading(false);
        return;
      }

      if (smsContacts.length === 0) {
        setSosResult({
          success: false,
          message: 'Add or select at least one active emergency contact to open the linked phone SMS app.'
        });
        return;
      }

      openSmsCompose({ phone: smsContacts[0].phone || smsContacts[0].mobileNumber, body });

      await axios.post(
        'http://localhost:5000/api/messages',
        {
          sender: 'deaf_user',
          messageType: 'sos',
          content: `[ALERT] SOS opened in linked phone SMS app. Location: ${mapsLink}. Time: ${new Date().toISOString()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSosResult({
        success: true,
        message: 'Linked phone SMS app opened. Confirm Send in the messaging window.',
        mapsLink,
        smsStatus: smsContacts.map((contact) => toSmsStatus(contact)),
        isSimulated: false
      });
      fetchMessages?.();
    } catch (err) {
      setSosResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to trigger SOS alert.'
      });
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="sos-floating-btn"
        onClick={handleSOSAlert}
        disabled={sosLoading}
        aria-label="Emergency SOS Alert"
      >
        <span>SOS</span>
        <span className="sos-floating-label">EMERGENCY</span>
      </button>

      <Dialog
        open={sosDialogOpen}
        onClose={() => !sosLoading && setSosDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', border: '1px solid #fecaca' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626', fontWeight: 800 }}>
          <SOSIcon /> Emergency SOS
        </DialogTitle>

        <DialogContent>
          {sosLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
              <CircularProgress color="error" />
              <Typography variant="body2" color="text.secondary">
                Retrieving GPS location and preparing SMS alert...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sosResult?.success ? (
                <>
                  <Alert severity="success">{sosResult.message || 'SOS event logged successfully.'}</Alert>
                  {sosResult.note && (
                    <Typography variant="caption" color="warning.main" sx={{ fontStyle: 'italic' }}>
                      {sosResult.note}
                    </Typography>
                  )}
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, color: '#0284c7', mb: 1 }}>
                      <GpsIcon fontSize="small" /> Google Maps Link
                    </Typography>
                    <a href={sosResult.mapsLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#0284c7', wordBreak: 'break-all' }}>
                      {sosResult.mapsLink}
                    </a>
                  </Box>
                  {sosResult.smsStatus?.map((status, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{status.contactName} ({status.phone})</span>
                      <span style={{ fontWeight: 700, color: isPositiveSmsStatus(status) ? '#059669' : '#dc2626' }}>
                        {status.status === 'ready_to_send' ? 'OPENED' : status.status.includes('success') ? 'SIMULATED' : status.status.toUpperCase()}
                      </span>
                    </Box>
                  ))}
                </>
              ) : (
                <>
                  <Alert severity="error">{sosResult?.message || 'An unknown error occurred.'}</Alert>
                  {failedSosStatuses.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {failedSosStatuses.map((status, index) => (
                        <Button
                          key={`${status.phone}-manual-${index}`}
                          component="a"
                          href={buildSmsUri({ phone: status.phone, body: manualSosBody })}
                          variant="outlined"
                          size="small"
                          startIcon={<SOSIcon />}
                        >
                          Open SMS: {status.contactName}
                        </Button>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSosDialogOpen(false)} disabled={sosLoading} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SosFloatingButton;
