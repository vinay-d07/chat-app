import { Avatar } from "@chakra-ui/avatar";
import { Box, Text, Flex } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/toast";
import { ChatState } from "../../Context/ChatProvider";
import { useState } from "react";
import axios from "axios";

const UserListItem = ({ user: searchUser, handleFunction }) => {
  const { user: currentUser, friends, sentRequests, receivedRequests, fetchFriendData } = ChatState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isFriend = friends?.some((f) => f._id === searchUser._id);
  const isSent = sentRequests?.some((r) => r._id === searchUser._id);
  const isReceived = receivedRequests?.some((r) => r._id === searchUser._id);

  const showError = (error, fallback) => {
    toast({
      title: "Error Occured!",
      description: error.response?.data?.message || fallback,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
  };

  const sendRequest = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };
      await axios.post("/api/user/request/send", { targetUserId: searchUser._id }, config);
      await fetchFriendData();
    } catch (error) {
      showError(error, "Failed to send the friend request");
    }
    setLoading(false);
  };

  const acceptRequest = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };
      await axios.post("/api/user/request/accept", { senderUserId: searchUser._id }, config);
      await fetchFriendData();
    } catch (error) {
      showError(error, "Failed to accept the request");
    }
    setLoading(false);
  };

  const declineRequest = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };
      await axios.post("/api/user/request/decline", { senderUserId: searchUser._id }, config);
      await fetchFriendData();
    } catch (error) {
      showError(error, "Failed to decline the request");
    }
    setLoading(false);
  };

  const handleClick = () => {
    if (isFriend) {
      handleFunction();
    }
  };

  return (
    <Flex
      onClick={handleClick}
      cursor={isFriend ? "pointer" : "default"}
      bg="gray.50"
      border="1px solid"
      borderColor="gray.100"
      _hover={{
        borderColor: isFriend ? "blue.200" : "gray.100",
        bg: isFriend ? "blue.50" : "gray.50",
      }}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      px={3}
      py={2}
      mb={2}
      borderRadius="xl"
      transition="all 0.2s"
    >
      <Flex align="center">
        <Avatar
          mr={3}
          size="sm"
          name={searchUser.name}
          src={searchUser.pic}
        />
        <Box>
          <Text fontWeight="600" fontSize="sm" color="gray.850">
            {searchUser.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {searchUser.email}
          </Text>
        </Box>
      </Flex>
      
      <Flex gap={1.5}>
        {isFriend && (
          <Button
            size="xs"
            bg="blue.500"
            color="white"
            borderRadius="lg"
            _hover={{ bg: "blue.600" }}
            onClick={handleFunction}
          >
            Chat
          </Button>
        )}
        
        {isSent && (
          <Button
            size="xs"
            variant="outline"
            colorScheme="gray"
            isDisabled
            borderRadius="lg"
          >
            Sent
          </Button>
        )}
        
        {isReceived && (
          <>
            <Button
              size="xs"
              bg="blue.500"
              color="white"
              borderRadius="lg"
              _hover={{ bg: "blue.600" }}
              isLoading={loading}
              onClick={acceptRequest}
            >
              Accept
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorScheme="red"
              borderRadius="lg"
              isLoading={loading}
              onClick={declineRequest}
            >
              Decline
            </Button>
          </>
        )}
        
        {!isFriend && !isSent && !isReceived && (
          <Button
            size="xs"
            variant="outline"
            colorScheme="blue"
            borderRadius="lg"
            isLoading={loading}
            onClick={sendRequest}
          >
            Add Friend
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default UserListItem;
