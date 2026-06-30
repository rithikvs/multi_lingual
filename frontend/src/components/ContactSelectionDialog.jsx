import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Typography
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Sms as SmsIcon
} from '@mui/icons-material';
import { buildManualSmsBody, buildSmsUri } from '../utils/smsLinks';

const ContactSelectionDialog = ({
  open,
  title,
  body,
  contacts,
  selectedContactIds,
  setSelectedContactIds,
  location,
  loading,
  result,
  onClose,
  onConfirm
}) => {
  const activeContacts = contacts.filter((contact) => contact.isActive !== false);
  const isPositiveSmsStatus = (status) => status.status === 'sent' || status.status === 'ready_to_send' || status.status.includes('success');
  const hasFailedSms = result?.smsStatus?.some((status) => !isPositiveSmsStatus(status));
  const hasSentSms = result?.smsStatus?.some(isPositiveSmsStatus);
  const alertSeverity = result?.success && hasSentSms && !hasFailedSms ? 'success' : 'error';
  const manualSmsStatuses = result?.smsStatus?.filter((status) => status.status !== 'sent') || [];
  const manualSmsBody = buildManualSmsBody({ body, mapsLink: location?.mapsLink });

  const toggleSelection = (contactId) => {
    setSelectedContactIds((current) => (
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: '#0f172a',
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: '16px',
          color: 'white'
        }
      }}
    >
      <DialogTitle className="flex items-center gap-2 font-extrabold">
        <SmsIcon color="primary" /> {title}
      </DialogTitle>

      <DialogContent className="space-y-4">
        {body && (
          <Box className="bg-slate-950/70 p-3 rounded-lg border border-white/5">
            <Typography variant="caption" className="text-slate-400 block mb-1">
              Message Preview
            </Typography>
            <Typography className="text-white break-words">{body}</Typography>
          </Box>
        )}

        <Box className="bg-slate-950/70 p-3 rounded-lg border border-white/5 space-y-1">
          <Typography variant="subtitle2" className="font-bold flex items-center gap-1 text-accentBlue">
            <LocationIcon fontSize="small" /> Current Location Preview
          </Typography>
          {location?.mapsLink ? (
            <a href={location.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accentBlue hover:underline break-all block">
              {location.mapsLink}
            </a>
          ) : (
            <Typography variant="caption" className="text-slate-500">
              Location will be requested before sending.
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

        <Alert severity="info" sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: '#bae6fd' }}>
          SMS delivery opens your laptop's linked phone SMS app. Confirm Send there.
        </Alert>

        <Box className="space-y-2">
          <Typography variant="subtitle2" className="font-bold text-slate-300">
            Emergency Contacts
          </Typography>
          {activeContacts.length === 0 ? (
            <Alert severity="info" sx={{ bgcolor: 'rgba(56,189,248,0.1)', color: '#bae6fd' }}>
              No active contacts available.
            </Alert>
          ) : (
            activeContacts.map((contact) => (
              <FormControlLabel
                key={contact._id}
                control={
                  <Checkbox
                    checked={selectedContactIds.includes(contact._id)}
                    onChange={() => toggleSelection(contact._id)}
                    color="secondary"
                    sx={{ color: '#94a3b8' }}
                  />
                }
                label={
                  <Typography className="text-slate-200">
                    {contact.name} <span className="text-slate-500">({contact.relationship}, {contact.phone || contact.mobileNumber})</span>
                  </Typography>
                }
              />
            ))
          )}
        </Box>

        {result && (
          <Alert severity={alertSeverity} sx={{ borderRadius: '8px' }}>
            {result.message}
          </Alert>
        )}

        {result?.smsStatus?.length > 0 && (
          <Box className="space-y-2">
            {result.smsStatus.map((status, index) => (
              <Box key={`${status.phone}-${index}`} className="text-xs bg-slate-950 p-2 rounded border border-white/5 space-y-1">
                <Box className="flex justify-between gap-3">
                  <span className="text-white">{status.contactName} ({status.phone})</span>
                  <span className={isPositiveSmsStatus(status) ? 'text-accentGreen font-bold' : 'text-red-400 font-bold'}>
                    {status.status === 'ready_to_send' ? 'OPENED' : status.status.toUpperCase()}
                  </span>
                </Box>
                {status.error && (
                  <Typography variant="caption" className="block text-red-300 break-words">
                    {status.error}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {manualSmsStatuses.length > 0 && (
          <Box className="space-y-2 bg-slate-950 p-3 rounded border border-white/5">
            <Typography variant="subtitle2" className="font-bold text-slate-200">
              Send through linked phone
            </Typography>
            <Typography variant="caption" className="block text-slate-400">
              Opens your laptop's default SMS app. If Phone Link is registered, confirm Send there.
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {manualSmsStatuses.map((status, index) => (
                <Button
                  key={`${status.phone}-manual-${index}`}
                  component="a"
                  href={buildSmsUri({ phone: status.phone, body: manualSmsBody })}
                  variant="outlined"
                  size="small"
                  color="primary"
                  startIcon={<SmsIcon />}
                >
                  Open SMS app: {status.contactName}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Close
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SmsIcon />}
        >
          {loading ? 'Sending' : 'Send SMS'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactSelectionDialog;
