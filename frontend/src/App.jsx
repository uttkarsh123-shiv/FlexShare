import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './pages/Hero';
import UploadPage from './pages/UploadPage';
import FilePage from './pages/FilePage';
import './App.css';
import './styles/global-theme.css';
import Notfound from './pages/Notfound';
import Navbar from './component/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const App = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;