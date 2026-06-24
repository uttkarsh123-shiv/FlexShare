import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notfound from './pages/Notfound';
import Navbar from './component/Navbar';
import { ToastProvider } from './context/ToastContext';
import { LazyHomePage, LazyUploadPage, LazyFilePage } from './components/LazyComponents';
import { PageLoader } from './components/SuspenseLoaders';

const App = () => {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LazyHomePage />} />
            <Route path="/upload" element={<LazyUploadPage />} />
            <Route path="/file/:code" element={<LazyFilePage />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
};

export default App;
