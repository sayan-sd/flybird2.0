import "../stylesheets/ChatPage.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/slices/authSlice";
import { setMessages } from "../store/slices/chatSlice";
import Messages from "../components/Messages";
import toast from "react-hot-toast";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import {
    Smile,
    Sun,
    Moon,
    SendHorizontal,
} from "lucide-react";

const ChatPage = () => {
    const dispatch = useDispatch();
    const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
    const { onlineUsers, messages } = useSelector((store) => store.chat);

    const [textMessage, setTextMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [theme, setTheme] = useState("light");

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/message/send/${receiverId}`,
                { message: textMessage },
                {
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.error("Error in sending message", error);
            toast.error(error.response?.data?.message || "Message failed.");
        }
    };

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
            dispatch(setMessages([]));
        };
    }, []);

    const filteredUsers = suggestedUsers.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
        document.body.classList.toggle("dark-theme");
    };

    return (
        <div className={`chat-page-container ${theme}`}>
            <section className="contact-section">
                <div className="current-user">
                    <img src={user?.profilePicture} className="avatar" alt="me" />
                    <h1>{user?.username}</h1>
                </div>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="theme-toggle">
                    <button onClick={toggleTheme}>
                        {theme === "light" ? <Moon size={20} color="#540D6E" /> : <Sun size={20} color="#540D6E" />}
                    </button>
                </div>

                <div className="suggested-users">
                    {filteredUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(suggestedUser._id);
                        return (
                            <div
                                key={suggestedUser._id}
                                className="user-entry"
                                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                            >
                                <img src={suggestedUser.profilePicture} alt="user" className="avatar" />
                                <div className="user-info">
                                    <span className="username">{suggestedUser.username}</span>
                                    <span className={`status ${isOnline ? "online" : "offline"}`}>
                                        {isOnline ? "Online" : "Offline"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {selectedUser ? (
                <section className="chat-section">
                    <div className="chat-header">
                        <div className="chat-header-user">
                            <img src={selectedUser.profilePicture} className="chat-header-avatar" alt="selected_user" />
                            <div>
                                <h2 className="chat-header-name">{selectedUser.username}</h2>
                                <p className={`chat-header-status ${onlineUsers.includes(selectedUser._id) ? 'online' : 'offline'}`}>
                                    {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {isTyping && (
                        <div className="typing-indicator">
                            {selectedUser.username} is typing...
                        </div>
                    )}

                    <Messages selectedUser={selectedUser} />

                    <div className="message-input-container">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-btn">
                            <Smile size={20} color="#540D6E" />
                        </button>

                        {showEmojiPicker && (
                            <div className="emoji-picker">
                                <EmojiPicker onEmojiClick={(emoji) => setTextMessage(textMessage + emoji.emoji)} />
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="message-input"
                            value={textMessage}
                            onChange={(e) => {
                                setTextMessage(e.target.value);
                                setIsTyping(true);
                                setTimeout(() => setIsTyping(false), 2000);
                            }}
                        />

                        <button onClick={() => sendMessageHandler(selectedUser?._id)} className="send-button">
                            <SendHorizontal size={20} color="#540D6E" />
                        </button>
                    </div>
                </section>
            ) : (
                <div className="no-user-selected">
                    <h2>Select a user to start a conversation</h2>
                </div>
            )}
        </div>
    );
};

export default ChatPage;