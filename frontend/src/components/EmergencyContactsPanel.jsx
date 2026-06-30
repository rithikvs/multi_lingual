import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  ContactPhone as ContactIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { api, getAuthHeaders } from '../utils/api';

const emptyForm = {
  name: '',
  phone: '',
  relationship: '',
  isActive: true
};

const EmergencyContactsPanel = ({ contacts, setContacts, selectedContactIds, setSelectedContactIds }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const token = localStorage.getItem('token');

  const fetchContacts = async () => {
    if (!token) return;

    setLoading(true);
    setNotice(null);
    try {
      const response = await api.get('/api/emergency/contacts', {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setContacts(response.data.data);
        setSelectedContactIds((current) => current.filter((id) => response.data.data.some((contact) => contact._id === id)));
      }
    } catch (error) {
      setNotice({
        severity: 'error',
        message: error.response?.data?.message || 'Could not load emergency contacts.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setNotice({ severity: 'warning', message: 'Log in to save emergency contacts in MongoDB.' });
      return;
    }

    setLoading(true);
    setNotice(null);
    try {
      const request = editingId
        ? api.put(`/api/emergency/contacts/${editingId}`, form, { headers: getAuthHeaders() })
        : api.post('/api/emergency/contacts', form, { headers: getAuthHeaders() });
      const response = await request;

      if (response.data.success) {
        setNotice({
          severity: 'success',
          message: editingId ? 'Contact updated.' : 'Contact added.'
        });
        resetForm();
        fetchContacts();
      }
    } catch (error) {
      setNotice({
        severity: 'error',
        message: error.response?.data?.message || 'Could not save contact.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact._id);
    setForm({
      name: contact.name,
      phone: contact.phone || contact.mobileNumber,
      relationship: contact.relationship,
      isActive: contact.isActive !== false
    });
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Delete this emergency contact?')) return;

    setLoading(true);
    try {
      await api.delete(`/api/emergency/contacts/${contactId}`, {
        headers: getAuthHeaders()
      });
      setSelectedContactIds((current) => current.filter((id) => id !== contactId));
      fetchContacts();
    } catch (error) {
      setNotice({
        severity: 'error',
        message: error.response?.data?.message || 'Could not delete contact.'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (contactId) => {
    setSelectedContactIds((current) => (
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    ));
  };

  return (
    <Paper className="glass-panel p-5 space-y-5 border border-white/5 shadow-xl">
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h6" className="font-bold text-white flex items-center gap-2">
            <ContactIcon color="secondary" /> Emergency Contacts
          </Typography>
          <Typography variant="caption" className="text-slate-400">
            Store contact numbers for SOS and chat SMS delivery.
          </Typography>
        </Box>
        {loading && <CircularProgress size={24} color="secondary" />}
      </Box>

      {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <TextField
          label="Name"
          required
          size="small"
          value={form.name}
          onChange={(event) => updateForm('name', event.target.value)}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } } }}
        />
        <TextField
          label="Mobile Number"
          required
          size="small"
          placeholder="+919876543210"
          value={form.phone}
          onChange={(event) => updateForm('phone', event.target.value)}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } } }}
        />
        <TextField
          label="Relationship"
          required
          size="small"
          value={form.relationship}
          onChange={(event) => updateForm('relationship', event.target.value)}
          InputLabelProps={{ style: { color: '#94a3b8' } }}
          sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' } } }}
        />
        <Box className="flex items-center gap-2">
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(event) => updateForm('isActive', event.target.checked)}
                color="success"
              />
            }
            label={<Typography className="text-slate-300 text-sm">Active</Typography>}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            startIcon={editingId ? <SaveIcon /> : <AddIcon />}
          >
            {editingId ? 'Save' : 'Add'}
          </Button>
          {editingId && (
            <Tooltip title="Cancel edit">
              <IconButton onClick={resetForm} color="inherit" sx={{ color: '#94a3b8' }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </form>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <Box className="space-y-3">
        {contacts.length === 0 ? (
          <Box className="text-center p-5 text-slate-500 italic border border-white/5 rounded-xl bg-slate-950/30">
            No emergency contacts saved yet.
          </Box>
        ) : (
          contacts.map((contact) => {
            const isActive = contact.isActive !== false;
            return (
              <Box
                key={contact._id}
                className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-4 rounded-xl border border-white/5"
              >
                <Box className="flex items-center gap-3">
                  <Checkbox
                    checked={false}
                    onChange={() => toggleSelection(contact._id)}
                    disabled
                    color="secondary"
                    sx={{ color: '#94a3b8' }}
                  />
                  <Box>
                    <Typography className="font-bold text-white">
                      {contact.name}
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </Typography>
                    <Typography variant="body2" className="text-slate-400">
                      {contact.relationship} | {contact.phone || contact.mobileNumber}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Tooltip title="Edit contact">
                    <IconButton onClick={() => handleEdit(contact)} color="inherit" sx={{ color: '#94a3b8' }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete contact">
                    <IconButton onClick={() => handleDelete(contact._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default EmergencyContactsPanel;
