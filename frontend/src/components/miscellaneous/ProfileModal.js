import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <button
          onClick={onOpen}
          className="p-2.5 rounded-full hover:bg-slate-50 border border-[#E8E8E8] text-[#6B6B6B] hover:text-[#111111] focus:outline-none transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}
      
      <Modal size="md" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay className="bg-black/10 backdrop-blur-[1px]" />
        <ModalContent className="rounded-[32px] border border-[#E8E8E8] bg-white shadow-xl overflow-hidden max-w-sm mx-4">
          <ModalHeader className="border-b border-[#E8E8E8] text-lg font-extrabold tracking-tight text-[#111111] text-center pt-6 pb-4">
            User Profile
          </ModalHeader>
          <ModalCloseButton className="rounded-xl focus:outline-none" />
          <ModalBody className="p-8 flex flex-col items-center gap-6">
            <img
              className="w-28 h-28 rounded-full border border-[#E8E8E8] object-cover shadow-sm"
              src={user.pic}
              alt={user.name}
            />
            <div className="text-center flex flex-col gap-1">
              <h3 className="font-extrabold text-xl text-[#111111]">{user.name}</h3>
              <p className="text-sm text-[#6B6B6B]">{user.email}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold py-3 rounded-xl transition-colors mt-2"
            >
              Close
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
