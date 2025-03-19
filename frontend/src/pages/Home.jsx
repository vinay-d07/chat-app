import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import NavBar from "../components/NavBar";
import Spline3D from "../components/Spline3D";

const Home = () => {
  const [data, setdata] = useState("");
  useEffect(() => {
    getHome();
  }, []);

  const getHome = async () => {
    try {
      const resp = await fetch("http://localhost:8080/api/v1/home", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const res = await resp.json();
      setdata(res.msg);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col">
        <NavBar />

        <div className="flex flex-col items-center justify-center flex-grow p-8 text-center relative overflow-hidden bg-gradient-to-br from-[#e0eafc] to-[#cfdef3]">
          {/* Background Gradient & Decorative Circles */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 to-blue-100 rounded-full opacity-30 blur-3xl animate-pulse"></div>

          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300 to-pink-200 rounded-full opacity-20 blur-2xl"></div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 z-10 drop-shadow-xl">
            {data || "Welcome to the Home Page!"}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-2xl text-gray-600 mb-12 z-10 max-w-2xl backdrop-blur-md bg-white/40 rounded-xl px-6 py-4 shadow-md">
            Start chatting with your friends or connect with new people now!
          </p>

          {/* 3D Component Container */}

          {/* Call to Action Button */}
          <NavLink
            to="/chat"
            className="inline-block bg-white/30 backdrop-blur-md border border-white/20 hover:bg-white/40 text-blue-800 text-lg font-semibold py-3 px-10 rounded-full shadow-2xl transform hover:scale-110 transition duration-300 z-10"
          >
            Go to Chat
          </NavLink>

          <NavLink
            to="/about"
            className="inline-block bg-white/30 backdrop-blur-md border border-white/20 hover:bg-white/40 text-blue-800 text-lg font-semibold py-3 px-10 rounded-full shadow-2xl transform hover:scale-110 transition duration-300 z-10"
          >
            ABOUT THE DEV
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Home;
