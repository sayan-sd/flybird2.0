import "../stylesheets/ChatPage.css";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/slices/authSlice";
import Messages from "../components/Messages";
import toast from "react-hot-toast";
import { setMessages } from "../store/slices/chatSlice";
import axios from "axios";
import '../stylesheets/ChatPage.css';

const ChatPage = () => {
    const dispatch = useDispatch();

    const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
    const { onlineUsers, messages } = useSelector((store) => store.chat);

    const [textMessage, setTextMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/message/send/${receiverId}`,
                { message: textMessage },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
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

    return (
        <div className="chat-page-container">
            {/* CONTACT SECTION */}
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

                <div className="suggested-users">
                    {filteredUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(suggestedUser._id);
                        return (
                            <div
                                key={suggestedUser._id}
                                className="user-entry"
                                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                            >
                                <img
                                    src={suggestedUser.profilePicture}
                                    alt="user"
                                    className="avatar"
                                />
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

            {/* CHAT SECTION */}
            {selectedUser ? (
                <section className="chat-section">
                    {/* ✅ Chat Header */}
                    <div className="chat-header">
                        <div className="chat-header-user">
                            <img
                                src={selectedUser.profilePicture}
                                className="chat-header-avatar"
                                alt="selected_user"
                            />
                            <div>
                                <h2 className="chat-header-name">{selectedUser.username}</h2>
                                <p className={`chat-header-status ${onlineUsers.includes(selectedUser._id) ? 'online' : 'offline'}`}>
                                    {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Messages Component */}
                    <Messages selectedUser={selectedUser} />

                    {/* ✅ Input Section */}
                    <div className="message-input-container">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="message-input"
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                        />
                        <button
                            onClick={() => sendMessageHandler(selectedUser?._id)}
                            className="send-button"
                        >
                            Send
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
