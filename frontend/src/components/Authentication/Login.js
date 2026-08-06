import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          value={email}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm pr-12 transition-all placeholder:text-[#6B6B6B]/40"
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
      
      {/* Sign In Button */}
      <button
        onClick={submitHandler}
        disabled={loading}
        className="w-full py-3.5 mt-4 bg-[#111111] hover:bg-[#222222] text-white font-bold rounded-full text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </button>
      
      {/* Guest Credentials Button */}
      <button
        type="button"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
        className="w-full py-3.5 border border-[#E8E8E8] hover:border-[#111111] hover:bg-[#FAFAF8] text-[#111111] font-bold rounded-full text-sm transition-colors focus:outline-none"
      >
        Use Guest Credentials
      </button>
    </div>
  );
};

export default Login;
