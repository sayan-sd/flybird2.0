import "../stylesheets/SideNav.css";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./CreatePost";
import {
    ChatCircleDots,
    House,
    Bell,
    Plus,
    SignOut,
    MagnifyingGlass,
    UserCircle
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "../store/slices/authSlice";
import { setPosts, setSelectedPost } from "../store/slices/postSlice";
import useGetRTM from "../hooks/useGetRTM";

const TopNav = () => {
    useGetRTM();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((store) => store.auth);
    const { likeNotification } = useSelector(store => store.realTimeNotification);
    const [createPostOpen, setCreatePostOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + "/auth/logout",
                { withCredentials: true }
            );
            if (res.data.status) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                toast.success(res.data.message);
                navigate("/auth/login");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    const handleNav = (text) => {
        switch (text) {
            case "Logout":
                logoutHandler();
                break;
            case "Create":
                setCreatePostOpen(true);
                break;
            case "Profile":
                navigate(`/profile/${user?._id}`);
                break;
            case "Home":
                navigate("/");
                break;
            case "Messages":
                navigate("/chats");
                break;
            case "Notifications":
                navigate("/notify");
                break;
            case "Search":
                navigate("/search");
                break;
            default:
                break;
        }
    };

    return (
        <>
            <div className="topnav-container">
                <div className="logo" onClick={() => handleNav("Home")}>FlyBird</div>

                <div className="nav-icons">
                    <div onClick={() => handleNav("Home")} className="icon-box"><House size={26} /></div>
                    <div onClick={() => handleNav("Search")} className="icon-box"><MagnifyingGlass size={26} /></div>
                    <div onClick={() => handleNav("Notifications")} className="icon-box relative">
                        <Bell size={26} />
                        {likeNotification?.length > 0 && (
                            <span className="notif-count">{likeNotification.length}</span>
                        )}
                    </div>
                    <div onClick={() => handleNav("Messages")} className="icon-box"><ChatCircleDots size={26} /></div>
                    <div onClick={() => handleNav("Create")} className="icon-box"><Plus size={26} /></div>
                </div>

                <div className="profile-section">
                    <img
                        src={user?.profilePicture}
                        alt="Profile"
                        className="profile-pic"
                        onClick={() => handleNav("Profile")}
                    />
                    <span className="username">{user?.username}</span>
                    <div className="icon-box" onClick={logoutHandler}><SignOut size={26} /></div>
                </div>
            </div>

            <CreatePost open={createPostOpen} setOpen={setCreatePostOpen} />
        </>
    );
};

export default TopNav;
