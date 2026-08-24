import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "../Context/ChatProvider";
import {
  getOrCreateIdentity,
  encryptForRecipients,
  decryptForDisplay,
} from "../crypto/e2ee";

let selectedChatCompare;

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024; // keep in sync with backend/config/multer.js

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const {
    selectedChat,
    setSelectedChat,
    user,
    setNotification,
    socket,
    socketConnected,
    setCallToInitiate,
  } = ChatState();

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
      const { privateKey } = await getOrCreateIdentity(user._id);
      const decrypted = await Promise.all(
        data.map((m) => decryptForDisplay(m, user._id, privateKey))
      );
      setMessages(decrypted);
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

  const postMessage = async (payload) => {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { privateKey } = await getOrCreateIdentity(user._id);
    const body = { chatId: selectedChat._id };

    if (payload.content) {
      const recipients = selectedChat.users;
      const missingKey = recipients.find((u) => !u.publicKey);
      if (missingKey) {
        throw new Error(
          `${missingKey.name} hasn't set up encrypted messaging yet — ask them to log in once, then try again.`
        );
      }
      Object.assign(
        body,
        await encryptForRecipients(payload.content, privateKey, recipients)
      );
    }

    if (payload.fileUrl) {
      Object.assign(body, {
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        fileType: payload.fileType,
        fileSize: payload.fileSize,
      });
    }

    const { data } = await axios.post("/api/message", body, config);
    socket.emit("new message", data);
    const displayMessage = await decryptForDisplay(data, user._id, privateKey);
    setMessages((prev) => [...prev, displayMessage]);
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      const content = newMessage;
      setNewMessage("");
      try {
        await postMessage({ content });
      } catch (error) {
        setNewMessage(content);
        toast({
          title: "Error Occured!",
          description: error.message || "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file || !selectedChat) return;

    if (file.size > MAX_UPLOAD_SIZE) {
      toast({
        title: "File too large",
        description: "Files must be 25MB or smaller.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploaded } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      await postMessage({
        content: "",
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the file",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleMessageReceived = async (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        setNotification((prev) =>
          prev.some((n) => n._id === newMessageRecieved._id)
            ? prev
            : [newMessageRecieved, ...prev]
        );
        setFetchAgain((prev) => !prev);
      } else {
        const { privateKey } = await getOrCreateIdentity(user._id);
        const displayMessage = await decryptForDisplay(
          newMessageRecieved,
          user._id,
          privateKey
        );
        setMessages((prev) => [...prev, displayMessage]);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop typing", handleStopTyping);
    socket.on("message recieved", handleMessageReceived);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop typing", handleStopTyping);
      socket.off("message recieved", handleMessageReceived);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div className="flex items-center gap-2">
              {!selectedChat.isGroupChat && (
                <button
                  onClick={() =>
                    setCallToInitiate(getSenderFull(user, selectedChat.users))
                  }
                  title="Start video call"
                  className="p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] focus:outline-none transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
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
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  title="Attach a file"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 p-3 rounded-xl border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] hover:bg-slate-50 focus:outline-none transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  )}
                </button>
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
