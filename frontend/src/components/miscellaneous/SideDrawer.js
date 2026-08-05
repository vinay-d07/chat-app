import { Button, IconButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text, Flex, Stack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    receivedRequests,
    fetchFriendData,
  } = ChatState();

  const toast = useToast();
  
  // Disclosures
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenRequests,
    onOpen: onOpenRequests,
    onClose: onCloseRequests,
  } = useDisclosure();

  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
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

      const { data } = await axios.get(`/api/user?search=${search}`, config);
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

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full bg-[#FAFAF8] border-b border-[#E8E8E8] h-20 px-6 flex items-center justify-between font-sans relative z-40 select-none">
        
        {/* Search Users Trigger */}
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <button
            onClick={onOpen}
            className="flex items-center gap-2 bg-white border border-[#E8E8E8] hover:border-slate-400 px-4 py-2.5 rounded-full text-xs font-bold text-[#6B6B6B] hover:text-[#111111] transition-all duration-200 focus:outline-none shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">Search users...</span>
          </button>
        </Tooltip>

        {/* Wordmark Logo */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="font-extrabold text-lg tracking-tight text-[#111111]">talkative</span>
        </div>

        {/* Nav Controls */}
        <div className="flex items-center gap-3">
          
          {/* Friend Requests Badge Button */}
          <button
            onClick={onOpenRequests}
            className="relative p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] transition-colors focus:outline-none bg-white shadow-sm"
          >
            {receivedRequests && receivedRequests.length > 0 && (
              <div className="absolute top-0 right-0 transform translate-x-1.5 -translate-y-1.5 bg-[#111111] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {receivedRequests.length}
              </div>
            )}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>

          {/* Messages Notifications Dropdown */}
          <Menu>
            <MenuButton className="relative p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] transition-colors focus:outline-none bg-white shadow-sm">
              {notification.length > 0 && (
                <div className="absolute top-0 right-0 transform translate-x-1.5 -translate-y-1.5 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {notification.length}
                </div>
              )}
              <BellIcon className="text-md" />
            </MenuButton>
            <MenuList className="border border-[#E8E8E8] rounded-2xl shadow-lg p-2 max-w-sm">
              {!notification.length && (
                <div className="text-xs text-[#6B6B6B] py-2 px-3">
                  No New Messages
                </div>
              )}
              {notification.map((notif) => (
                <MenuItem
                  className="rounded-xl px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* User Settings Dropdown */}
          <Menu>
            <MenuButton className="focus:outline-none">
              <div className="flex items-center gap-1.5 border border-[#E8E8E8] rounded-full p-1 bg-white hover:border-slate-350 shadow-sm transition-colors">
                <Avatar
                  size="xs"
                  name={user.name}
                  src={user.pic}
                  border="1.5px solid"
                  borderColor="gray.200"
                />
                <ChevronDownIcon className="text-slate-400 text-xs pr-1" />
              </div>
            </MenuButton>
            <MenuList className="border border-[#E8E8E8] rounded-2xl shadow-lg p-1.5">
              <ProfileModal user={user}>
                <MenuItem className="rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors">
                  My Profile
                </MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem
                onClick={logoutHandler}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-red-50 text-red-650 transition-colors"
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>

        </div>
      </div>

      {/* Friends Search Drawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay className="bg-black/10 backdrop-blur-[1px]" />
        <DrawerContent className="rounded-r-[32px] border-r border-[#E8E8E8]">
          <DrawerHeader className="border-b border-[#E8E8E8] text-lg font-extrabold tracking-tight text-[#111111]">
            Search Users
          </DrawerHeader>
          <DrawerBody className="p-6">
            <div className="flex gap-2 pb-4">
              <input
                placeholder="Search name or email..."
                value={search}
                className="flex-1 px-4 py-2.5 bg-[#FAFAF8] border border-[#E8E8E8] focus:border-[#111111] focus:ring-1 focus:ring-[#111111] focus:outline-none rounded-xl text-xs placeholder:text-[#6B6B6B]"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Go
              </button>
            </div>
            
            {loading ? (
              <ChatLoading />
            ) : (
              <div className="flex flex-col">
                {searchResult?.map((searchUser) => (
                  <UserListItem
                    key={searchUser._id}
                    user={searchUser}
                    handleFunction={() => accessChat(searchUser._id)}
                  />
                ))}
              </div>
            )}
            {loadingChat && <div className="flex justify-center mt-4"><Spinner size="md" color="black" /></div>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Friend Requests Modal */}
      <Modal isOpen={isOpenRequests} onClose={onCloseRequests} isCentered>
        <ModalOverlay className="bg-black/10 backdrop-blur-[1px]" />
        <ModalContent className="rounded-[32px] border border-[#E8E8E8] overflow-hidden bg-white shadow-xl mx-4">
          <ModalHeader className="border-b border-[#E8E8E8] text-lg font-extrabold tracking-tight text-[#111111]">
            Friend Requests
          </ModalHeader>
          <ModalCloseButton className="rounded-xl focus:outline-none" />
          <ModalBody className="p-6 max-h-[350px] overflow-y-auto">
            {!receivedRequests || receivedRequests.length === 0 ? (
              <div className="text-center text-[#6B6B6B] text-xs py-8">
                No pending friend requests
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {receivedRequests.map((reqUser) => (
                  <div
                    key={reqUser._id}
                    className="flex align-center justify-between p-3.5 bg-[#FAFAF8] border border-[#E8E8E8] rounded-2xl items-center"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" name={reqUser.name} src={reqUser.pic} border="1.5px solid" borderColor="gray.200" />
                      <div>
                        <div className="font-bold text-xs text-[#111111]">{reqUser.name}</div>
                        <div className="text-[10px] text-[#6B6B6B]">{reqUser.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-[#111111] hover:bg-[#222222] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        onClick={async () => {
                          const config = {
                            headers: {
                              Authorization: `Bearer ${user.token}`,
                            },
                          };
                          await axios.post("/api/user/request/accept", { senderUserId: reqUser._id }, config);
                          await fetchFriendData();
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="border border-[#E8E8E8] hover:border-red-650 hover:bg-red-50 text-[#6B6B6B] hover:text-red-650 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                        onClick={async () => {
                          const config = {
                            headers: {
                              Authorization: `Bearer ${user.token}`,
                            },
                          };
                          await axios.post("/api/user/request/decline", { senderUserId: reqUser._id }, config);
                          await fetchFriendData();
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SideDrawer;
