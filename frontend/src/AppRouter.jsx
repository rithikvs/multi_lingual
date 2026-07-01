import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignPage from './pages/SignPage';
import SpeechPage from './pages/SpeechPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';

const AppRouter = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sign" element={<SignPage />} />
      <Route path="/speech" element={<SpeechPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
