import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import Accordian from "../component/Accordion";
import Card from "../component/Card";
import { TfiLoop } from "react-icons/tfi";
import { MdOutlineSecurity } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";
import Footer from "../component/Footer";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const [code, setCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      navigate(`/file/${code}`);
    }
  };

  return (
    <>
      <div className="relative min-h-[85vh] w-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] text-white flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center px-4 py-20 max-w-5xl mx-auto animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-900/20 border border-orange-600/30 rounded-full text-orange-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Fast • Secure • Free</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 instrument-serif-regular leading-tight">
            Share Smarter.
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Convert Faster.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#a8a29e] mb-12 max-w-2xl mx-auto">
            Convert & share files in seconds. No sign-up needed. Your files are automatically deleted after 1 hour.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/upload")}
              className="group bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-medium transition-all hover:scale-105 shadow-lg shadow-orange-600/20 flex items-center gap-2"
            >
              <span>Upload & Convert</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-[#383838] hover:border-orange-600 text-white px-8 py-4 rounded-lg font-medium transition-all hover:scale-105 bg-[#171717]/50 backdrop-blur-sm"
            >
              Enter Code
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-orange-500">50MB</div>
              <div className="text-sm text-gray-400 mt-1">Max File Size</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">6+</div>
              <div className="text-sm text-gray-400 mt-1">Formats</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500">1hr</div>
              <div className="text-sm text-gray-400 mt-1">Auto Delete</div>
            </div>
          </div>
        </div>

        {/* Code Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-[#171717] border border-[#383838] p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-2">Enter File Code</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter the 6-character code to access your file
              </p>
              
              <div className="flex justify-center mb-6">
                <OtpInput
                  value={code}
                  onChange={setCode}
                  numInputs={6}
                  inputStyle={{
                    width: "50px",
                    height: "60px",
                    border: "2px solid #383838",
                    borderRadius: "8px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textAlign: "center",
                    backgroundColor: "#0c0a09",
                    color: "#e5e7eb",
                    margin: "4px",
                  }}
                  focusStyle={{
                    border: "2px solid #ea580c",
                    outline: "none",
                  }}
                  renderInput={(props) => <input {...props} />}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCodeSubmit}
                  disabled={code.length !== 6}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  Access File
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCode("");
                  }}
                  className="px-6 py-3 rounded-lg border border-[#383838] hover:border-orange-600 text-gray-400 hover:text-orange-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-[#0c0a09]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-orange-500">FlexShare</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card
              title="Instant File Conversion"
              description="Upload any file and get it converted in seconds — no sign up needed. Support for images, PDFs, and Word documents."
              icon={TfiLoop}
            />
            <Card
              title="Privacy-Focused"
              description="Your files are automatically deleted after 1 hour. We never store your data permanently. Share with confidence."
              icon={MdOutlineSecurity}
            />
            <Card
              title="Multiple Formats Supported"
              description="Convert between Word, PDF, PNG, JPG, JPEG, and WebP formats. More formats coming soon."
              icon={FaFileAlt}
            />
          </div>
        </div>
      </div>

      <Accordian />
      <Footer />
    </>
  );
}
