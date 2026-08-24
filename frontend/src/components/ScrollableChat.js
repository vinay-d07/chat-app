import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileAttachment = ({ message, isOwn }) => {
  const isImage = message.fileType && message.fileType.startsWith("image/");

  if (isImage) {
    return (
      <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={message.fileUrl}
          alt={message.fileName}
          className="max-w-[220px] max-h-[220px] rounded-xl border border-[#E8E8E8] object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={message.fileUrl}
      download={message.fileName}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl min-w-[200px] max-w-[260px] transition-colors ${
        isOwn
          ? "bg-white/10 hover:bg-white/20"
          : "bg-white border border-[#E8E8E8] hover:bg-slate-50"
      }`}
    >
      <svg
        className={`w-6 h-6 shrink-0 ${isOwn ? "text-white" : "text-[#111111]"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{message.fileName}</p>
        {message.fileSize != null && (
          <p className={`text-[11px] ${isOwn ? "text-white/70" : "text-[#6B6B6B]"}`}>
            {formatFileSize(message.fileSize)}
          </p>
        )}
      </div>
    </a>
  );
};

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const isOwn = m.sender._id === user._id;
          return (
            <div style={{ display: "flex" }} key={m._id}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="8px"
                    mr={1.5}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                    border="2px solid"
                    borderColor="gray.100"
                  />
                </Tooltip>
              )}
              <div
                className={`flex flex-col gap-1.5 max-w-[75%] ${
                  m.fileUrl
                    ? "p-1.5"
                    : "text-sm px-4 py-2.5 leading-relaxed"
                } ${
                  isOwn
                    ? "bg-[#111111] text-white rounded-[20px] rounded-tr-[4px] shadow-sm"
                    : "bg-[#FAFAF8] text-[#111111] border border-[#E8E8E8] rounded-[20px] rounded-tl-[4px] shadow-sm"
                }`}
                style={{
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                }}
              >
                {m.fileUrl && <FileAttachment message={m} isOwn={isOwn} />}
                {m.content && (
                  <span className={m.fileUrl ? "text-sm px-2.5 pb-1 leading-relaxed" : ""}>
                    {m.content}
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
