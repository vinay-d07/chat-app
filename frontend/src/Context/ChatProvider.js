import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  
  // Friend system state
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const history = useHistory();

  const fetchFriendData = async (currentUser = user) => {
    if (!currentUser || !currentUser.token) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };
      const { data: friendsData } = await axios.get("/api/user/friends", config);
      const { data: requestsData } = await axios.get("/api/user/request/pending", config);
      setFriends(friendsData || []);
      setSentRequests(requestsData.sent || []);
      setReceivedRequests(requestsData.received || []);
    } catch (error) {
      console.error("Failed to fetch friend data:", error);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      history.push("/");
    } else {
      fetchFriendData(userInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        friends,
        setFriends,
        sentRequests,
        setSentRequests,
        receivedRequests,
        setReceivedRequests,
        fetchFriendData,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
