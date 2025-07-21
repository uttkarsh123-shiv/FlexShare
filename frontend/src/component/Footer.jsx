export default function Footer() {
  return (
    <footer className="py-8 px-4 mt-40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Logo and Text */}
        <div className="text-center md:text-left">
          <h1 className="text-[#a8a29e]  text-xl font-semibold">Flexshare</h1>
          <p className="text-[#a8a29e]  text-sm">Effortless File Sharing</p>
        </div>

        {/* Links */}
        {/* <div className="flex space-x-6 text-sm">
          <a href="#faq" className="hover:text-orange-400">About</a>
          <a href="#faq" className="hover:text-orange-400">FAQs</a>
          <a href="/privacy" className="hover:text-orange-400">Privacy</a>
          <a href="/contact" className="hover:text-orange-400">Contact</a>
        </div> */}

        {/* Copyright */}
        <div className="text-sm text-center md:text-right text-[#a8a29e] ">
          © {new Date().getFullYear()} Flexshare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
