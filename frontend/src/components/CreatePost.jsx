import React, { useEffect, useRef, useState } from "react";
import "../stylesheets/CreatePost.css";
import { readFileAsDataURL } from "../utils/readFileAsDataURL";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../store/slices/postSlice";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const handleDialogClick = (e) => e.stopPropagation();

  const createPostHandler = async () => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/post/addpost",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.data.status) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      console.error("Post Error:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  return (
    <div className="backdrop-blur-xs" onClick={() => setOpen(false)}>
      <div className="modal-container" onClick={handleDialogClick}>
        <button className="close-button" onClick={() => setOpen(false)}>
          &times;
        </button>

        <h2 className="heading">Create Post</h2>

        <div className="user-info">
          <img
            src={user.profilePicture}
            alt="user"
            className="user-image"
          />
          <div>
            <div className="username">{user.username}</div>
            <div className="bio">Bio here...</div>
          </div>
        </div>

        <textarea
          className="textarea"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {imagePreview && (
          <div className="image-preview-container">
            <img
              src={imagePreview}
              alt="preview"
              className="image-preview"
            />
          </div>
        )}

        <input
          type="file"
          className="hidden"
          ref={imageRef}
          onChange={fileChangeHandler}
        />

        <div className="button-group">
          <button
            className="button"
            onClick={() => imageRef.current.click()}
          >
            Upload Image
          </button>

          {imagePreview && (
            <button
              className="button"
              onClick={createPostHandler}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
