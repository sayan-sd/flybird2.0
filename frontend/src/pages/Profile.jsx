import React, { useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser, setUserProfile } from "../store/slices/authSlice";
import '../stylesheets/Profile.css';
import editIcon from '../assets/profile/pen-fill.svg';


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
                `${import.meta.env.VITE_SERVER_DOMAIN}/user/follow-or-unfollow/${userId}`,
                {},
                { withCredentials: true }
            );

            if (res.data.status) {
                let updatedUserData, updatedFriendUserData;

                if (res.data.type === "follow") {
                    updatedUserData = {
                        ...user,
                        following: [...user.following, userId],
                    };
                    updatedFriendUserData = {
                        ...userProfile,
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
        <div className="profile-page">
            {/* Top Section */}
            <div className='profile-top-section'>
                <div className="profile-main">
                    <div className='profile-image-section'>
                        <img
                            src={userProfile?.profilePicture}
                            alt="user"
                            className="profile-image"
                        />
                    </div>

                    <div className="profile-info">
                        <div className="profile-user-info">
                            <div className='info-box'>
                                <p className='user-info-value'>
                                    {userProfile?.posts?.length}
                                </p>
                                <p className='user-info-label'>
            
                                    Posts
                                </p>
                            </div>

                            <div className='info-box'>
                                <p className='user-info-value'>
                                    {userProfile?.followers?.length}
                                </p>
                                <p className='user-info-label'>
                                    Followers
                                </p>
                            </div>

                            <div className='info-box'>
                                <p className='user-info-value'>
                                    {userProfile?.following?.length}
                                </p>
                                <p className='user-info-label'>
                                    Following
                                </p>
                            </div>

                            {isLoggedInUser ? (
                                <div>
                                    <Link to={"/account/edit"}>
                                        <button id='edit-profile-btn'>
                                            <img src={editIcon} alt='Edit'/>
                                            Edit Profile
                                        </button>
                                    </Link>
                                </div>
                            ) : isFollowingUser ? (  
                                <div className="following-section">
                                    <button
                                        className="follow-btn unfollow-btn"
                                        onClick={followHandler}
                                    >
                                        Unfollow
                                    </button>
                                    <button className="message-btn">
                                        Message
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="follow-btn"
                                    onClick={followHandler}
                                >
                                    Follow
                                </button>
                            )}
                        </div>

                        <div className='profile-head'>
                            <h1 className="profile-name">{userProfile?.username}</h1>
                            <p className="profile-bio">{userProfile?.bio}</p>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="profile-divider"/>

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    className={`profile-tab-btn ${activeTab === "posts" ? "active-tab" : ""}`}
                    onClick={() => handleTabChange("posts")}
                >
                    <i class="ri-layout-grid-fill"></i> Posts
                </button>
                <button
                    className={`profile-tab-btn ${activeTab === "saved" ? "active-tab" : ""}`}
                    onClick={() => handleTabChange("saved")}
                >
                    <i class="ri-bookmark-fill"></i>Saved
                </button>
            </div>

            {/* Posts Grid */}
            <div className="profile-post-grid">
                {displayedPosts?.length > 0 ? (
                    displayedPosts.map((post, index) => (
                        <div className="profile-post-item" key={index}>
                            <img
                                src={post.image}
                                alt="post"
                                className="profile-post-image"
                            />
                            <div className="post-hover-info">
                                <span className="post-likes">
                                <i class="ri-heart-3-fill"></i> {post.likes.length}
                                </span>
                                <span className="post-comments">
                                <i class="ri-chat-3-line"></i> {post.comments.length}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-posts-message">
                        {activeTab === "posts" 
                            ? "No posts yet" 
                            : "No saved posts"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;