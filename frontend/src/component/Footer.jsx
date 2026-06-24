import { Github, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: "1px solid #e7e5e4",
      background: "#ffffff",
      padding: "3rem 2.5rem 2rem",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2.5rem",
        marginBottom: "2.5rem",
        alignItems: "start",
      }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.25rem" }}>
            <div style={{
              width: "28px", height: "28px", background: "#f97316",
              borderRadius: "7px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: 800, fontSize: "13px",
            }}>F</div>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917" }}>FlexShare</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#78716c", lineHeight: 1.6, margin: 0, maxWidth: "280px" }}>
            Secure file conversion and sharing made simple. No sign-up required.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1c1917", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Open Source
          </p>
          <p style={{ fontSize: "0.82rem", color: "#a8a29e", lineHeight: 1.6, margin: 0 }}>
            FlexShare is an open-source project built as a portfolio piece.
          </p>
          <a href="https://github.com/uttkarsh123-shiv" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.85rem", color: "#78716c", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "0.25rem" }}
            onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
            onMouseLeave={e => e.currentTarget.style.color = "#78716c"}>
            <Github size={14} /> Star on GitHub
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", borderTop: "1px solid #f0efee", paddingTop: "1.25rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#a8a29e", margin: 0 }}>
          © {year} FlexShare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
