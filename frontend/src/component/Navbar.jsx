import { useState } from "react";
import { Upload, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      navigate(`/file/${code.toUpperCase()}`);
      setShowModal(false);
      setCode("");
    }
  };

  const closeModal = () => { setShowModal(false); setCode(""); };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <div className="navbar-logo-title">
            <div className="footer-logo-icon">F</div>
            <h1 className="navbar-brand">FlexShare</h1>
          </div>
          <p className="navbar-tagline">Effortless File Sharing</p>
        </div>

        {/* Right side */}
        <div className="navbar-actions">
          <button onClick={() => setShowModal(true)} className="navbar-btn-ghost">
            <Hash size={15} />
            Enter Code
          </button>
          <button onClick={() => navigate("/upload")} className="navbar-btn-primary">
            <Upload size={15} />
            Upload File
          </button>
        </div>
      </nav>

      {/* Global code modal — works on any route */}
      {showModal && (
        <div className="code-modal-overlay" onClick={closeModal}>
          <div className="code-modal" onClick={e => e.stopPropagation()}>
            <h2 className="code-modal-title">Enter File Code</h2>
            <p className="code-modal-subtitle">
              Enter the 6-character code to access your file
            </p>

            <div className="code-modal-otp">
              <OtpInput
                value={code}
                onChange={setCode}
                numInputs={6}
                inputStyle={{
                  width: '56px', height: '68px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', fontSize: '28px', fontWeight: '700',
                  textAlign: 'center',
                  backgroundColor: 'rgba(12,10,9,0.6)',
                  color: '#e5e7eb', margin: '0 6px',
                  transition: 'all 0.3s ease',
                }}
                focusStyle={{
                  border: '2px solid #ea580c', outline: 'none',
                  boxShadow: '0 0 0 4px rgba(234,88,12,0.1)',
                }}
                renderInput={props => <input {...props} />}
              />
            </div>

            <div className="code-modal-buttons">
              <button
                onClick={handleCodeSubmit}
                disabled={code.length !== 6}
                className="code-modal-submit"
              >
                Access File
              </button>
              <button onClick={closeModal} className="code-modal-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
