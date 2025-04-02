import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import store from "../../store/store";
import { setPosts } from "../../store/slices/postSlice";

const PostActionPallet = ({ open, setOpen, userId, postAuthorId, postId }) => {
    const { posts } = useSelector((store) => store.post);
    const dispatch = useDispatch();

    const { user } = useSelector(store => store.auth);

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

    const deletePostHandler = async (e) => {
        try {
            const res = await axios.delete(
                import.meta.env.VITE_SERVER_DOMAIN + `/post/delete/${postId}`,
                { withCredentials: true }
            );

            if (res.data.status) {
                const updatedPostsData = posts.filter(post => post._id !== postId);
                dispatch(setPosts(updatedPostsData));
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
            onClick={() => setOpen(false)} // close on overlay click
        >
            <div
                className="relative w-full max-w-xl p-4 bg-white rounded-md shadow-lg"
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

                <div className="w-full flex flex-col gap-3">
                    {
                        postAuthorId !== user?._id && (
                            <button className="px-4 py-2 text-white bg-primary w-48 mx-auto">
                                Follow
                            </button>
                        )
                    }

                    <button className="px-4 py-2 text-black w-48 mx-auto">
                        Add to favorites
                    </button>

                    {/* delete post */}
                    {userId === postAuthorId ? (
                        <button
                            className="px-4 py-2 text-white bg-red w-48 mx-auto"
                            onClick={deletePostHandler}
                        >
                            Delete
                        </button>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostActionPallet;
