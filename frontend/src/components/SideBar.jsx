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
      <div className="h-screen w-1/3 bg-gray-100 p-4 border-r border-gray-300 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-black font-semibold">Users</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => {
              console.log(addUser)
              addfriend(addUser);
            }}
          >
            Add +
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="addUser users..."
            value={addUser}
            onChange={(e) => setaddUser(e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {friends.length > 0 ? (
            friends.map((user) => (
              <button
                onClick={() => handleChat(user.fuid)}
                key={user.fuid}
                className="w-full"
              >
                <UserCard user={user} />
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center">No users found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
