import React, { useState, useEffect } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { MdSupportAgent, MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="w-screen h-16 pt-3 bg-[#0c0a09] text-white flex justify-around items-center border-b border-[#383838] sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div 
        className="logo text-2xl instrument-serif-regular cursor-pointer hover:text-orange-400 transition"
        onClick={() => navigate("/")}
      >
        <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">
          FlexShare
        </span>
        <p className="text-[12px] text-[#a8a29e]">Effortless File Sharing</p>
      </div>
      <ul className="flex gap-5 text-[15px] items-center">
        <li>
          <button
            onClick={() => {
              const section = document.getElementById("about");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-orange-400 transition p-2 rounded-lg hover:bg-[#383838]"
            title="About"
          >
            <BsQuestionCircle size={20} />
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              window.location.href = "mailto:flexshare.support@gmail.com";
            }}
            className="hover:text-orange-400 transition p-2 rounded-lg hover:bg-[#383838]"
            title="Support"
          >
            <MdSupportAgent size={20} />
          </button>
        </li>
        <li>
          <button
            onClick={toggleTheme}
            className="hover:text-orange-400 transition p-2 rounded-lg hover:bg-[#383838]"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <MdOutlineLightMode size={20} />
            ) : (
              <MdOutlineDarkMode size={20} />
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
