import React, { useState, createContext, useEffect, use } from "react";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setuser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  //get friends function
  const [friends, setFriends] = useState([]);
  const getFriends = async (sender) => {
    try {
      const resp = await fetch(`http://localhost:8080/chat/${sender}/friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const res = await resp.json();
      setFriends(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getFriends(user.uid);
    }
  }, [user]);

  // add friend
  const [addUser, setaddUser] = useState("");

  const addfriend = async (ID) => {
    
    try {
      const resp = await fetch(`http://localhost:8080/chat/add/${user.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({"ID":ID}),
      });
      const res = await resp.json();
      alert(res);
    } catch (error) {
      console.log(error);
    }
  };

  //chatare state manangement
  const [chat, setchat] = useState("");
  const [msgs, setmsgs] = useState(null);
  const [fetchAgain, setfetchAgain] = useState(false);
  const getMessages = async (sender, reciever) => {
    if (sender && reciever) {
      try {
        const resp = await fetch(
          `http://localhost:8080/chat/${sender}/${reciever}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const res = await resp.json();
        // console.log(res);
        setmsgs(res[0].friendMsgs);
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    if (chat != "") {
      getMessages(user.uid, chat);
    }
  }, [chat, fetchAgain, msgs]);

  const ContextValues = {
    friends,
    setuser,
    addUser,
    setaddUser,
    addfriend,
    user,
    chat,
    setchat,
    msgs,
    setmsgs,
    setfetchAgain,
  };

  return (
    <ChatContext.Provider value={ContextValues}>
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, ChatContext };
