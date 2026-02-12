import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import Accordion from "../component/Accordion";
import Card from "../component/Card";
import { TfiLoop } from "react-icons/tfi";
import { MdOutlineSecurity } from "react-icons/md";
import { FaFileAlt } from "react-icons/fa";
import Footer from "../component/Footer";
import { ArrowRight, Sparkles } from "lucide-react";
import "../styles/hero-page.css";

export default function Hero() {
  const [code, setCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      // Convert to uppercase to match backend expectation
      navigate(`/file/${code.toUpperCase()}`);
    }
  };

  return (
    <>
      <div className="hero-page">
        {/* Animated Background Elements */}
        <div className="hero-animated-bg">
          <div className="hero-bg-element-1"></div>
          <div className="hero-bg-element-2"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4" />
            <span>Fast • Secure • Free</span>
          </div>
          
          <h1 className="hero-title">
             Convert smarter.
            <br />
            <span className="hero-title-accent">
              Share Faster.
            </span>
          </h1>
          
          <p className="hero-subtitle">
            Convert & share files in seconds. No sign-up needed. Your files are automatically deleted after 1 hour.
          </p>
          
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/upload")}
              className="hero-upload-btn"
            >
              <span>Upload & Convert</span>
              <ArrowRight className="arrow-icon" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="hero-code-btn"
            >
              Enter Code
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat-item">
              <div className="hero-stat-number">10MB</div>
              <div className="hero-stat-label">Max File Size</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">13+</div>
              <div className="hero-stat-label">Formats</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">1hr+</div>
              <div className="hero-stat-label">Auto Delete</div>
            </div>
          </div>
        </div>

        {/* Code Modal */}
        {showModal && (
          <div 
            className="code-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="code-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="code-modal-title text-2xl font-bold mb-2">Enter File Code</h2>
              <p className="code-modal-subtitle text-gray-400 text-sm mb-6">
                Enter the 6-character code to access your file
              </p>
              
              <div className="code-modal-otp flex justify-center mb-6">
                <OtpInput
                  value={code}
                  onChange={setCode}
                  numInputs={6}
                  inputStyle={{
                    width: "56px",
                    height: "68px",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    fontSize: "28px",
                    fontWeight: "700",
                    textAlign: "center",
                    backgroundColor: "rgba(12, 10, 9, 0.6)",
                    color: "#e5e7eb",
                    margin: "0 6px",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(8px)",
                  }}
                  focusStyle={{
                    border: "2px solid #ea580c",
                    outline: "none",
                    boxShadow: "0 0 0 4px rgba(234, 88, 12, 0.1)",
                    transform: "scale(1.05)",
                  }}
                  renderInput={(props) => <input {...props} />}
                />
              </div>
              
              <div className="code-modal-buttons flex gap-3">
                <button
                  onClick={handleCodeSubmit}
                  disabled={code.length !== 6}
                  className="code-modal-submit flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  Access File
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setCode("");
                  }}
                  className="code-modal-cancel px-6 py-3 rounded-lg border border-[#383838] hover:border-orange-600 text-gray-400 hover:text-orange-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section py-20 px-4 bg-[#0c0a09] flex justify-center">
        <div className="features-container max-w-6xl mx-auto">
          <h2 className="features-title text-4xl font-bold text-center mb-12">
            Why Choose <span className="features-title-accent text-orange-500">FlexShare</span>?
          </h2>
          <div className="features-grid grid md:grid-cols-3 gap-8">
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

      <Accordion />
      <Footer />
    </>
  );
}
