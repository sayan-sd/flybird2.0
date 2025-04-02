import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/slices/authSlice";
import Messages from "../components/Messages";
import toast from "react-hot-toast";
import { setMessages } from "../store/slices/chatSlice";
import axios from "axios";
import useGetAllMessage from "../hooks/useGetAllMessage";

const ChatPage = () => {
    const dispatch = useDispatch();

    const { user, suggestedUsers, selectedUser } = useSelector(
        (store) => store.auth
    );
    const { onlineUsers } = useSelector((store) => store.chat);
    const { messages } = useSelector(store => store.chat);

    const [textMessage, setTextMessage] = useState("");

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN +
                    `/message/send/${receiverId}`,
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
            toast.error(error.response.data.message);
        }
    };

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
            dispatch(setMessages([]));
        }
    }, [])

    return (
        <div className="flex ml-[16%] h-screen">
            {/* contact */}
            <section>
                <h1 className="font-bold mb-4 px-3 text-xl">
                    {user?.username}
                </h1>
                <hr />

                {/* suggessted users */}
                <div className="flex flex-col gap-5 mt-2 pr-12">
                    {suggestedUsers.map((suggestedUser) => {
                        const isOnline = onlineUsers.includes(
                            suggestedUser._id
                        );
                        return (
                            <div
                                key={suggestedUser._id}
                                className="flex items-center gap-3"
                                onClick={() =>
                                    dispatch(setSelectedUser(suggestedUser))
                                }
                            >
                                <img
                                    src={suggestedUser.profilePicture}
                                    alt="suggested user"
                                    className="w-8 h-8 rounded-full"
                                />
                                <h2 className="font-semibold text-xs flex gap-3">
                                    {suggestedUser.username}
                                    <span
                                        className={`text-xs ${
                                            isOnline
                                                ? "bg-primary"
                                                : "bg-red-500"
                                        } p-1 rounded-full text-white`}
                                    >
                                        {isOnline ? "Online" : "Offline"}
                                    </span>
                                </h2>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* selected user infromation */}
            {selectedUser ? (
                <section className="flex-1 p-10 border-l border-stroke flex flex-col h-full">
                    <div>
                        <img
                            src={selectedUser.profilePicture}
                            alt="selected_user"
                            className="w-20 h-20 rounded-full"
                        />
                        <h2 className="font-semibold text-xl flex gap-3">
                            {selectedUser.username}
                        </h2>
                    </div>
                    <hr />

                    {/* messages */}
                    <Messages selectedUser={selectedUser} />

                    {/* input box */}
                    <div>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 mr-2 outline rounded-md p-2 w-[90%]"
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                        />
                        <button
                            onClick={() =>
                                sendMessageHandler(selectedUser?._id)
                            }
                            className="p-2 bg-primary text-white rounded-md cursor-pointer"
                        >
                            Send
                        </button>
                    </div>
                </section>
            ) : (
                <div className="flex items-center justify-center w-[80%]">
                    <h2 className="text-2xl font-semibold">
                        Select a user to start a conversation
                    </h2>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
