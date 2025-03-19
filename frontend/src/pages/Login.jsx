import React, { useContext } from "react";
import "../index.css";
import { useForm } from "react-hook-form";
import { ChatContext } from "../Context/ChatContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    handleLogin(data);
  };

  const { setuser } = useContext(ChatContext);
  const handleLogin = async (DATA) => {
    try {
      const resp = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DATA),
      });
      const res = await resp.json();
      if (res.token && res.red_url) {
        localStorage.setItem("token", res.token);
        setuser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));

        setTimeout(() => {
          window.location.href = res.red_url; 
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full -top-10 -left-10"></div>
        <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full -bottom-20 -right-20"></div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="backdrop-blur-md bg-white/30 p-10 rounded-3xl shadow-lg w-full max-w-md border border-white/20 relative z-10"
          method="POST"
        >
          <h2 className="text-3xl font-extrabold text-center text-white drop-shadow mb-8">
            Welcome Back
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              EMAIL
            </label>
            <input
              type="text"
              placeholder="Enter Email"
              className="w-full px-4 py-3 border rounded-lg bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && (
              <p className="text-red-200 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-4 py-3 border rounded-lg bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-red-200 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            LOGIN
          </button>

          <p className="text-center text-white text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="#"
              className="underline hover:text-blue-200 transition duration-200"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
