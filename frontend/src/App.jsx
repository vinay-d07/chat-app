import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./index.css";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Chats from "./pages/Chats";
import AboutMe from "./pages/AboutMe";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<Chats />} />

          <Route path="/about" element={<AboutMe />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
