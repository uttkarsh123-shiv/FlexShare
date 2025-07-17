import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hero from './pages/Hero';
import UploadPage from './pages/UploadPage';
import FilePage from './pages/FilePage';
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/file/:code" element={<FilePage />} />
      </Routes>
    </Router>
  );
}

export default App;