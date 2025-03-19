import React from 'react';


const UserCard = ({ user }) => {
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded shadow hover:bg-gray-50 transition cursor-pointer">
      
      <div className="flex items-center space-x-3">
        {/* Avatar Placeholder */}
        <div className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center font-bold">
          {user.name.charAt(0)}
        </div>

        {/* Name and Status */}
        <div>
          <h3 className="font-medium text-gray-800">{user.name}</h3>
          <p className="text-sm text-gray-500 flex items-center">
            
            {user.status}
          </p>
        </div>
      </div>


    </div>
  );
};

export default UserCard;
