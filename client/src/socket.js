import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL ||
    (apiUrl ? apiUrl.replace(/\/api\/?$/, "") : "http://localhost:5000");

const socket = io(socketUrl, {
    autoConnect: false
});

export default socket;
