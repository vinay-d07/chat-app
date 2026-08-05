import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setGroupChatName("");
      toast({
        title: "Chat Renamed Successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Failed to rename",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Failed to add user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response?.data?.message || "Failed to remove user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={onOpen}
        className="p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] focus:outline-none transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay className="bg-black/10 backdrop-blur-[1px]" />
        <ModalContent className="rounded-[32px] border border-[#E8E8E8] bg-white shadow-xl overflow-hidden max-w-md mx-4">
          <ModalHeader className="border-b border-[#E8E8E8] text-lg font-extrabold tracking-tight text-[#111111] pt-6 pb-4 text-center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton className="rounded-xl focus:outline-none" />
          <ModalBody className="p-6 flex flex-col gap-4">
            
            {/* Badges Box */}
            <div className="w-full flex flex-wrap max-h-[85px] overflow-y-auto">
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </div>

            {/* Rename Input */}
            <div className="flex gap-2">
              <input
                placeholder="New Group Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-xs placeholder:text-[#6B6B6B]"
              />
              <button
                onClick={handleRename}
                disabled={renameloading}
                className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {renameloading ? "Updating..." : "Update"}
              </button>
            </div>

            {/* Add User Input */}
            <input
              placeholder="Add User to Group"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-xs placeholder:text-[#6B6B6B]"
            />

            {/* Search Result List */}
            <div className="max-h-[160px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center text-xs text-[#6B6B6B] py-2">Loading...</div>
              ) : (
                searchResult?.slice(0, 4).map((searchUser) => (
                  <UserListItem
                    key={searchUser._id}
                    user={searchUser}
                    handleFunction={() => handleAddUser(searchUser)}
                  />
                ))
              )}
            </div>

            {/* Leave Group Action */}
            <button
              onClick={() => handleRemove(user)}
              className="w-full border border-red-200 hover:border-red-650 hover:bg-red-50 text-red-650 text-xs font-bold py-3 rounded-xl transition-all mt-2"
            >
              Leave Group
            </button>

          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
