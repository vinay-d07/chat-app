import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="pb-4 px-2 w-full flex items-center justify-between border-b border-[#E8E8E8] mb-4">
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-xl text-[#111111] hover:bg-slate-50 mr-2 focus:outline-none transition-colors"
                onClick={() => setSelectedChat("")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-lg font-bold tracking-tight text-[#111111] leading-none">
                {!selectedChat.isGroupChat
                  ? getSender(user, selectedChat.users)
                  : selectedChat.chatName}
              </h2>
            </div>
            
            {/* Modal Trigger Buttons */}
            <div>
              {!selectedChat.isGroupChat ? (
                <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                  <button className="p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] focus:outline-none transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </ProfileModal>
              ) : (
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                >
                  <button className="p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] focus:outline-none transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </UpdateGroupChatModal>
              )}
            </div>
          </div>

          {/* Messages Panel Container */}
          <div className="flex-1 flex flex-col justify-end p-4 bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full w-full">
                <svg className="animate-spin h-8 w-8 text-[#111111]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <div className="overflow-y-auto flex flex-col-reverse max-h-full">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {/* Input Form Box */}
            <div className="mt-4">
              {istyping && (
                <div className="mb-2 ml-2">
                  <Lottie options={defaultOptions} width={50} style={{ marginBottom: 0, marginLeft: 10 }} />
                </div>
              )}
              <input
                type="text"
                placeholder="Write a message..."
                className="w-full px-4 py-3 bg-white border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-sm transition-all placeholder:text-[#6B6B6B] shadow-sm"
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
              />
            </div>
          </div>
        </>
      ) : (
        /* Empty Workspace State */
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center select-none max-w-sm mx-auto">
          <div className="p-5 bg-[#FAFAF8] border border-[#E8E8E8] rounded-full shadow-sm text-[#111111]">
            <svg className="w-8 h-8 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-[#111111]">
            Welcome to your Workspace
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Select a contact or group channel from the sidebar to start collaborating.
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleChat;
