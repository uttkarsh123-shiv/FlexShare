import { Upload, Search, Shield, Clock, Zap, Users, RefreshCw, Lock, BarChart2 } from "lucide-react";
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
      <div className="hero-inner">
        <div className="hero-left">
          <h1 className="hero-title">
            Convert. Share.<br />
            Done <span className="hero-title-accent">Simple.</span>
          </h1>
          <p className="hero-subtitle">
            Convert files between formats and securely share them
            using a 6-digit code. No sign-up required.
          </p>
        </div>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={onUpload}>
            <Upload size={15} /> Upload &amp; Convert
          </button>
          <button className="btn-hero-secondary" onClick={onAccess}>
            <Search size={15} /> Access a File
          </button>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Lock,      style: "dark",
    title: "Secure Sharing",
    desc:  "Add password protection so only intended recipients can access your files.",
  },
  {
    icon: Clock,     style: "soft",
    title: "Automatic Expiry",
    desc:  "Files are removed after the expiry time you set — from 1 hour to 1 week.",
  },
  {
    icon: BarChart2, style: "dark",
    title: "Download Controls",
    desc:  "Limit how many times a file can be downloaded to maintain distribution control.",
  },
  {
    icon: RefreshCw, style: "soft",
    title: "13+ Formats",
    desc:  "Convert between Images, PDF, Word, Excel, PowerPoint and more.",
  },
  {
    icon: Users,     style: "dark",
    title: "No Account Required",
    desc:  "Upload and share instantly without registration or login.",
  },
  {
    icon: Zap,       style: "soft",
    title: "Fast Processing",
    desc:  "Queue-based background conversion ensures your files are ready quickly.",
  },
];

function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-inner">
        <div className="section-header">
          <h2 className="section-title">Everything you need to share files securely</h2>
          <p className="section-subtitle">Built for simplicity without compromising on control.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, style, title, desc }) => (
            <div key={title} className="feature-card">
              <div className={`feature-icon-wrap ${style}`}>
                <Icon size={20} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────────────────────────── */
const HOW_STEPS = [
  {
    icon: Upload,
    title: "Upload",
    desc:  "Select your file and choose conversion settings. Supports Images, PDF, Word, Excel, and more.",
  },
  {
    icon: RefreshCw,
    title: "Convert",
    desc:  "Files are processed securely in the background using our queue-based conversion system.",
  },
  {
    icon: Shield,
    title: "Share",
    desc:  "Receive a 6-digit code. Optionally add a password and set an expiry time.",
  },
];

function HowItWorksSection() {
  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="section-header">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">Three simple steps — no account needed.</p>
        </div>
        <div className="how-steps">
          {HOW_STEPS.map(({ icon: Icon, title, desc }, idx) => (
            <div key={title} className="how-step-wrapper">
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
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORMATS SECTION
───────────────────────────────────────────────────────────────────────────── */
const IMAGE_FORMATS = ["JPG", "PNG", "WEBP", "GIF", "BMP", "AVIF"];
const DOC_FORMATS = [
  "PDF → Word", "Word → PDF", "PDF → TXT",
  "Word → TXT", "Excel → PDF", "Excel → CSV", "PPT → PDF",
];

function FormatsSection() {
  return (
    <section className="formats-section">
      <div className="formats-inner">
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
      </div>
    </section>
  );
}
