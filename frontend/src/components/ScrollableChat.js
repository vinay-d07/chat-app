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

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
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
            <span
              className={`text-sm px-4 py-2.5 max-w-[75%] leading-relaxed ${
                m.sender._id === user._id
                  ? "bg-[#111111] text-white rounded-[20px] rounded-tr-[4px] shadow-sm"
                  : "bg-[#FAFAF8] text-[#111111] border border-[#E8E8E8] rounded-[20px] rounded-tl-[4px] shadow-sm"
              }`}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
