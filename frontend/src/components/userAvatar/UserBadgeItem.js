import React from "react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div
      onClick={handleFunction}
      className="inline-flex items-center gap-1.5 bg-[#111111] hover:bg-red-650 text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer m-1 transition-colors duration-250 select-none"
    >
      <span>
        {user.name}
        {admin === user._id && <span className="opacity-80 font-normal"> (Admin)</span>}
      </span>
      <svg className="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
};

export default UserBadgeItem;
