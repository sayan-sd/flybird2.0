import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts } from "../../store/slices/postSlice";
import toast from "react-hot-toast";
import "../../stylesheets/CommentDialogue.css";

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
    setText(e.target.value);
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
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/post/comment/${selectedPost._id}`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.status) {
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);

        const updatedPosts = posts.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: updatedComments }
            : post
        );

        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error("Error in commenting on post", error);
      toast.error(error.response?.data?.message || "Error adding comment");
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
          ×
        </button>

        {/* Post Image */}
        <div className="post-image-container">
          <img
            src={selectedPost?.image}
            alt="Post"
            className="post-image"
          />
        </div>

        {/* Comments and input section */}
        <div className="content-section">

          {/* User Info */}
          <div className="user-info">
            <img
              src={selectedPost?.author?.profilePicture}
              alt="User"
              className="user-profile-pic"
            />
            <h3>{selectedPost?.author?.username}</h3>
          </div>

          <hr />

          {/* Comments List */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="single-comment">
                  <div className="comment-user">
                    <img
                      src={comment?.author?.profilePicture}
                      alt="Comment Author"
                      className="comment-user-pic"
                    />
                    <span>{comment?.author?.username}</span>
                  </div>
                  <p className="comment-text">{comment?.text}</p>
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet. Start the conversation!</div>
            )}
          </div>

          {/* Add new Comment */}
          <div className="add-comment">
            <input
              type="text"
              placeholder="Add a comment..."
              value={text}
              onChange={changeEventHandler}
            />
            <button
              onClick={commentHandler}
              disabled={!text.trim()}
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
