import React from "react";
import { HelpCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <div className="navbar-logo-title">    <div className="footer-logo-icon">F</div>
        <h1 className="navbar-brand">FlexShare</h1></div>
     
        <p className="navbar-tagline">Effortless File Sharing</p>
      </div>
    </nav>
  );
};

export default Navbar;
