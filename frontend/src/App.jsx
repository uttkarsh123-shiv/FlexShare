import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ErrorFallback';
import Hero from './pages/Hero';
import UploadPage from './pages/UploadPage';
import FilePage from './pages/FilePage';
import './App.css';
import './styles/global-theme.css';
import Notfound from './pages/Notfound';
import Navbar from './component/Navbar';
import { ToastProvider } from './context/ToastContext';

const App = () => {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
      }}
    >
      <ToastProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/file/:code" element={<FilePage />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;