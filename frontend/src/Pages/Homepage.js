import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans selection:bg-[#111111] selection:text-white antialiased flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[#E8E8E8] bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="font-bold text-lg tracking-tight">talkative</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors">
              Features
            </a>
            <a href="/#about" className="text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors">
              Overview
            </a>
          </div>

          {/* CTA */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-[#E8E8E8] hover:border-[#111111] text-[#111111] text-xs font-bold px-5 py-3 rounded-full transition-colors bg-white shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="flex flex-col w-full max-w-md gap-8 relative z-10">
          
          {/* Auth Card */}
          <div className="bg-white w-full p-8 rounded-[32px] border border-[#E8E8E8] shadow-sm">
            {/* Tab Switcher */}
            <div className="flex border-b-2 border-[#E8E8E8] mb-6">
              <button
                onClick={() => setActiveTab("signin")}
                className={`flex-1 text-center pb-3 font-bold text-sm border-b-2 -mb-[2px] transition-all ${
                  activeTab === "signin"
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 text-center pb-3 font-bold text-sm border-b-2 -mb-[2px] transition-all ${
                  activeTab === "signup"
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Content */}
            <div className="transition-all duration-200">
              {activeTab === "signin" ? <Login /> : <Signup />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;

