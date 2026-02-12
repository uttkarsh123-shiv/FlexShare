import { Mail, Github, ExternalLink, Heart, FileText, Shield, Zap } from 'lucide-react';
import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">F</div>
            <h3 className="footer-brand-name">FlexShare</h3>
          </div>
          <p className="footer-tagline">Effortless File Sharing & Conversion</p>
          <p className="footer-description">
            Convert and share files instantly with secure, temporary links. 
            No sign-up required, files auto-delete for your privacy.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4 className="footer-links-title">Features</h4>
          <ul className="footer-links-list">
            <li>
              <a href="#features" className="footer-link">
                <Zap className="footer-link-icon" />
                Instant Conversion
              </a>
            </li>
            <li>
              <a href="#features" className="footer-link">
                <Shield className="footer-link-icon" />
                Privacy Focused
              </a>
            </li>
            <li>
              <a href="#features" className="footer-link">
                <FileText className="footer-link-icon" />
                Multiple Formats
              </a>
            </li>
            <li>
              <a href="#about" className="footer-link">
                <ExternalLink className="footer-link-icon" />
                About & FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-contact">
          <h4 className="footer-contact-title">Get in Touch</h4>
          <div className="footer-contact-item">
            <Mail className="footer-contact-icon" />
            <a href="mailto:uttkarshsingh450@gmail.com" className="footer-email-link">
              uttkarshsingh450@gmail.com
            </a>
          </div>
          
          {/* Social Links */}
          <div className="footer-social">
            <a 
              href="mailto:uttkarshsingh450@gmail.com" 
              className="footer-social-link"
              title="Send Email"
            >
              <Mail className="footer-social-icon" />
            </a>
            <a 
              href="https://github.com/uttkarsh123-shiv" 
              className="footer-social-link"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="footer-social-icon" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} FlexShare. All rights reserved.
        </p>
        <p className="footer-made-with">
          Made with <Heart className="footer-heart" /> for seamless file sharing
        </p>
      </div>
    </footer>
  );
}
