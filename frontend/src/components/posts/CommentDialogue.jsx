import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import store from "../../store/store";
import axios from "axios";
import { setPosts } from "../../store/slices/postSlice";
import toast from "react-hot-toast";
import "../../stylesheets/CommentDialogue.css"; // Make sure this path is correct

const CommentDialogue = ({ open, setOpen }) => {
    const [text, setText] = useState("");
    const { selectedPost, posts } = useSelector((store) => store.post);
    const [comments, setComments] = useState([]);

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

    useEffect(() => {
        function handleEscapeKey(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("keydown", handleEscapeKey);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [open, setOpen]);

    if (!open) return null;

    const handleDialogClick = (e) => {
        e.stopPropagation();
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
        <div id="comment-dialogue" onClick={() => setOpen(false)}>
            <div className="dialog-box" onClick={handleDialogClick}>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="close-btn"
                >
                    &times;
                </button>

                <img
                    src={selectedPost?.image}
                    alt="post_img"
                    className="post-image"
                />

                <div className="comment-section">
                    <div className="user-info">
                        <img
                            src={selectedPost?.author?.profilePicture}
                            alt="user"
                        />
                        <h3>{selectedPost?.author?.username}</h3>
                    </div>
                    <hr />

                    <div className="comments-list">
                        {comments?.map((comment, index) => (
                            <div className="single-comment" key={index}>
                                <div className="comment-user">
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

                    <div className="add-comment">
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
        </div>
    );
};

export default CommentDialogue;
