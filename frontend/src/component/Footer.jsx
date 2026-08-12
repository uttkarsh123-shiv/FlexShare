import { Github } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: "1px solid #000000", background: "#ffffff", padding: "5rem 3rem 3rem", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginBottom: "4rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.25rem" }}>
            <div style={{ width: "32px", height: "32px", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "14px" }}>F</div>
            <span style={{ fontSize: "1rem", fontWeight: 900, color: "#000000", textTransform: "uppercase", letterSpacing: "0.08em" }}>FlexShare</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#555555", lineHeight: 1.7, margin: 0, maxWidth: "300px" }}>Secure file conversion and sharing made simple. No sign-up required.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "#000000", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Open Source</p>
          <p style={{ fontSize: "0.875rem", color: "#888888", lineHeight: 1.65, margin: 0 }}>FlexShare is an open-source project built as a portfolio piece.</p>
          <a href="https://github.com/uttkarsh123-shiv" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.875rem", color: "#000000", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "0.25rem", fontWeight: 600, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f97316"} onMouseLeave={e => e.currentTarget.style.color = "#000000"}>
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </div>
      <div style={{ maxWidth: "1280px", margin: "0 auto", borderTop: "1px solid #e0e0e0", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#888888", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>© {year} FlexShare. All rights reserved.</p>
      </div>
    </footer>
  );
}
