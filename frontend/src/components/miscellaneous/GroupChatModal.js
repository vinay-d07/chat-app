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

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

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

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      // Reset State
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchResult([]);
      setSearch("");
      toast({
        title: "New Group Chat Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Create the Chat!",
        description: error.response?.data || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay className="bg-black/10 backdrop-blur-[1px]" />
        <ModalContent className="rounded-[32px] border border-[#E8E8E8] bg-white shadow-xl overflow-hidden max-w-md mx-4">
          <ModalHeader className="border-b border-[#E8E8E8] text-lg font-extrabold tracking-tight text-[#111111] pt-6 pb-4 text-center">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton className="rounded-xl focus:outline-none" />
          <ModalBody className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {/* Chat Name Input */}
              <input
                placeholder="Group Chat Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-xs placeholder:text-[#6B6B6B]"
              />
              
              {/* Users Search Input */}
              <input
                placeholder="Add Users (e.g. John, Jane)"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-xs placeholder:text-[#6B6B6B]"
              />
            </div>

            {/* Badges Box */}
            <div className="w-full flex flex-wrap max-h-[80px] overflow-y-auto">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </div>

            {/* Search Results */}
            <div className="max-h-[160px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center text-xs text-[#6B6B6B] py-2">Loading...</div>
              ) : (
                searchResult?.slice(0, 4).map((searchUser) => (
                  <UserListItem
                    key={searchUser._id}
                    user={searchUser}
                    handleFunction={() => handleGroup(searchUser)}
                  />
                ))
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold py-3 rounded-xl transition-colors mt-2"
            >
              Create Chat
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
