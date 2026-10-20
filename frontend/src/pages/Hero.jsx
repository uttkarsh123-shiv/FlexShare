import { Upload, Search, Shield, Clock, Zap, Users, RefreshCw, Lock, BarChart2, Download, Key } from "lucide-react";
import Footer from "../component/Footer";
import "../styles/hero-page.css";

export default function Hero() {
  const openUpload = () => window.dispatchEvent(new CustomEvent("flexshare:open-upload"));
  const openAccess = () => window.dispatchEvent(new CustomEvent("flexshare:open-access"));

  return (
    <main style={{ background: "var(--bg-soft)" }}>
      <HeroSection onUpload={openUpload} onAccess={openAccess} />
      <div className="section-divider" />
      <FeaturesSection />
      <div className="section-divider" />
      <HowItWorksSection />
      <div className="section-divider" />
      <FormatsSection />
      <div className="section-divider" />
      <FAQSection />
      <Footer />
    </main>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */
function HeroSection({ onUpload, onAccess }) {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-left">
          <h1 className="hero-title">
            Convert files.<br />
            Share with a <span className="hero-title-accent">6-digit code.</span>
          </h1>
          <p className="hero-subtitle">
            Upload any file, convert it to another format, and share it instantly via a short code.
            Password protection, expiry, and download limits — no account needed.
          </p>
          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={onUpload}>
              <Upload size={16} /> Upload &amp; Convert
            </button>
            <button className="btn-hero-secondary" onClick={onAccess}>
              <Search size={16} /> Enter a Code
            </button>
          </div>
          <div className="hero-pills">
            {["No sign-up", "15+ formats", "Auto-expiry", "Password protect", "Free"].map(p => (
              <span key={p} className="hero-pill">
                <span className="hero-pill-check">✓</span> {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Lock, style: "soft",
    title: "Password Protection",
    desc: "Encrypt access with a password. Only people with the code AND the password can download.",
  },
  {
    icon: Clock, style: "dark",
    title: "Auto-Expiry",
    desc: "Set files to expire from 1 hour to 7 days. Expired files are automatically deleted from storage.",
  },
  {
    icon: BarChart2, style: "soft",
    title: "Download Limits",
    desc: "Cap downloads at 1–100. Once the limit is hit, the file becomes inaccessible.",
  },
  {
    icon: RefreshCw, style: "dark",
    title: "15+ Conversion Formats",
    desc: "Images (PNG, JPG, WebP, AVIF, GIF, BMP), PDF ↔ Word, Excel → CSV/PDF, PPT → PDF.",
  },
  {
    icon: Zap, style: "soft",
    title: "Queue-Based Processing",
    desc: "Conversions run in a background worker via BullMQ + Redis — fast, non-blocking, reliable.",
  },
  {
    icon: Users, style: "dark",
    title: "No Account Required",
    desc: "Just upload and share. Your file history is stored locally in your browser.",
  },
];

function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-inner">
        <div className="section-header">
          <h2 className="section-title">Built for secure, temporary file sharing</h2>
          <p className="section-subtitle">Every feature exists to give you control over who gets your files and for how long.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, style, title, desc }) => (
            <div key={title} className="feature-card">
              <div className={`feature-icon-wrap ${style}`}>
                <Icon size={22} />
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

/* ── How It Works ─────────────────────────────────────────────────────────── */
const HOW_STEPS = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Pick a file (up to 10 MB). Choose a conversion format or share it as-is.",
  },
  {
    icon: RefreshCw,
    title: "Convert",
    desc: "If you chose a format, a background worker converts it and stores the result securely in S3.",
  },
  {
    icon: Key,
    title: "Configure",
    desc: "Set an expiry time, optional password, and a download limit before sharing.",
  },
  {
    icon: Download,
    title: "Share",
    desc: "You get a 6-digit code. Recipient enters it, downloads via a secure presigned URL — direct from S3.",
  },
];

function HowItWorksSection() {
  return (
    <section className="how-section">
      <div className="how-inner">
        <div className="section-header">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">Four steps from file to recipient. No proxying, no storing passwords in plaintext.</p>
        </div>
        <div className="how-steps" style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr" }}>
          {HOW_STEPS.map(({ icon: Icon, title, desc }, idx) => (
            <div key={title} style={{ display: "contents" }}>
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

/* ── Formats ──────────────────────────────────────────────────────────────── */
const IMAGE_CONVERSIONS = [
  "Image → PNG", "Image → JPG", "Image → WebP",
  "Image → GIF", "Image → BMP", "Image → AVIF", "Image → PDF",
];
const DOC_CONVERSIONS = [
  "PDF → Word", "PDF → TXT",
  "Word → PDF", "Word → TXT",
  "Excel → PDF", "Excel → CSV",
  "PPT → PDF",
];

function FormatsSection() {
  return (
    <section className="formats-section">
      <div className="formats-inner">
        <div className="section-header">
          <h2 className="section-title">Supported conversions</h2>
          <p className="section-subtitle">Images handled by Sharp. Documents handled by LibreOffice — running in a Docker worker on Render.</p>
        </div>
        <div className="formats-grid">
          <div>
            <p className="formats-col-title">Images</p>
            <div className="format-pills">
              {IMAGE_CONVERSIONS.map(f => <span key={f} className="format-pill">{f}</span>)}
            </div>
          </div>
          <div>
            <p className="formats-col-title">Documents</p>
            <div className="format-pills">
              {DOC_CONVERSIONS.map(f => <span key={f} className="format-pill">{f}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Do I need an account?",
    a: "No. Upload, convert, and share entirely without signing up. Your upload history is saved in your browser's local storage.",
  },
  {
    q: "Where are my files stored?",
    a: "Files are uploaded to AWS S3 with private access. Nobody can access them directly — downloads go through a short-lived presigned URL generated by the API.",
  },
  {
    q: "How long do files last?",
    a: "You choose: 1 hour, 6 hours, 12 hours, 1 day, 3 days, or 1 week. After expiry the file is deleted from S3 and the database automatically.",
  },
  {
    q: "Is password protection secure?",
    a: "Passwords are hashed with bcrypt before being stored. The raw password is never saved anywhere.",
  },
  {
    q: "What is the file size limit?",
    a: "10 MB per file, enforced at the API level.",
  },
  {
    q: "What happens after the download limit is reached?",
    a: "The file is still stored until it expires, but any further download attempt returns a 403 error.",
  },
];

function FAQSection() {
  return (
    <section style={{ background: "var(--bg-soft)", padding: "5rem 2.5rem 6rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 className="section-title">Frequently asked questions</h2>
        </div>
        <div style={{ border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
          {FAQS.map(({ q, a }, i) => (
            <details key={q} className="accordion-item" style={{ borderBottom: i < FAQS.length - 1 ? "1px solid var(--bg-border)" : "none" }}>
              <summary className="accordion-summary">{q}</summary>
              <p className="accordion-content">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
