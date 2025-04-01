import React, { useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import store from "../store/store";

const Profile = () => {
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);

    const [activeTab, setActiveTab] = useState("posts");
    const { userProfile } = useSelector((store) => store.auth);

    const isLoggedInUser = false; // TODO: check if user is logged in
    const isFollowingUser = true; // TODO: check if user is following the current user
    const displayedPosts = activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;


    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex max-w-4xl justify-center mx-auto pl-10 flex-col">
            <div className="grid grid-cols-2 gap-5">
                <img
                    src={userProfile?.profilePicture}
                    alt="user"
                    className="w-32 h-32 rounded-full"
                />

                {/* right section */}
                <div className="flex flex-col gap-5">
                    <span className="font-semibold text-2xl">
                        {userProfile?.username}
                    </span>

                    {/* action buttons */}
                    {isLoggedInUser ? (
                        <div>
                            <button className="p-4 bg-primary text-white rounded-md mr-3">
                                Edit Profile
                            </button>
                            <button className="p-4 bg-primary text-white rounded-md">
                                Something
                            </button>
                        </div>
                    ) : isFollowingUser ? (
                        <div className="flex gap-5">
                            <button className="p-4 bg-primary text-white rounded-md">
                                Unfollow
                            </button>
                            <button className="p-4 bg-primary text-white rounded-md">
                                Message
                            </button>
                        </div>
                    ) : (
                        <button className="p-4 bg-primary text-white rounded-md">
                            Follow
                        </button>
                    )}

                    {/* user activity */}
                    <div className="flex gap-3">
                        <p>{userProfile?.posts?.length} posts | </p>
                        <p>{userProfile?.followers?.length} followers |</p>
                        <p>{userProfile?.following?.length} following</p>
                    </div>

                    {/* bio here */}
                    <div></div>
                </div>
            </div>

            <hr />

            {/* tabs */}
            <div className="flex items-center gap-10 text-xl justify-center my-3">
                <span
                    className={`py-3 cursor-pointer ${
                        activeTab === "posts" ? "bg-primary text-white" : ""
                    }`}
                    onClick={() => handleTabChange("posts")}
                >
                    POSTS
                </span>
                <span
                    className={`py-3 cursor-pointer ${
                        activeTab === "saved" ? "bg-primary text-white" : ""
                    }`}
                    onClick={() => handleTabChange("saved")}
                >
                    SAVED
                </span>
            </div>

            {/* display posts */}
            <div className="grid grid-cols-3 gap-5">
                {displayedPosts?.map((post, index) => (
                    <div key={index}>
                        <img
                            src={post.image}
                            alt="post"
                            className="w-full h-full object-cover"
                        />
                        <p>{post.caption}</p>
                        <p>{post.likes.length} likes & {post.comments.length} comments</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
