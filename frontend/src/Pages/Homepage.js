import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative blurred background blob */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-radial-gradient filter blur-[40px] opacity-30 pointer-events-none z-0" />
      
      <style>{`
        .bg-radial-gradient {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.05) 70%);
        }
      `}</style>

      <div className="flex flex-col w-full max-w-md gap-6 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Talk-A-Tive
          </span>
        </div>

        {/* Auth Card */}
        <div className="bg-white w-full p-8 rounded-3xl border border-slate-100 shadow-xl">
          {/* Tab Switcher */}
          <div className="flex border-b-2 border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 text-center pb-3 font-bold text-sm border-b-2 -mb-[2px] transition-all ${
                activeTab === "signin"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 text-center pb-3 font-bold text-sm border-b-2 -mb-[2px] transition-all ${
                activeTab === "signup"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
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
  );
}

export default Homepage;
