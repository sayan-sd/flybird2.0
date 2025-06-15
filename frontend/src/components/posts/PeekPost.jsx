import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import store from "../../store/store";
import axios from "axios";
import { setPosts } from "../../store/slices/postSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import '../../stylesheets/PeekPost.css';
import {ChatCircle, Heart } from "@phosphor-icons/react";

const PeekPost = () => {
    const [text, setText] = useState("");
    const { selectedPost, posts } = useSelector((store) => store.post);
    const [comments, setComments] = useState([]);
    const { user } = useSelector((store) => store.auth);
    const [liked, setLiked] = useState(selectedPost.likes.includes(user?._id) || false);
    const [likeCount, setLikeCount] = useState(selectedPost.likes.length);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedPost) {
            setComments(selectedPost.comments);
        }
    }, [selectedPost]);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    };

    
    const likePostHandler = async (postId) => {
        try {
            const action = liked ? "dislike" : "like";
            const res = await axios.get(
                `${import.meta.env.VITE_SERVER_DOMAIN}/post/${action}/${postId}`,
                { withCredentials: true }
            );

            if (res.data.status) {
                setLikeCount(action === "like" ? likeCount + 1 : likeCount - 1);
                setLiked(!liked);

                const updatedPostData = posts.map((p) =>
                    p._id === postId
                        ? {
                              ...p,
                              likes: liked
                                  ? p.likes.filter((id) => id !== user._id)
                                  : [...p.likes, user._id],
                          }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Error in liking post", error);
            toast.error(error.response?.data?.message || "Error liking post");
        }
    };


    const commentHandler = async () => {
        try {
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN +
                    `/post/comment/${selectedPost._id}`,
                { text },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                const updatedcommentData = [...comments, res.data.comment];
                setComments(updatedcommentData);
                const updatedPostData = posts.map((p) =>
                    p._id === selectedPost._id
                        ? { ...p, comments: updatedcommentData }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.error("Error in commenting on post", error);
            toast.error(error.response.data.message);
        }
    };

    return (
            <div className="peek-post-screen">
                <button className="peek-close-btn"
                    onClick={() => window.history.back()}
                >
                    &times;
                </button>

                <div className='peek-post-image-section'>
                    <img
                        src={selectedPost?.image}
                        alt="post_img"
                        className="peek-post-image"
                    />
                </div>

                <div className="peek-comment-section">
                    <Link to={`/profile/${selectedPost.author._id}`} className='peek-user-link'>
                        <div className="peek-user-info">
                                <img
                                    src={selectedPost?.author?.profilePicture}
                                    alt="user"
                                />
                                <h3>{selectedPost?.author?.username}</h3>
                        </div>
                    </Link>
                    <div className='peek-post-info'>
                        <p className='peek-post-caption'>{selectedPost?.caption}</p>

                        <div className='peek-post-actions'>

                            <div className='peek-like-action'>
                                <button
                                    className={`peek-like-button ${liked ? 'peek-like-button--active' : ''}`}
                                    onClick={() => likePostHandler(selectedPost._id)}
                                    aria-label={liked ? "Unlike post" : "Like post"}
                                >
                                    <Heart 
                                        size={24} 
                                        weight={liked ? "fill" : "regular"} 
                                    />
                                </button>
                            
                                <span className='peek-likes'>{likeCount}</span>
                            </div>

                            <div className='peek-comment-action'>
                                <ChatCircle size={24}/>
                                <span className='peek-comments'>{selectedPost?.comments.length}</span>
                            </div>
                        </div>
                        
                    </div>

                    <div className="peek-comments-list">
                        {comments?.map((comment, index) => (
                            <div className="peek-single-comment" key={index}>
                                <div className="peek-comment-user">
                                    <img
                                        src={comment?.author?.profilePicture}
                                        alt="author"
                                    />
                                    <span>{comment?.author?.username}</span>
                                </div>
                                <p>{comment?.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="peek-add-comment">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={text}
                            onChange={changeEventHandler}
                        />
                        <button
                            disabled={!text.trim()}
                            onClick={commentHandler}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default PeekPost;
