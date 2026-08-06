import React, { useState } from "react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useHistory } from "react-router";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "piyushproj");
      fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image (JPEG or PNG)!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Name Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          placeholder="John Doe"
          className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm transition-all placeholder:text-[#6B6B6B]/40"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm transition-all placeholder:text-[#6B6B6B]/40"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {/* Password Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm pr-12 transition-all placeholder:text-[#6B6B6B]/40"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <button
              type="button"
              onClick={handleClick}
              className="text-xs font-bold text-[#6B6B6B] hover:text-[#111111] transition-colors focus:outline-none"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirm Password Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm pr-12 transition-all placeholder:text-[#6B6B6B]/40"
            onChange={(e) => setConfirmpassword(e.target.value)}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <button
              type="button"
              onClick={handleClick}
              className="text-xs font-bold text-[#6B6B6B] hover:text-[#111111] transition-colors focus:outline-none"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Upload Avatar */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Upload Avatar
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:outline-none rounded-xl text-sm transition-all file:mr-4 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-white hover:file:bg-[#222222] file:transition-colors file:cursor-pointer"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </div>
      
      {/* Sign Up Button */}
      <button
        onClick={submitHandler}
        disabled={picLoading}
        className="w-full py-3.5 mt-4 bg-[#111111] hover:bg-[#222222] text-white font-bold rounded-full text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {picLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Sign Up"
        )}
      </button>
    </div>
  );
};

export default Signup;
