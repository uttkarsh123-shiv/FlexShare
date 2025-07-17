// pages/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import Demo from '../../../frontend/src/Demo';

export default function HomePage() {
  const [code, setCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
    {/* <Demo /> */}
    <div className="p-8 text-center h-screen w-screen bg-[#0c0a09] text-white">
      <h1 className="text-2xl font-bold mb-6">File Sharing & Conversion</h1>
      <button 
        onClick={() => navigate('/upload')}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
      >
        Upload
      </button>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Enter Code
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl mb-4">Enter Code</h2>
            <input 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border px-2 py-1 mb-4 w-full"
              placeholder="Enter code"
            />
            <div>
              <button 
                onClick={() => navigate(`/file/${code}`)}
                className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
              >
                Submit
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
