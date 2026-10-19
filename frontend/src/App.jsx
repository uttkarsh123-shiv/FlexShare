import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notfound from './pages/Notfound';
import Navbar from './component/Navbar';
import { ToastProvider } from './context/ToastContext';
import { UploadQueueProvider } from './context/UploadQueueContext';
import { LazyHomePage, LazyUploadPage, LazyFilePage, LazyHistoryPage } from './components/LazyComponents';
import { PageLoader } from './components/SuspenseLoaders';

const App = () => {
  return (
    <ToastProvider>
      <UploadQueueProvider>
        <Router>
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LazyHomePage />} />
              <Route path="/upload" element={<LazyUploadPage />} />
              <Route path="/file/:code" element={<LazyFilePage />} />
              <Route path="/history" element={<LazyHistoryPage />} />
              <Route path="*" element={<Notfound />} />
            </Routes>
          </Suspense>
        </Router>
      </UploadQueueProvider>
    </ToastProvider>
  );
};

export default App;
