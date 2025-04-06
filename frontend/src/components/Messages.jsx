import React from "react";
import { useSelector } from "react-redux";
import useGetAllMessage from "../hooks/useGetAllMessage";
import useGetRTM from "../hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
    useGetAllMessage();
    useGetRTM();

    const { messages } = useSelector(store => store.chat);
    const {user} = useSelector(store => store.auth);

    return (
        <div className=" overflow-y-auto flex-1 p-4">
            {messages && messages.map((msg, idx) => {
                return (
                    <div className={`flex ${msg.senderId === user?._id ? "justify-end" : "justify-start"}`} key={idx}>
                        <div className={`p-2 rounded-lg max-w-xs break-words ${msg.senderId === user?._id ? "bg-primary text-white" : "bg-gray-200"} mb-2`}>
                            {msg?.message}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Messages;
