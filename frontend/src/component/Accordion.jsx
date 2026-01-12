import { useEffect, useRef } from "react";
import "../styles/accordion.css";

export default function FAQAccordion() {
  const containerRef = useRef(null);

  useEffect(() => {
    const details = containerRef.current.querySelectorAll("details");

    const handleClick = (e) => {
      // Close all details if clicked outside the accordion
      if (!containerRef.current.contains(e.target)) {
        details.forEach((detail) => detail.removeAttribute("open"));
      }
    };

    const handleToggle = (clickedDetail) => {
      details.forEach((detail) => {
        if (detail !== clickedDetail) {
          detail.removeAttribute("open");
        }
      });
    };

    details.forEach((detail) => {
      detail.addEventListener("toggle", () => handleToggle(detail));
    });

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      details.forEach((detail) =>
        detail.removeEventListener("toggle", () => handleToggle(detail))
      );
    };
  }, []);

  return (
    <section ref={containerRef} id="about" className="accordion-section">
      <h2 className="accordion-title">About & FAQs</h2>

      <div className="accordion-container">
        <details className="accordion-item">
          <summary className="accordion-summary">
            What is Flexshare?
          </summary>
          <p className="accordion-content">
            Flexshare lets you convert and share files instantly via a secure
            code — no sign-up required.
          </p>
        </details>

        <details className="accordion-item">
          <summary className="accordion-summary">
            Are my files stored?
          </summary>
          <p className="accordion-content">
            No. Everything runs on your device or temporary memory. We don't
            store files.
          </p>
        </details>

        <details className="accordion-item">
          <summary className="accordion-summary">
            What file types are supported?
          </summary>
          <p className="accordion-content">
            Currently: Word, PDF, PNG, JPG. More formats will be added soon.
          </p>
        </details>

        <details className="accordion-item">
          <summary className="accordion-summary">
            How long is the code valid?
          </summary>
          <p className="accordion-content">
            Each share code is valid for 1 hour by default. You can customize the expiry time from 1 hour to 1 week when uploading.
          </p>
        </details>

        <details className="accordion-item">
          <summary className="accordion-summary">
            Do I need to install anything?
          </summary>
          <p className="accordion-content">
            No installation required. Flexshare runs fully in your browser —
            fast and secure.
          </p>
        </details>
      </div>
    </section>
  );
}