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
import store from "../../store/store";
import toast from "react-hot-toast";
import axios from "axios";
import { setPosts, setSelectedPost } from "../../store/slices/postSlice";

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

    // handle post caption
    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    };

    // like post
    const likePostHandler = async (postId) => {
        try {
            const action = liked ? "dislike" : "like";
            const res = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN +
                    `/post/${action}/${postId}`,
                {
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                setLikeCount(action === "like" ? likeCount + 1 : likeCount - 1);
                setLiked(!liked);

                // update the post with latest like count
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
            toast.error(error.response.data.message);
        }
    };

    // comment on post
    const commentHandler = async () => {
        try {
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN +
                    `/post/comment/${post._id}`,
                { text },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
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
            toast.error(error.response.data.message);
        }
    };

    // bookmark post
    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/post/bookmark/${post?._id}`, {withCredentials: true});

            if (res.data.status) {
                toast.success(res.data.message);
            }
            
        }
        catch (error) {
            console.error("Error in bookmarking post", error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className="my-8 w-full max-w-sm mx-auto">
            {/* header */}
            <div className="flex items-center justify-between">
                {/* user details */}
                <div className="flex items-center gap-2">
                    {/* profile pic */}
                    <div className="w-8 h-8 rounded-full bg-red">
                        <img src={post.author.profilePicture} alt="user" />
                    </div>
                    <h3>{post.author.username}</h3>
                </div>

                {/* action buttons */}
                <button
                    className="flex items-center"
                    onClick={() => setPostActionOpen(true)}
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600 ml-1"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600 ml-1"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600 ml-1"></span>
                </button>

                {/* Post Action Pallet */}
                <PostActionPallet
                    open={postActionOpen}
                    setOpen={setPostActionOpen}
                    userId={user?._id}
                    postAuthorId={post?.author?._id}
                    postId={post?._id}
                />
            </div>

            {/* image */}
            <div>
                <img
                    src={post.image}
                    alt="image"
                    className="rounded-sm w-full aspect-square object-cover"
                />
            </div>

            {/* action button */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                    <div className="flex gap-1">
                        <Heart
                            size={24}
                            onClick={() => likePostHandler(post._id)}
                            className={liked ? "text-red" : ""}
                            weight={liked ? "fill" : "regular"}
                        />
                        <span>{likeCount} likes</span>
                    </div>
                    <ChatCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        size={24}
                    />
                    <PaperPlaneTilt size={24} />
                </div>
                <BookmarkSimple size={24} onClick={bookmarkHandler} />
            </div>

            {/* caption */}
            <p className="text-sm text-gray-600">{post.caption}</p>

            {/* view all comments */}
            <button
                onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true);
                }}
            >
                {
                    comments.length === 0? (
                        <span>Do the first comment</span>
                    ) : (
                        <span>View all {comments.length} comments</span>
                    )
                }
            </button>

            {/* CommentDialogue */}
            <CommentDialogue open={open} setOpen={setOpen}/>

            {/* comment */}
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    className="outline-none text-sm w-full"
                    value={text}
                    onChange={changeEventHandler}
                />
                {text && (
                    <span
                        className="text-primary cursor-pointer"
                        onClick={() => commentHandler()}
                    >
                        Post
                    </span>
                )}
            </div>
        </div>
    );
};

export default SinglePost;
