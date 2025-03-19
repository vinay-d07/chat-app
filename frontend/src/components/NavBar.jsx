import React from "react";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";

const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white text-gray-800 px-8 py-4 flex justify-between items-center shadow-md">
      <div className="text-2xl font-extrabold tracking-wide text-blue-600 hover:text-blue-700 transition duration-300 cursor-pointer">
        PROJECT 1
      </div>

      <div className="flex items-center space-x-8">
        <Link
          to="/chat"
          className="text-lg font-medium text-gray-600 hover:text-blue-600 transition duration-300"
        >
          Chat
        </Link>

        <UserDropdown
          userName="Jane Doe"
          onLogout={() => {
            console.log("Logging out..."), 
            localStorage.clear();
            window.location.href="/"
          }}
        />
      </div>
    </nav>
  );
};

export default NavBar;
