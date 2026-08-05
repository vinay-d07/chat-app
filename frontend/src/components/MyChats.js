import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden md:flex" : "flex"
      } flex-col items-center p-6 bg-white w-full md:w-[31%] rounded-[32px] border border-[#E8E8E8] shadow-sm h-full overflow-hidden`}
    >
      {/* Header */}
      <div className="pb-4 px-1 flex w-full justify-between items-center border-b border-[#E8E8E8] mb-4">
        <h2 className="text-xl font-extrabold tracking-tight text-[#111111]">
          My Chats
        </h2>
        <GroupChatModal>
          <button className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors focus:outline-none">
            <span>New Group</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </GroupChatModal>
      </div>

      {/* Conversations List */}
      <div className="w-full flex-1 flex flex-col overflow-y-auto pr-1">
        {chats ? (
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <div
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-4 py-3.5 rounded-2xl transition-all duration-200 border flex flex-col gap-0.5 ${
                  selectedChat?._id === chat._id
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : "bg-white border-[#E8E8E8] hover:bg-slate-50 text-[#111111] hover:border-slate-300"
                }`}
                key={chat._id}
              >
                <div className="font-bold text-sm leading-none">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </div>
                {chat.latestMessage && (
                  <div
                    className={`text-xs mt-1 truncate max-w-[220px] ${
                      selectedChat?._id === chat._id ? "text-slate-350" : "text-[#6B6B6B]"
                    }`}
                  >
                    <span className="font-bold">{chat.latestMessage.sender.name}: </span>
                    {chat.latestMessage.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};

export default MyChats;
