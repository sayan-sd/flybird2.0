import React, { useState } from "react";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import store from "../store/store";
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
        <div className="profile-page">

            <div className='profile-top-section'>
                {/*Top Section*/}
                <div className="profile-main">
                    <div className='profile-image-section'>
                        <img
                            src={userProfile?.profilePicture}
                            alt="user"
                            className="profile-image"
                        />
                    </div>

                    

                    {/* right section */}
                    <div className="profile-info">

                        {/* user activity */}
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

                            {/* action buttons */}
                            {isLoggedInUser ? (
                                <div>
                                    <Link
                                        to={"/account/edit"}
                                    >
                                        <button id='edit-profile-btn'><img src={editIcon} alt=''/>Edit Profile</button>
                                        
                                    </Link>
                                </div>

                            
                            ) : isFollowingUser ? (  
                                <div className="following-section">
                                    <button
                                        className="follow-btn"
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
                            <span className="profile-name">{userProfile?.username}</span>
                            <span className="profile-bio">{userProfile?.bio}</span>
                        </div>

                        

                       

                        
                       

                        {/* bio here */}
                        <div></div>
                    </div>
                </div>

                <div className='profile-side'> 
                <p>Something..</p>
                </div>

            </div>

            

            <hr />

            {/* tabs */}
            <div className="profile-tabs">
                <span
                    className={`profile-posts-btn ${
                        activeTab === "posts" ? "profile-active-posts-btn" : ""
                    }`}
                    onClick={() => handleTabChange("posts")}
                >
                    POSTS
                </span>
                <span
                    className={`profile-saved-btn ${
                        activeTab === "saved" ? "profile-active-saved-btn" : ""
                    }`}
                    onClick={() => handleTabChange("saved")}
                >
                    SAVED
                </span>
            </div>

            {/* display posts */}
            <div className="profile-post-section grid grid-cols-3 gap-5">
                {displayedPosts?.map((post, index) => (
                    <div key={index}>
                        <img
                            src={post.image}
                            alt="post"
                            className="profile-posts ,w-full h-full object-cover"
                        />
                        <p className='profile-post-caption'>{post.caption}</p>
                        <p className='profile-post-likes-comments'>
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
