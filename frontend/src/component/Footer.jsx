import { Github, ExternalLink } from "lucide-react";
import "../styles/footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              {/* Orange — logo icon only, one accent touch */}
              <div className="footer-logo-icon">F</div>
              <span className="footer-brand-name">FlexShare</span>
            </div>
            <p className="footer-tagline">
              Secure file conversion and sharing made simple.
              No sign-up, no fuss.
            </p>
          </div>

          {/* Product */}
          <div className="footer-col">
            <p className="footer-col-title">Product</p>
            <button
              className="footer-link"
              onClick={() => window.dispatchEvent(new CustomEvent("flexshare:open-upload"))}
            >
              Upload &amp; Convert
            </button>
            <button
              className="footer-link"
              onClick={() => window.dispatchEvent(new CustomEvent("flexshare:open-access"))}
            >
              Access a File
            </button>
          </div>

          {/* Project */}
          <div className="footer-col">
            <p className="footer-col-title">Open Source</p>
            <a
              href="https://github.com/uttkarsh123-shiv"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Github size={14} /> GitHub
              <ExternalLink size={11} style={{ opacity: 0.5 }} />
            </a>
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", margin: 0, lineHeight: 1.55 }}>
              Built as an open-source portfolio project.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} FlexShare. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a
              href="https://github.com/uttkarsh123-shiv"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-bottom-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
