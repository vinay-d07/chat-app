import React, { useContext, useState } from "react";
import UserCard from "./UserCard"; // Separate component for each user
import { ChatContext } from "../Context/ChatContext";

const Sidebar = () => {
  const { friends, addUser, setaddUser, addfriend, setchat } =
    useContext(ChatContext);
  // console.log(friends);

  const handleChat = (id) => {
    setchat(id);
  };
  const [activeChat, setActive] = useState({});
  return (
    <>
      <div className="h-screen w-1/3 bg-gray-800 p-6 border-r border-gray-700 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white font-bold">Chats</h2>
          <button
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              console.log(addUser);
              addfriend(addUser);
            }}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Add new user..."
              value={addUser}
              onChange={(e) => setaddUser(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute right-3 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {friends.length > 0 ? (
            friends.map((user) => (
              <button
                onClick={() => {
                  handleChat(user.fuid);
                }}
                key={user.fuid}
                className="w-full transition-transform hover:scale-[1.02]"
              >
                <UserCard user={user} />
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
