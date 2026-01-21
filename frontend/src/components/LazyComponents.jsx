import { lazy } from 'react';

// Lazy load file components with better loading experience
export const LazyFilePreview = lazy(() => 
  import('./file/FilePreview').then(module => ({
    default: module.default
  }))
);

export const LazyPasswordModal = lazy(() => 
  import('./file/PasswordModal').then(module => ({
    default: module.default
  }))
);

export const LazyFileStats = lazy(() => 
  import('./file/FileStats').then(module => ({
    default: module.default
  }))
);

export const LazyFileActions = lazy(() => 
  import('./file/FileActions').then(module => ({
    default: module.default
  }))
);

export const LazyFileInfo = lazy(() => 
  import('./file/FileInfo').then(module => ({
    default: module.default
  }))
);

// Lazy load pages
export const LazyFilePage = lazy(() => 
  import('../pages/FilePage').then(module => ({
    default: module.default
  }))
);

export const LazyUploadPage = lazy(() => 
  import('../pages/UploadPage').then(module => ({
    default: module.default
  }))
);

export const LazyHomePage = lazy(() => 
  import('../pages/Hero').then(module => ({
    default: module.default
  }))
);