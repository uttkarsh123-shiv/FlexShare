import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SimpleErrorFallback } from '../components/ErrorFallback';
import { PageLoader } from '../components/SuspenseLoaders';

// Lazy load all pages for better code splitting
import { 
  LazyHomePage, 
  LazyUploadPage, 
  LazyFilePage 
} from '../components/LazyComponents';

const LazyRoutes = () => {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application routing error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<PageLoader message="Loading page..." />}>
        <Routes>
          <Route 
            path="/" 
            element={
              <ErrorBoundary 
                FallbackComponent={SimpleErrorFallback}
                onError={(error) => console.error('Home page error:', error)}
              >
                <Suspense fallback={<PageLoader message="Loading home..." />}>
                  <LazyHomePage />
                </Suspense>
              </ErrorBoundary>
            } 
          />
          
          <Route 
            path="/upload" 
            element={
              <ErrorBoundary 
                FallbackComponent={SimpleErrorFallback}
                onError={(error) => console.error('Upload page error:', error)}
              >
                <Suspense fallback={<PageLoader message="Loading upload..." />}>
                  <LazyUploadPage />
                </Suspense>
              </ErrorBoundary>
            } 
          />
          
          <Route 
            path="/file/:code" 
            element={
              <ErrorBoundary 
                FallbackComponent={SimpleErrorFallback}
                onError={(error) => console.error('File page error:', error)}
              >
                <Suspense fallback={<PageLoader message="Loading file..." />}>
                  <LazyFilePage />
                </Suspense>
              </ErrorBoundary>
            } 
          />
          
          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a 
                    href="/" 
                    className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white font-medium transition"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoutes;