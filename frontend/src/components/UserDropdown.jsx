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
        className="flex items-center space-x-3 bg-gray-700/50 text-white px-4 py-2 rounded-lg hover:bg-gray-600/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-sm font-medium">{user.name[0]?.toUpperCase()}</span>
        </div>
        <span className="font-medium">{user.name}</span>
        <FiChevronDown
          className={`text-sm transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="flex flex-col py-1">
            <button className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700/50 transition-colors">
              <FiUser className="mr-3" /> Profile
            </button>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-3 text-red-400 hover:bg-gray-700/50 transition-colors"
            >
              <FiLogOut className="mr-3" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
