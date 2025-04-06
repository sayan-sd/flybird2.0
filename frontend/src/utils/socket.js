// socket.js
import { io } from "socket.io-client";
import store from "../store/store"; // Import your Redux store
import { setOnlineUsers, setMessages } from "../store/slices/chatSlice";
import { setLikeNotification } from "../store/slices/RTNSlice";

// Socket instance lives outside Redux
let socket = null;

export const initializeSocket = (userId) => {
    if (socket) {
        socket.close();
    }

    // Create socket instance
    socket = io(import.meta.env.VITE_SOCKET_SERVER_DOMAIN, {
        query: {
            userId: userId,
        },
        transports: ["websocket"],
    });

    // Set up event listeners
    socket.on("getOnlineUsers", (onlineUsers) => {
        store.dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("notification", (notification) => {
        store.dispatch(setLikeNotification(notification));
    });

    socket.on("newMessage", (newMessage) => {
        const currentMessages = store.getState().chat.messages;
        store.dispatch(setMessages([...currentMessages, newMessage]));
    });

    return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};

export const sendSocketMessage = (receiverId, message) => {
    if (socket && socket.connected) {
        socket.emit("sendMessage", { receiverId, message });
    }
};
