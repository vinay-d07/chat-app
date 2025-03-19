import React, { useContext, useEffect, useState, useRef } from "react";
import { ChatContext } from "../Context/ChatContext";
import { io } from "socket.io-client";
const ChatArea = () => {
  const { user, msgs, chat, setmsgs, setfetchAgain, friends } =
    useContext(ChatContext);

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
    console.log(id)
    const des=confirm("are you sure?")
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
      <div className="relative h-full w-full bg-gray-900 flex flex-col text-gray-100">
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
                      className={`m-1 p-2 rounded-lg max-w-xs text-sm break-words ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      {msg.text}
                    </div>

                    
                    {hoverStates[msg._id] && (
                      <div
                        className="text-xs text-red-500 cursor-pointer transition delay-150 duration-300 ease-in-out"
                        onClick={() => handleDelete(msg._id)} 
                      >
                        delete
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      {ParseDate(msg.time)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center flex-1">
              <span className="text-xl text-gray-500">
                START A CONVERSATION
              </span>
            </div>
          )}
        </div>
        
        <div className="w-full px-4 py-3 bg-gray-800 border-t border-gray-700 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={textObj.text}
            className={`w-full rounded-md bg-gray-700 text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              chat ? "block" : "hidden"
            }`}
            onChange={(e) => {
              settextObj({ text: e.target.value });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") SendSocket(e);
            }}
          />
          <button
            onClick={(e) => SendSocket(e)}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${
              chat ? "block" : "hidden"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
