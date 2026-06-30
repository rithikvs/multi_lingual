import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  ContactPhone as ContactIcon, 
  PersonOutlined as ProfileIcon 
} from '@mui/icons-material';

const Profile = ({ textScale }) => {
  // User Profile States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Contacts States
  const [contacts, setContacts] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPrimary, setContactPrimary] = useState(false);
  const [contactMsg, setContactMsg] = useState({ type: '', text: '' });
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchContacts();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsername(res.data.data.username);
        setEmail(res.data.data.email);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load emergency contacts:', err);
    }
  };

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    const token = localStorage.getItem('token');

    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', {
        username,
        email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
        
        // Update user object in storage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        storedUser.username = res.data.data.username;
        storedUser.email = res.data.data.email;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Add contact handler
  const handleAddContact = async (e) => {
    e.preventDefault();
    setContactsLoading(true);
    setContactMsg({ type: '', text: '' });
    const token = localStorage.getItem('token');

    // Phone format check (+ country prefix for SMS delivery)
    if (!contactPhone.startsWith('+')) {
      setContactMsg({ 
        type: 'error', 
        text: 'Phone number must include country code (e.g. +91XXXXXXXXXX or +1XXXXXXXXXX).' 
      });
      setContactsLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/contacts', {
        name: contactName,
        phone: contactPhone,
        relationship: contactRelation,
        isPrimary: contactPrimary
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setContactMsg({ type: 'success', text: 'Contact registered successfully!' });
        setContactName('');
        setContactPhone('');
        setContactRelation('');
        setContactPrimary(false);
        fetchContacts(); // Refresh list
      }
    } catch (err) {
      setContactMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add contact.' });
    } finally {
      setContactsLoading(false);
    }
  };

  // Delete contact handler
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
    } catch (err) {
      setContactMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete contact.' });
    }
  };

  return (
    <Container maxWidth="lg" className="py-8 px-4 md:px-8 space-y-8">
      
      {/* Page Header */}
      <Box className="bg-darkCard/35 p-5 rounded-2xl border border-white/5">
        <Typography variant="h4" className="font-extrabold text-white">
          Account Settings
        </Typography>
        <Typography variant="body2" className="text-slate-400">
          Manage your personal details and set up emergency SOS contacts.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* Left Column: Personal profile editor */}
        <Grid item xs={12} md={5}>
          <Card className="glass-panel p-2 shadow-xl h-full">
            <CardContent className="space-y-5">
              <Typography variant="h6" className="font-bold text-white flex items-center gap-2">
                <ProfileIcon color="primary" /> Profile Credentials
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {profileMsg.text && (
                <Alert severity={profileMsg.type} className="rounded-lg">{profileMsg.text}</Alert>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <TextField
                  label="Username"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />

                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={profileLoading}
                  sx={{
                    background: 'linear-gradient(to right, #38bdf8, #10b981)',
                    color: '#0f172a',
                    fontWeight: 'bold',
                    py: 1.2
                  }}
                >
                  {profileLoading ? <CircularProgress size={20} /> : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Emergency contacts registry */}
        <Grid item xs={12} md={7}>
          <Card className="glass-panel p-2 shadow-xl h-full flex flex-col justify-between">
            <CardContent className="space-y-5">
              <Typography variant="h6" className="font-bold text-white flex items-center gap-2">
                <ContactIcon color="secondary" /> Emergency SOS Contacts
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {contactMsg.text && (
                <Alert severity={contactMsg.type} className="rounded-lg">{contactMsg.text}</Alert>
              )}

              {/* Add contact form */}
              <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Contact Name"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />

                <TextField
                  label="Phone Number (e.g. +919876543210)"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91..."
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />

                <TextField
                  label="Relationship (e.g. Mother, Father)"
                  required
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contactPrimary}
                      onChange={(e) => setContactPrimary(e.target.checked)}
                      color="secondary"
                      sx={{ color: '#94a3b8' }}
                    />
                  }
                  label={<Typography className="text-slate-300">Set as primary alert contact</Typography>}
                />

                <Box className="md:col-span-2">
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={contactsLoading}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {contactsLoading ? <CircularProgress size={20} /> : 'Register Contact'}
                  </Button>
                </Box>
              </form>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Registered contacts lists */}
              <Box className="space-y-3 mt-4">
                <Typography variant="subtitle2" className="text-slate-400 font-bold uppercase tracking-wider">
                  Current Mappings
                </Typography>
                
                {contacts.length === 0 ? (
                  <Box className="text-center p-6 text-slate-500 italic border border-white/5 rounded-xl bg-slate-950/30">
                    No emergency contacts registered. Please add contacts to enable the SOS feature.
                  </Box>
                ) : (
                  <Box className="space-y-2">
                    {contacts.map((contact) => (
                      <Box 
                        key={contact._id} 
                        className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-white/5"
                      >
                        <Box>
                          <Typography className="font-bold text-white flex items-center gap-2">
                            {contact.name} 
                            {contact.isPrimary && (
                              <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                                PRIMARY
                              </span>
                            )}
                          </Typography>
                          <Typography variant="body2" className="text-slate-400">
                            Relation: {contact.relationship} | Phone: {contact.phone}
                          </Typography>
                        </Box>
                        
                        <IconButton 
                          onClick={() => handleDeleteContact(contact._id)} 
                          color="error" 
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
    </Container>
  );
};

export default Profile;
