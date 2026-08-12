import { Upload, Search, Shield, Clock, Zap, Users, RefreshCw,
  Lock, BarChart2 } from "lucide-react";
import Footer from "../component/Footer";
import "../styles/hero-page.css";

export default function Hero() {
  const openUpload = () => window.dispatchEvent(new CustomEvent("flexshare:open-upload"));
  const openAccess = () => window.dispatchEvent(new CustomEvent("flexshare:open-access"));

  return (
    <main>
      <HeroSection onUpload={openUpload} onAccess={openAccess} />
      <FeaturesSection />
      <HowItWorksSection />
      <FormatsSection />
      <Footer />
    </main>
  );
}

function HeroSection({ onUpload, onAccess }) {
  return (
    <section className="hero-section">
      {/* Left column */}
      <div className="hero-left">
        <h1 className="hero-title">
          Convert. Share.<br />
          Done <span className="hero-title-orange">Simple.</span>
        </h1>
        <p className="hero-subtitle">
          Convert files between multiple formats and securely share them using
          a 6-digit code. No sign-up required.
        </p>

        <div className="hero-cta-group">
          <button className="btn-orange" onClick={onUpload}>
            <Upload size={16} /> Upload File
          </button>
          <button className="btn-violet-outline" onClick={onAccess}>
            <Search size={16} /> Access File
          </button>
        </div>
      </div>

      {/* Right column — visual card */}
      <div className="hero-right">
        <div className="hero-visual-card">
          <div className="flow-steps">
            <div className="flow-step">
              <div className="flow-step-icon orange"><Upload size={22} /></div>
              <p className="flow-step-label">Upload</p>
              <p className="flow-step-sub">Any format</p>
            </div>
            <div className="flow-connector" />
            <div className="flow-step">
              <div className="flow-step-icon violet">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <p className="flow-step-label">Convert</p>
              <p className="flow-step-sub">13+ formats</p>
            </div>
            <div className="flow-connector" />
            <div className="flow-step">
              <div className="flow-step-icon orange"><Shield size={22} /></div>
              <p className="flow-step-label">Share</p>
              <p className="flow-step-sub">6-digit code</p>
            </div>
          </div>

          <div className="code-display">
            <p className="code-display-label">Share using code</p>
            <div className="code-boxes">
              {["7", "4", "2", "8", "1", "6"].map((d, i) => (
                <div key={i} className="code-box">{d}</div>
              ))}
            </div>
            <p className="code-display-sub">Secure · Private · Expires automatically</p>
          </div>

          <div className="visual-tags" style={{ marginTop: "1rem" }}>
            <span className="visual-tag">Password Protection</span>
            <span className="visual-tag">Expiry Control</span>
            <span className="visual-tag">Download Limits</span>
            <span className="visual-tag">13+ Formats</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES SECTION
═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Lock, color: "orange",
    title: "Secure Sharing",
    desc: "Add password protection to your files so only intended recipients can access them.",
  },
  {
    icon: Clock, color: "violet",
    title: "Automatic Expiry",
    desc: "Files are automatically removed after the expiry time you set — from 1 hour to 1 week.",
  },
  {
    icon: BarChart2, color: "orange",
    title: "Download Controls",
    desc: "Limit how many times a file can be downloaded to maintain control over distribution.",
  },
  {
    icon: RefreshCw, color: "violet",
    title: "Multiple Formats",
    desc: "Convert between Images, PDF, Word, Excel, PowerPoint and more — 13+ supported formats.",
  },
  {
    icon: Users, color: "orange",
    title: "No Account Required",
    desc: "Share files instantly without registration. Just upload and share the 6-digit code.",
  },
  {
    icon: Zap, color: "violet",
    title: "Fast Processing",
    desc: "Queue-based background conversion ensures your files are ready quickly and reliably.",
  },
];

function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="section-header">
        <h2 className="section-title">Everything you need to share files securely</h2>
        <p className="section-subtitle">Built for simplicity without compromising on control.</p>
      </div>
      <div className="features-grid">
        {FEATURES.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="feature-card">
            <div className={`feature-icon-wrap ${color}`}>
              <Icon size={20} />
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS SECTION
═══════════════════════════════════════════════════════════════════════════ */
const HOW_STEPS = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Upload your file and choose your conversion settings. Supports Images, PDF, Word, Excel, and more.",
  },
  {
    icon: RefreshCw,
    title: "Convert",
    desc: "Files are processed securely in the background using our queue-based conversion system.",
  },
  {
    icon: Shield,
    title: "Share",
    desc: "Receive a 6-digit code and share it with anyone. Optionally add a password and set an expiry.",
  },
];

function HowItWorksSection() {
  return (
    <section className="how-section">
      <div className="section-header">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Three simple steps</p>
      </div>
      <div className="how-steps">
        {HOW_STEPS.map(({ icon: Icon, title, desc }, idx) => (
          <div key={title} className="how-step-wrapper" style={{ display: 'contents' }}>
            <div className="how-step">
              <div className="how-step-num">{idx + 1}</div>
              <div className="how-step-icon-wrap"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            {idx < HOW_STEPS.length - 1 && <div className="how-connector" />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORMATS SECTION
═══════════════════════════════════════════════════════════════════════════ */
const IMAGE_FORMATS = ["JPG", "PNG", "WEBP", "GIF", "BMP", "AVIF"];
const DOC_FORMATS = [
  "PDF → Word", "Word → PDF", "PDF → TXT",
  "Word → TXT", "Excel → PDF", "Excel → CSV", "PPT → PDF",
];

function FormatsSection() {
  return (
    <section className="formats-section">
      <div className="section-header">
        <h2 className="section-title">Supported Conversions</h2>
        <p className="section-subtitle">From images to documents — we've got the formats you need.</p>
      </div>
      <div className="formats-grid">
        <div>
          <p className="formats-col-title">Images</p>
          <div className="format-pills">
            {IMAGE_FORMATS.map((f) => (
              <span key={f} className="format-pill">{f}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="formats-col-title">Documents</p>
          <div className="format-pills">
            {DOC_FORMATS.map((f) => (
              <span key={f} className="format-pill">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
