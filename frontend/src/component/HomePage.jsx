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
    <div className="p-8 text-center h-screen w-screen bg-[#0c0a09] text-white pt-40">
      <h1 className="text-7xl font-bold mb-6 instrument-serif-regular leading-10">Share Smarter. Convert Faster.</h1>
      <p className='text-[18px] text-[#a8a29e]'> Convert & share files in seconds. No sign-up needed.</p>
    <div className="btn-group mt-10">
            <button 
        onClick={() => navigate('/upload')}
        className="border border-orange-600 text-white px-5 py-2 rounded mr-4"
      >
        Upload
      </button>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded"
      >
        Enter Code
      </button>
    </div>

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
