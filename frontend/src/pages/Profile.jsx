import React, { useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import store from "../store/store";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser, setUserProfile } from "../store/slices/authSlice";

const Profile = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);

    const [activeTab, setActiveTab] = useState("posts");
    const { userProfile, user } = useSelector((store) => store.auth);

    const isLoggedInUser = user?._id === userId;
    const isFollowingUser = user?.following?.includes(userId);
    const displayedPosts =
        activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const followHandler = async () => {
        try {
            const res = await axios.post(
                `${
                    import.meta.env.VITE_SERVER_DOMAIN
                }/user/follow-or-unfollow/${userId}`,
                {}, // Empty body
                { withCredentials: true } // Moved here
            );

            if (res.data.status) {
                let updatedUserData, updatedFriendUserData;

                if (res.data.type === "follow") {
                    updatedUserData = {
                        ...user,
                        following: [...user.following, userId],
                    };
                    updatedFriendUserData = {
                        userProfile,
                        followers: [...userProfile.followers, user._id],
                    };
                } else {
                    updatedUserData = {
                        ...user,
                        following: user.following.filter((id) => id !== userId),
                    };
                    updatedFriendUserData = {
                        ...userProfile,
                        followers: userProfile.followers.filter(
                            (id) => id !== user._id
                        ),
                    };
                }
                dispatch(setAuthUser(updatedUserData));
                dispatch(setUserProfile(updatedFriendUserData));

                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Error following user", error);
            toast.error(error.response.data.message);
        }
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

                    <span className="text-gray-600">{userProfile?.bio}</span>

                    {/* action buttons */}
                    {isLoggedInUser ? (
                        <div>
                            <Link
                                to={"/account/edit"}
                                className="p-4 bg-primary text-white rounded-md mr-3"
                            >
                                Edit Profile
                            </Link>
                            <button className="p-4 bg-primary text-white rounded-md">
                                Something
                            </button>
                        </div>
                    ) : isFollowingUser ? (
                        <div className="flex gap-5">
                            <button
                                className="p-4 bg-primary text-white rounded-md"
                                onClick={followHandler}
                            >
                                Unfollow
                            </button>
                            <button className="p-4 bg-primary text-white rounded-md">
                                Message
                            </button>
                        </div>
                    ) : (
                        <button
                            className="p-4 bg-primary text-white rounded-md"
                            onClick={followHandler}
                        >
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
                        <p>
                            {post.likes.length} likes & {post.comments.length}{" "}
                            comments
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
