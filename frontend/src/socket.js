import io from "socket.io-client";

export const ENDPOINT = "http://localhost:5000";

// Single shared socket instance for the whole app (chat events + call
// signaling both rely on it being the same connection/user room).
const socket = io(ENDPOINT, { autoConnect: false });

export default socket;
