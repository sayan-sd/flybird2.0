import React, { useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { setAuthUser, setUserProfile } from "../store/slices/authSlice";
import '../stylesheets/Profile.css';
import editIcon from '../assets/profile/pen-fill.svg';
import { setSelectedPost } from "../store/slices/postSlice";
import CreatePost from "../components/CreatePost";


const Profile = () => {
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    // Getting all Posts from store
    const { posts } = useSelector((store) => store.post);

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
        <>
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
                        <div className="profile-info-top">
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

                            </div>

                            {isLoggedInUser ? (
                                    <div className='profile-buttons'>
                                        <button className='profile-create-post-btn profile-btn'
                                            onClick={() => setOpen(true)} 
                                        >
                                            Create Post
                                        </button>

                                        <Link to={"/account/edit"}>
                                            <button className='profile-edit-profile-btn profile-btn'>
                                                <img src={editIcon} alt='Edit'/>
                                                Edit Profile
                                            </button>
                                        </Link>
                                    </div>
                                    

                                ) : isFollowingUser ? (  
                                    <div className="profile-buttons">
                                        <button
                                            className="follow-btn unfollow-btn profile-btn"
                                            onClick={followHandler}
                                        >
                                            Unfollow
                                        </button>
                                        <button className="message-btn profile-btn">
                                            Message
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profile-buttons">
                                        <button
                                            className="follow-btn profile-btn"
                                            onClick={followHandler}
                                        >
                                            Follow
                                        </button>
                                    </div>
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
                    <i className="ri-layout-grid-fill"></i> Posts
                </button>
                <button
                    className={`profile-tab-btn ${activeTab === "saved" ? "active-tab" : ""}`}
                    onClick={() => handleTabChange("saved")}
                >
                    <i className="ri-bookmark-fill"></i>Saved
                </button>
            </div>

            {/* Posts Grid */}
            <div className="profile-post-grid">
                {displayedPosts?.length > 0 ? (
                    displayedPosts.map((post, index) => (

                      <Link to='/post' key={index}>
                        <div className="profile-post-item" 
                            
                            onClick={() => {
                                {/*Only finding those posts which id's match with profile post id's*/}
                                const fullPost = posts.find(p => p._id === post._id);

                                {/*Selecting post on click */}
                                dispatch(setSelectedPost(fullPost || post));
                            }}
                                key={index}
                        >
                                
                            <img
                                src={post.image}
                                alt="post"
                                className="profile-post-image"
                            />
                                
                            
                            <div className="post-hover-info">
                                <span className="post-likes">
                                <i className="ri-heart-3-fill"></i> {post.likes.length}
                                </span>
                                <span className="post-comments">
                                <i className="ri-chat-3-line"></i> {post.comments.length}
                                </span>
                            </div>
                        </div>
                      </Link>
                       
                      
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
        {open && <CreatePost open={open} setOpen={setOpen} />}
        </>
    );
};

export default Profile;