import React, { useState } from "react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const resp = await fetch("http://localhost:8080/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const res = await resp.json();
        alert(res)
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log("Form has errors");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden w-screen">
      {/* Background Decorative Circles */}
      <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full -top-10 -left-10"></div>
      <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full -bottom-20 -right-20"></div>

      <div className="backdrop-blur-md bg-white/30 p-10 rounded-3xl shadow-lg w-full max-w-md border border-white/20 relative z-10">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white drop-shadow">
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 p-3 w-full border rounded-lg bg-white/80 focus:outline-none focus:ring-2  text-black focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-200 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 p-3 w-full border rounded-lg bg-white/80 focus:outline-none focus:ring-2 text-black  focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-200 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1 text-black ">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 p-3 w-full border rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-200 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Sign Up
          </button>

          <p className="text-center text-white text-sm mt-4">
            Already have an account?{" "}
            <a
              href="#"
              className="underline hover:text-blue-200 transition duration-200"
            >
              Log In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
