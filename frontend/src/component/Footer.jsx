import { Github } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      borderTop: "1px solid #f0efee",
      background: "#ffffff",
      padding: "4rem 2.5rem 2.5rem",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        maxWidth: "1140px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        marginBottom: "3rem",
        alignItems: "start",
      }}>

        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "0.25rem",
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              background: "#f97316",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "14px",
              flexShrink: 0,
            }}>
              F
            </div>
            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1917", letterSpacing: "-0.01em" }}>
              FlexShare
            </span>
          </div>
          <p style={{
            fontSize: "0.875rem",
            color: "#78716c",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: "300px",
          }}>
            Secure file conversion and sharing made simple. No sign-up required.
          </p>
        </div>

        {/* Open Source */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <p style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#1c1917",
            margin: "0 0 0.25rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            Open Source
          </p>
          <p style={{ fontSize: "0.875rem", color: "#a8a29e", lineHeight: 1.65, margin: 0 }}>
            FlexShare is an open-source project built as a portfolio piece.
          </p>
          <a
            href="https://github.com/uttkarsh123-shiv"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.875rem",
              color: "#78716c",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "0.25rem",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
            onMouseLeave={e => e.currentTarget.style.color = "#78716c"}
          >
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: "1140px",
        margin: "0 auto",
        borderTop: "1px solid #f0efee",
        paddingTop: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ fontSize: "0.775rem", color: "#a8a29e", margin: 0 }}>
          © {year} FlexShare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
