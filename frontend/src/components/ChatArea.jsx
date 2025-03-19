import React, { useContext, useEffect, useState, useRef } from "react";
import { ChatContext } from "../Context/ChatContext";
import { io } from "socket.io-client";
const ChatArea = () => {
  const { user, msgs, chat, setmsgs, setfetchAgain, friends } =
    useContext(ChatContext);

  const [name, setname] = useState(null);

  useEffect(() => {
    friends.find((obj) => {
      if (obj.fuid === chat) {
        setname(obj.name);
      }
    });
  }, [chat]);
  // console.log(name)

  const [textObj, settextObj] = useState({
    text: "",
  });

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log(user.uid, chat);

    if (textObj.text != "") {
      try {
        const resp = await fetch(
          `http://localhost:8080/chat/${user.uid}/${chat}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(textObj),
          }
        );
        const res = await resp.json();
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("empty");
    }
  };

  const [socket, setdsocket] = useState(null);

  const SendSocket = (e) => {
    console.log("sending.....");

    if (!online[chat]) {
      sendMessage(e);
    } else {
      socket.emit("chat-message", { msg: textObj.text, fuid: chat });
    }
    settextObj({ text: "" });
  };

  const [online, setOnline] = useState({});
  useEffect(() => {
    if (chat != "" && textObj.text != "") {
      try {
        const socket = io("http://localhost:8080", {
          query: {
            myID: user.uid,
          },
        });
        setdsocket(socket);

        socket.on("connect", () => {
          console.log("connected from ", user.uid, " to ", chat);
        });

        socket.on("chat-message-sent", (msg) => {
          console.log("recived", msg);
          setmsgs((prevmsgs) => [...prevmsgs, msg]);
          setfetchAgain((pervState) => {
            return !pervState;
          });
        });

        socket.on("get-online", (users) => {
          setOnline(users);
          console.log(users);
        });

        socket.on("disconnect", () => {
          console.log("disconnected");
        });
        return () => {
          console.log("Cleaning up socket...");
          socketInstance.disconnect();
        };
      } catch (error) {
        console.log(error);
      }
    }
  }, [chat]);

  const ParseDate = (d) => {
    const date = new Date(d);
    const readableDate = date.toLocaleString("en-US", { timeZone: "UTC" });
    return readableDate;
  };

  const [hoverStates, setHoverStates] = useState({});
  const handleMouseOver = (id) => {
    setHoverStates((prev) => ({ ...prev, [id]: true }));
  };

  const handleMouseLeave = (id) => {
    setHoverStates((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = async (id) => {
    console.log(id);
    const des = confirm("are you sure?");
    try {
      if (des) {
        const resp = await fetch(
          `http://localhost:8080/chat/${user.uid}/${chat}/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        console.log(resp);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="relative h-full w-full bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col text-gray-100">
        {name && (
          <div className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                {name && name[0].toUpperCase()}
              </div>
              <div className="font-medium">{name}</div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {msgs && msgs.length > 0 ? (
            msgs.map((msg, i) => {
              const isMe = msg.from === user.uid;
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                    onMouseLeave={() => handleMouseLeave(msg._id)}
                    onMouseOver={() => handleMouseOver(msg._id)}
                  >
                    <div
                      className={`relative group ${isMe ? "ml-12" : "mr-12"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-md text-sm break-words ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-700/50 backdrop-blur-sm text-gray-100 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {hoverStates[msg._id] && (
                        <div
                          className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(msg._id)}
                        >
                          <button className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 px-2">
                      {ParseDate(msg.time)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-medium text-gray-400">
                  Start a conversation
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={textObj.text}
              className={`flex-1 rounded-full bg-gray-700/50 text-white placeholder-gray-400 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                chat ? "block" : "hidden"
              }`}
              onChange={(e) => settextObj({ text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") SendSocket(e);
              }}
            />
            <button
              onClick={(e) => SendSocket(e)}
              className={`p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                chat ? "block" : "hidden"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
