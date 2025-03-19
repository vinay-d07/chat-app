import React from "react";
import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";
import NavBar from "../components/NavBar";

const Chats = () => {
  return (
    <>
      <NavBar />
      <div className="flex h-screen w-screen overflow-hidden">
        <SideBar className="h-full w-auto" />
        <ChatArea className="flex" />
      </div>
    </>
  );
};

export default Chats;
