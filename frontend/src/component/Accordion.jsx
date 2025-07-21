import { useEffect, useRef } from "react";

export default function FAQAccordion({id}) {
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
    <section ref={containerRef} id="about" className="max-w-4xl mx-auto mt-60 px-4">
      <h2 className="text-3xl font-semibold text-white mb-6">About & FAQs</h2>

      <div className="space-y-4">
        <details className="bg-[#111] p-4 rounded-lg border border-white/10">
          <summary className="cursor-pointer text-lg text-orange-400 font-medium">
            What is Flexshare?
          </summary>
          <p className="text-[#a8a29e] mt-2">
            Flexshare lets you convert and share files instantly via a secure
            code — no sign-up required.
          </p>
        </details>

        <details className="bg-[#111] p-4 rounded-lg border border-white/10">
          <summary className="cursor-pointer text-lg text-orange-400 font-medium">
            Are my files stored?
          </summary>
          <p className="text-[#a8a29e] mt-2">
            No. Everything runs on your device or temporary memory. We don’t
            store files.
          </p>
        </details>

        <details className="bg-[#111] p-4 rounded-lg border border-white/10">
          <summary className="cursor-pointer text-lg text-orange-400 font-medium">
            What file types are supported?
          </summary>
          <p className="text-[#a8a29e] mt-2">
            Currently: Word, PDF, PNG, JPG. More formats will be added soon.
          </p>
        </details>

        <details className="bg-[#111] p-4 rounded-lg border border-white/10">
          <summary className="cursor-pointer text-lg text-orange-400 font-medium">
            How long is the code valid?
          </summary>
          <p className="text-[#a8a29e] mt-2">
            Each share code is valid for 10 minutes. After that, the file is
            deleted automatically.
          </p>
        </details>

        <details className="bg-[#111] p-4 rounded-lg border border-white/10">
          <summary className="cursor-pointer text-lg text-orange-400 font-medium">
            Do I need to install anything?
          </summary>
          <p className="text-[#a8a29e] mt-2">
            No installation required. Flexshare runs fully in your browser —
            fast and secure.
          </p>
        </details>
      </div>
    </section>
  );
}
