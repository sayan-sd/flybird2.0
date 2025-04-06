import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./CreatePost";
import '../stylesheets/SideNav.css';

import {
    Chat,
    DotsThreeCircle,
    Shapes,
    SignOut,
    UserCircle,
    Users,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import store from "../store/store";
import { setAuthUser } from "../store/slices/authSlice";
import { setPosts, setSelectedPost } from "../store/slices/postSlice";
import useGetRTM from "../hooks/useGetRTM";

const SideNav = () => {
    useGetRTM();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((store) => store.auth);
    const {likeNotification} = useSelector(store => store.realTimeNotification);

    const [createPostOpen, setCreatePostOpen] = useState(false);

    // logout
    const logoutHandler = async () => {
        try {
            const res = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/logout",
                { withCredentials: true }
            );

            if (res.data.status) {
                // clean up tasks
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                
                toast.success(res.data.message);
                navigate("/auth/login");
            }
        } catch (error) {
            console.error("Error in logging out user", error);
            toast.error(error.response.data.message);
        }
    };


    // side bar handler
    const sideBarHandler = (text) => {
        if (text === "Logout") {
            logoutHandler();
        } else if (text === "Create") {
            setCreatePostOpen(true);
        }
        else if (text === "Profile") {
            navigate(`/profile/${user?._id}`);
        }
        else if (text === "Home") {
            navigate("/");
        }
        else if (text === "Messages") {
            navigate("/chats");
        }
        else if (text === "Notifications") {
            navigate("/notify");
        }
    };

    const sideBarItems = [
        { icon: <Chat size={24} />, text: "Home" },
        { icon: <Chat size={24} />, text: "Search" },
        { icon: <Chat size={24} />, text: "Trending" },
        { icon: <Chat size={24} />, text: "Messages" },
        { icon: <Chat size={24} />, text: "Notifications" },
        { icon: <Chat size={24} />, text: "Create" },
        {
            icon: (
                <img
                    src={user?.profilePicture}
                    alt="profile"
                    className="w-8 h-8 rounded-full"
                />
            ),
            text: "Profile",
        },
        { icon: <Chat size={24} />, text: "Logout" },
    ];

    return (
        <div className="fixed top-0 left-0 z-10 px-4 border-r border-stroke w-[15%] h-screen">
            <div className="flex flex-col">
                {/* logo */}
                <h1 className="my-8 pl-3 font-bold text-xl">FlyBird</h1>

                {/* Nav options */}
                <div>
                    {sideBarItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 relative hover:bg-stroke cursor-pointer"
                            onClick={() => sideBarHandler(item.text)}
                        >
                            {item.icon}
                            <span>{item.text}</span>

                            {/* notification info */}
                            {
                                item.text === "Notifications" && likeNotification?.length > 0 && (
                                    <div className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-primary rounded-full">
                                        <span className="text-white text-xs">{likeNotification.length}</span>
                                    </div>
                                )
                            }
                        </div>
                    ))}
                </div>
            </div>

            {/* create post dialogue */}
            <CreatePost open={createPostOpen} setOpen={setCreatePostOpen} />
        </div>
    );
};

export default SideNav;
