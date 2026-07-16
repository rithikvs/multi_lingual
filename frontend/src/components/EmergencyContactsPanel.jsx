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
    <Paper className="surface-card p-5 space-y-5">
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactIcon color="secondary" /> Emergency Contacts
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Store contact numbers for SOS and chat SMS delivery.
          </Typography>
        </Box>
        {loading && <CircularProgress size={24} color="secondary" />}
      </Box>

      {notice && <Alert severity={notice.severity}>{notice.message}</Alert>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <TextField label="Name" required size="small" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
        <TextField label="Mobile Number" required size="small" placeholder="+919876543210" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
        <TextField label="Relationship" required size="small" value={form.relationship} onChange={(e) => updateForm('relationship', e.target.value)} />
        <Box className="flex items-center gap-2">
          <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => updateForm('isActive', e.target.checked)} color="success" />} label="Active" />
          <Button type="submit" variant="contained" color="secondary" disabled={loading} startIcon={editingId ? <SaveIcon /> : <AddIcon />}>
            {editingId ? 'Save' : 'Add'}
          </Button>
          {editingId && (
            <Tooltip title="Cancel edit">
              <IconButton onClick={resetForm}><CloseIcon /></IconButton>
            </Tooltip>
          )}
        </Box>
      </form>

      <Divider />

      <Box className="space-y-3">
        {contacts.length === 0 ? (
          <Box className="text-center p-5 text-slate-400 italic border border-slate-200 rounded-xl bg-slate-50">
            No emergency contacts saved yet.
          </Box>
        ) : (
          contacts.map((contact) => {
            const isActive = contact.isActive !== false;
            const isSelected = selectedContactIds.includes(contact._id);
            return (
              <Box key={contact._id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Box className="flex items-center gap-3">
                  <Checkbox checked={isSelected} onChange={() => toggleSelection(contact._id)} color="primary" />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {contact.name}
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {contact.relationship} | {contact.phone || contact.mobileNumber}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Tooltip title="Edit contact"><IconButton onClick={() => handleEdit(contact)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Delete contact"><IconButton onClick={() => handleDelete(contact._id)} color="error"><DeleteIcon /></IconButton></Tooltip>
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
