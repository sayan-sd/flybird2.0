import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import store from "../../store/store";
import axios from "axios";
import { setPosts } from "../../store/slices/postSlice";
import toast from "react-hot-toast";

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

    // add comment value change
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

    // If `open` is false, don't render anything
    if (!open) return null;

    // Stop propagation of clicks on the dialog box so clicking inside
    // doesn't close the dialog, while clicking on the overlay does.
    const handleDialogClick = (e) => {
        e.stopPropagation();
    };

    // comment handlers
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
            onClick={() => setOpen(false)} // close on overlay click
        >
            <div
                className="relative w-full max-w-xl p-4 bg-white rounded-md shadow-lg flex items-center justify-between"
                onClick={handleDialogClick}
            >
                {/* Close button  */}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                >
                    &times;
                </button>

                {/* Dialog content */}
                <img
                    src={selectedPost?.image}
                    alt="post_img"
                    className="w-1/2 h-auto rounded"
                />

                {/* comment div */}
                <div className="w-1/2 flex flex-col justify-between">
                    {/* user details */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* profile pic */}
                            <div className="w-8 h-8 rounded-full bg-red">
                                <img
                                    src={selectedPost?.author?.profilePicture}
                                    alt="user"
                                />
                            </div>
                            <h3>{selectedPost?.author?.username}</h3>
                        </div>
                    </div>
                    <hr />

                    {/* comments */}
                    <div className="flex-1 overflow-y-auto max-h-96 py-4 px-2">
                        {comments?.map((comment, index) => (
                            <div key={index}>
                                {/* user details */}
                                <div className="flex items-center gap-2">
                                    <img
                                        src={comment?.author?.profilePicture}
                                        alt="author"
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span>{comment?.author?.username}</span>
                                </div>

                                {/* comment */}
                                <div className="ml-8">
                                    <p>{comment?.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* add comment */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full outline-none border border-stroke p-2 rounded"
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
