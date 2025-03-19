import { useState, useRef, useEffect, useContext } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { ChatContext } from "../Context/ChatContext";

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useContext(ChatContext);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none"
      >
        <FiUser className="text-lg bg-grey-100" />
        <span className="font-medium">{user.name}</span>
        <FiChevronDown
          className={`text-sm transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
          <div className="flex flex-col py-2">
            {/* Profile */}
            <button className="flex items-center px-4 py-2 text-gray-700 bg-grey-200 hover:bg-gray-100 transition duration-200">
              <FiUser className="mr-2 bg-grey-200" /> Profile
            </button>

            {/* Optional Settings */}
            {/* <button
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              <FiSettings className="mr-2" /> Settings
            </button> */}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 transition duration-200"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
