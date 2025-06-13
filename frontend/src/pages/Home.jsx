import React, {useState} from "react";
import Feed from "../components/Feed";
import { Outlet } from "react-router-dom";
import RightSideBar from "../components/posts/RightSideBar";
import useGetAllPosts from "../hooks/useGetAllPosts";
import useGetSuggestedUsers from "../hooks/useGetSuggestedUsers";
import ProfilePreview from "../components/ProfilePreview";
import MiniCreatePost from "../components/MiniCreatePost";


const Home = () => {
    useGetAllPosts();
    useGetSuggestedUsers();


    return (
        <div className="flex">
            <div className="flex-grow">
                <Feed />
                <Outlet />
            </div>
            <div className="rightSidebar mt-10">
                <ProfilePreview />
                <MiniCreatePost />
                <RightSideBar />
            </div>
           
        </div>
    );
};

export default Home;
