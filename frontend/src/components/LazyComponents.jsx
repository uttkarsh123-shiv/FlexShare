import { lazy } from 'react';

export const LazyFilePreview    = lazy(() => import('./file/FilePreview'));
export const LazyPasswordModal  = lazy(() => import('./file/PasswordModal'));
export const LazyFileStats      = lazy(() => import('./file/FileStats'));
export const LazyFileActions    = lazy(() => import('./file/FileActions'));
export const LazyFileInfo       = lazy(() => import('./file/FileInfo'));

export const LazyFilePage       = lazy(() => import('../pages/FilePage'));
export const LazyUploadPage     = lazy(() => import('../pages/UploadPage'));
export const LazyHomePage       = lazy(() => import('../pages/Hero'));
