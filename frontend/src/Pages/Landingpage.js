import React from "react";
import { Link } from "react-router-dom";

const Landingpage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] font-sans selection:bg-[#111111] selection:text-white antialiased">
      {/* Custom Styles for Typing Dots & Float Animation */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-window { animation: floatSlow1 7s ease-in-out infinite; }
        .typing-dot {
          width: 5px;
          height: 5px;
          background-color: #6B6B6B;
          border-radius: 50%;
          display: inline-block;
          animation: typingBlink 1.4s infinite both;
        }
        .typing-dot:nth-child(2) { animation-delay: .2s; }
        .typing-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes typingBlink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="border-b border-[#E8E8E8] bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="font-bold text-lg tracking-tight">talkative</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors">
              Overview
            </a>
          </div>

          {/* CTA */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-5 py-3 rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-7 flex flex-col items-start gap-8">
          <h1 className="font-black text-6xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.88] text-[#111111] max-w-xl text-left">
            Messages<br />
            that stay<br />
            out of<br />
            your way.
          </h1>
          
          <p className="text-lg text-[#6B6B6B] max-w-md leading-relaxed">
            Talk-A-Tive is a thoughtful, minimalist chat space designed for focused collaboration. Zero clutter. Clean execution. Direct communication.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/login"
              className="bg-[#111111] hover:bg-[#222222] text-white text-sm font-bold px-8 py-4 rounded-full shadow-sm transition-colors"
            >
              Start chatting
            </Link>
            <a
              href="#features"
              className="border border-[#E8E8E8] hover:border-[#111111] text-[#111111] text-sm font-bold px-8 py-4 rounded-full transition-colors bg-white"
            >
              See features
            </a>
          </div>
        </div>

        {/* Right Side: Floating Conversational Mockup App Window */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end items-center w-full py-6">
          <div className="bg-white border border-[#E8E8E8] rounded-[32px] shadow-sm w-full max-w-[380px] overflow-hidden animate-float-window select-none">
            {/* Window Header */}
            <div className="border-b border-[#E8E8E8] px-6 py-4 flex items-center justify-between bg-white">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#E8E8E8]" />
                <div className="w-2 h-2 rounded-full bg-[#E8E8E8]" />
                <div className="w-2 h-2 rounded-full bg-[#E8E8E8]" />
              </div>
              <span className="text-[10px] font-bold text-[#6B6B6B] tracking-wider uppercase">talkative</span>
              <div className="w-8" />
            </div>

            {/* Messages Stream */}
            <div className="p-6 flex flex-col gap-4">
              {/* Message 1 */}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <span className="text-[9px] font-bold text-[#6B6B6B] ml-1">John Doe</span>
                <div className="bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-[#111111]">
                  Hey.
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex flex-col gap-1 max-w-[85%] -mt-1">
                <div className="bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-[#111111]">
                  Ready for launch?
                </div>
              </div>

              {/* Message 3 */}
              <div className="flex flex-col gap-1 max-w-[85%] self-end items-end">
                <span className="text-[9px] font-bold text-[#6B6B6B] mr-1">You</span>
                <div className="bg-[#111111] text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs">
                  Everything's deployed.
                </div>
              </div>

              {/* Message 4 */}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <span className="text-[9px] font-bold text-[#6B6B6B] ml-1">John Doe</span>
                <div className="bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-[#111111]">
                  Perfect.
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex flex-col gap-1 max-w-[85%] self-end items-end">
                <div className="bg-slate-50 border border-[#E8E8E8] rounded-2xl rounded-tr-none px-4 py-2 text-xs flex gap-1 items-center">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[#E8E8E8] bg-white py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-24 max-w-xl flex flex-col items-start gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#111111]">
              Engineered for quiet productivity
            </h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              We stripped away the noise and notification overload to build a messaging workflow that keeps you focused.
            </p>
          </div>

          {/* Numbered Premium Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 01 */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-[24px] flex flex-col gap-10 hover:border-[#111111] transition-colors duration-300">
              <span className="text-sm font-bold tracking-tight text-[#6B6B6B]">01</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg tracking-tight text-[#111111]">Real-time</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Blazing fast chat delivery powered by optimized WebSockets.
                </p>
              </div>
            </div>

            {/* Feature 02 */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-[24px] flex flex-col gap-10 hover:border-[#111111] transition-colors duration-300">
              <span className="text-sm font-bold tracking-tight text-[#6B6B6B]">02</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg tracking-tight text-[#111111]">Groups</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Collaborative spaces for channels, topics, and team syncs.
                </p>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-[24px] flex flex-col gap-10 hover:border-[#111111] transition-colors duration-300">
              <span className="text-sm font-bold tracking-tight text-[#6B6B6B]">03</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg tracking-tight text-[#111111]">Search</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Find user profiles and direct chat logs instantly.
                </p>
              </div>
            </div>

            {/* Feature 04 */}
            <div className="bg-white border border-[#E8E8E8] p-8 rounded-[24px] flex flex-col gap-10 hover:border-[#111111] transition-colors duration-300">
              <span className="text-sm font-bold tracking-tight text-[#6B6B6B]">04</span>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg tracking-tight text-[#111111]">Private</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Friend request filters secure your workspace against spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="border-t border-[#E8E8E8] py-32 bg-[#FAFAF8] relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-start gap-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#111111]">
            Ready to start?
          </h2>
          <p className="text-md text-[#6B6B6B] leading-relaxed max-w-md">
            Join thousands of teams communicating more thoughtfully.
          </p>
          <Link
            to="/login"
            className="bg-[#111111] hover:bg-[#222222] text-white text-sm font-bold px-10 py-4 rounded-full shadow-sm transition-colors mt-2"
          >
            Start chatting
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E8] bg-white py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs text-[#6B6B6B] w-full">
          {/* Logo / Copyright */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111]">talkative</span>
            <span>© {new Date().getFullYear()} Talk-A-Tive.</span>
          </div>
          
          {/* Link Items */}
          <div className="flex gap-8">
            <a href="#privacy" className="hover:text-[#111111] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#111111] transition-colors">Terms</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
