import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full -top-10 -left-10"></div>
      <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full -bottom-20 -right-20"></div>

      <div className="backdrop-blur-md bg-white/30 p-12 shadow-2xl rounded-3xl max-w-md w-full text-center border border-white/20 relative z-10">
        <h1 className="text-4xl font-extrabold text-white drop-shadow mb-4">
          Welcome!
        </h1>
        <p className="text-white/80 text-lg mb-8">
          Sign in or sign up to continue
        </p>

        <div className="flex justify-center space-x-6">
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-black py-3 px-8 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
