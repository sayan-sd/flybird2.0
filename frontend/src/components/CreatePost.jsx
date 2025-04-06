import React, { useEffect, useRef, useState } from "react";
import { readFileAsDataURL } from "../utils/readFileAsDataURL";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import store from "../store/store";
import { setPosts } from "../store/slices/postSlice";
import '../stylesheets/CreatePost.css';

const CreatePost = ({ open, setOpen }) => {
    const imageRef = useRef();
    const [file, setFile] = useState("");
    const [caption, setCaption] = useState("");
    const [iamgePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);

    const { user } = useSelector((store) => store.auth);
    const { posts } = useSelector((store) => store.post);
    const dispatch = useDispatch();

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

    // create post handler
    const createPostHandler = async () => {
        const formData = new FormData();
        formData.append("caption", caption);
        if (iamgePreview) formData.append("image", file);

        try {
            setLoading(true);
            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/post/addpost",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                dispatch(setPosts([res.data.post, ...posts])); // add new post to post slice
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            console.error("Error while creating post", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    // image upload handler
    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const dataUrl = await readFileAsDataURL(file);
            setImagePreview(dataUrl);
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

                <h2 className="text-2xl font-semibold">Create Post</h2>

                <div className="flex gap-3 items-center">
                    <img
                        src={user.profilePicture}
                        alt="user"
                        className="w-8 h-8 rounded-full"
                    />
                    <div>
                        <h2 className="font-semibold text-xs">
                            {user.username}
                        </h2>
                        <span className="text-gray-600 text-xs">
                            Bio here...
                        </span>
                    </div>
                </div>

                {/* textarea */}
                <textarea
                    className="focus-visible:ring-transparent border-none w-full resize-none h-12"
                    placeholder="What's on your mind"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                ></textarea>

                {/* image preview */}
                {iamgePreview && (
                    <div className="w-full h-64 flex items-center justify-center">
                        <img
                            src={iamgePreview}
                            alt="preview"
                            className="object-cover h-full w-full rounded-md"
                        />
                    </div>
                )}

                {/* upload image */}
                <input
                    type="file"
                    className="hidden"
                    ref={imageRef}
                    onChange={fileChangeHandler}
                />
                <button
                    onClick={() => imageRef.current.click()}
                    className="w-fit mx-auto bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded"
                >
                    Upload Image
                </button>

                {/* Post button on image upload */}
                {iamgePreview &&
                    (loading ? (
                        <button className="w-fit mx-auto bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded">
                            Posting...
                        </button>
                    ) : (
                        <button
                            type="submit"
                            onClick={createPostHandler}
                            className="w-fit mx-auto bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded"
                        >
                            Post
                        </button>
                    ))}
            </div>
        </div>
    );
};

export default CreatePost;
