import React from "react";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={`${
        selectedChat ? "flex" : "hidden"
      } md:flex flex-col items-center p-6 bg-white w-full md:w-[67%] rounded-[32px] border border-[#E8E8E8] shadow-sm h-full overflow-hidden`}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default Chatbox;
