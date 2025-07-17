import React from "react";

const Navbar = () => {
  return (
    <div className="w-screen h-15 pt-3 bg-[#0c0a09] text-white flex justify-around">
      <h1 className="logo text-2xl instrument-serif-regular">Flexshare</h1>
      <ul className="flex gap-5">
        <li>Home</li>
        <li>Contact</li>
        <li>support</li>
      </ul>
    </div>
  );
};

export default Navbar;
