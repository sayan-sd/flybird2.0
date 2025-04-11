import {
    BookmarkSimple,
    ChatCircle,
    Heart,
    PaperPlaneTilt,
} from "@phosphor-icons/react";
import React, { useState } from "react";
import CommentDialogue from "./CommentDialogue";
import PostActionPallet from "./PostActionPallet";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { setPosts, setSelectedPost } from "../../store/slices/postSlice";
import '../../stylesheets/Post.css'

const SinglePost = ({ post }) => {
    const { user } = useSelector((store) => store.auth);
    const { posts } = useSelector((store) => store.post);
    const dispatch = useDispatch();

    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [postActionOpen, setPostActionOpen] = useState(false);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [comments, setComments] = useState(post.comments);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        setText(inputText.trim() ? inputText : "");
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
                `${import.meta.env.VITE_SERVER_DOMAIN}/post/comment/${post._id}`,
                { text },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                const updatedCommentData = [...comments, res.data.comment];
                setComments(updatedCommentData);
                const updatedPostData = posts.map((p) =>
                    p._id === post._id
                        ? { ...p, comments: updatedCommentData }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.error("Error in commenting on post", error);
            toast.error(error.response?.data?.message || "Error adding comment");
        }
    };

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN +
                    `/post/bookmark/${post?._id}`,
                { withCredentials: true }
            );

            if (res.data.status) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Error in bookmarking post", error);
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="post-container">
            {/* Header */}
            <div className="post-header">
                <div className="post-user-info">
                    <img
                        src={post?.author.profilePicture}
                        className="post-user-avatar"
                        alt={post.author.username}
                    />
                    <span className="post-username">{post.author.username}</span>
                </div>

                <button
                    className="post-actions-button"
                    onClick={() => setPostActionOpen(true)}
                    aria-label="Post actions"
                >
                    <span className="post-action-dot"></span>
                    <span className="post-action-dot"></span>
                    <span className="post-action-dot"></span>
                </button>

                <PostActionPallet
                    open={postActionOpen}
                    setOpen={setPostActionOpen}
                    userId={user?._id}
                    postAuthorId={post?.author?._id}
                    postId={post?._id}
                />
            </div>

            {/* Image */}
            <div className="post-image-container">
                <img
                    src={post.image}
                    alt={`Post by ${post.author.username}`}
                    className="post-image"
                />
            </div>

            {/* Action Buttons */}
            <div className="post-actions">
                <div className="post-left-actions">
                    <button 
                        className={`post-action-button ${liked ? 'post-action-button--active' : ''}`}
                        onClick={() => likePostHandler(post._id)}
                        aria-label={liked ? "Unlike post" : "Like post"}
                    >
                        <Heart
                            size={24}
                            weight={liked ? "fill" : "regular"}
                        />
                        <span className="post-like-count">{likeCount} likes</span>
                    </button>
                    <button 
                        className="post-action-button"
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        aria-label="Comment"
                    >
                        <ChatCircle size={24} />
                    </button>
                    <button className="post-action-button" aria-label="Share">
                        <PaperPlaneTilt size={24} />
                    </button>
                </div>
                <button 
                    className="post-action-button"
                    onClick={bookmarkHandler}
                    aria-label="Bookmark"
                >
                    <BookmarkSimple size={24} />
                </button>
            </div>

            {/* Caption */}
            <div className="post-caption">
                <span className="post-caption-username">{post.author.username}</span>
                <span className="post-caption-text">{post.caption}</span>
            </div>

            {/* Comments */}
            <button
                className="post-comments-button"
                onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}
            >
                {comments.length === 0
                    ? "Be the first to comment"
                    : `View all ${comments.length} comments`}
            </button>

            <CommentDialogue open={open} setOpen={setOpen} />

            {/* Add Comment */}
            <div className="post-add-comment">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    className="post-comment-input"
                    value={text}
                    onChange={changeEventHandler}
                />
                {text && (
                    <button
                        className="post-comment-submit"
                        onClick={commentHandler}
                    >
                        Post
                    </button>
                )}
            </div>
        </div>
    );
};

export default SinglePost;