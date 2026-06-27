import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import LoadingOverlay from './components/LoadingOverlay';
import Landing from './pages/Landing';
import Payment from './pages/Payment';
import IntakeForm from './pages/IntakeForm';
import ResumePreview from './pages/ResumePreview';
import LinkedInRewriter from './pages/LinkedInRewriter';
import CoverLetter from './pages/CoverLetter';
import SuccessScreen from './pages/SuccessScreen';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <LoadingOverlay />
        <Toast />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/form" element={<IntakeForm />} />
          <Route path="/preview" element={<ResumePreview />} />
          <Route path="/linkedin" element={<LinkedInRewriter />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
          <Route path="/success" element={<SuccessScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
