import { createContext, useContext, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { addToHistory } from '../hooks/useFileHistory';

const API_URL = import.meta.env.VITE_API_URL;

// Job statuses: 'uploading' | 'converting' | 'done' | 'failed'

const UploadQueueContext = createContext(null);

export function UploadQueueProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const jobIdRef = useRef(0);

  const updateJob = useCallback((id, patch) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  }, []);

  const removeJob = useCallback((id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const clearDone = useCallback(() => {
    setJobs(prev => prev.filter(j => j.status === 'uploading' || j.status === 'converting'));
  }, []);

  const enqueue = useCallback(async ({
    file, conversionType, description, expiryHours, password, maxDownloads,
  }) => {
    const id = ++jobIdRef.current;
    const job = {
      id,
      fileName: file.name,
      conversionType: conversionType || 'none',
      status: 'uploading',
      progress: 0,
      code: null,
      error: null,
      expiryHours,
    };
    setJobs(prev => [job, ...prev]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversionType', conversionType || 'none');
    formData.append('description', description || '');
    formData.append('expiryHours', (expiryHours || 1).toString());
    if (password?.trim()?.length >= 4) formData.append('password', password.trim());
    if (maxDownloads) {
      const dl = parseInt(maxDownloads, 10);
      if (!isNaN(dl) && dl >= 1 && dl <= 100) formData.append('maxDownloads', dl.toString());
    }

    try {
      const res = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          updateJob(id, { progress: Math.round((e.loaded * 100) / e.total) });
        },
        timeout: 300000,
      });

      if (res.data.status === 'pending') {
        updateJob(id, { status: 'converting', progress: 100 });
        const pollCode = res.data.code;
        await new Promise((resolve, reject) => {
          const iv = setInterval(async () => {
            try {
              const sr = await axios.get(`${API_URL}/api/uploads/status/${pollCode}`);
              if (sr.data.status === 'done') { clearInterval(iv); resolve(); }
              else if (sr.data.status === 'failed') { clearInterval(iv); reject(new Error('Conversion failed on server')); }
            } catch (e) { clearInterval(iv); reject(e); }
          }, 2000);
        });
      }

      const code = res.data.code;
      updateJob(id, { status: 'done', code, progress: 100 });
      addToHistory({ code, fileName: file.name, conversionType: conversionType || 'none', expiryHours });

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors || err.message || 'Upload failed';
      updateJob(id, { status: 'failed', error: msg });
    }
  }, [updateJob]);

  const activeCount = jobs.filter(j => j.status === 'uploading' || j.status === 'converting').length;

  return (
    <UploadQueueContext.Provider value={{ jobs, enqueue, removeJob, clearDone, activeCount }}>
      {children}
    </UploadQueueContext.Provider>
  );
}

export function useUploadQueue() {
  const ctx = useContext(UploadQueueContext);
  if (!ctx) throw new Error('useUploadQueue must be used inside UploadQueueProvider');
  return ctx;
}
