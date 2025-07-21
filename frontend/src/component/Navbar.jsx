import React from "react";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdSupportAgent } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { BsQuestionCircle } from "react-icons/bs";

const Navbar = () => {
  return (
    <div className="w-screen h-15 pt-3 bg-[#0c0a09] text-white flex justify-around">
      <h1 className="logo text-2xl instrument-serif-regular">
        Flexshare
        <p className="text-[12px] text-[##a8a29e]">Effortless File Sharing</p>
      </h1>
      <ul className="flex gap-5 text-[15px]">
        <li>
          <button
            onClick={() => {
              const section = document.getElementById("about");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-orange-400"
          >
            <BsQuestionCircle size={19}/>
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              window.location.href = "mailto:flexshare.support@gmail.com";
            }}
            className="hover:text-orange-400"
          >
            <MdSupportAgent  size={19}/>
          </button>
        </li>
        <li>
          <button>
            <MdOutlineLightMode  size={19}/>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
