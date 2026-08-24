import io from "socket.io-client";

// No explicit URL: connects to whatever origin served the page. In dev,
// CRA's "proxy" (package.json) forwards this to the backend, including
// the websocket upgrade; in production the frontend build is served by
// the same Express server that runs Socket.io, so it's already same-origin.
export const ENDPOINT = undefined;

// Single shared socket instance for the whole app (chat events + call
// signaling both rely on it being the same connection/user room).
const socket = io({ autoConnect: false });

export default socket;
