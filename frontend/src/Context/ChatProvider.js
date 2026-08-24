import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import { ensurePublicKeyPublished } from "../crypto/e2ee";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [socketConnected, setSocketConnected] = useState(false);

  // Set by SingleChat's "Video Call" button; VideoCallManager watches this
  // to kick off an outgoing call to the given user.
  const [callToInitiate, setCallToInitiate] = useState(null);

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

  // Make sure this browser's E2EE public key is on file for this user
  // (generates a local keypair on first use).
  useEffect(() => {
    if (!user) return;
    ensurePublicKeyPublished(user).catch((err) =>
      console.error("Failed to publish E2EE public key:", err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Connect the shared socket once we know who's logged in, and tear it
  // down on logout/unmount so we don't leak a stale connection.
  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.off("connected");
      socket.disconnect();
      setSocketConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

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
        socket,
        socketConnected,
        callToInitiate,
        setCallToInitiate,
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
