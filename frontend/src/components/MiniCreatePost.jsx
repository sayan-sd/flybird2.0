import React, { useState } from "react";
import CreatePost from "./CreatePost";
import { useSelector } from "react-redux";
import "../stylesheets/MiniCreatePost.css";

const MiniCreatePost = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <div
        className="mini-create-post-box"
      >
        <div className="mini-create-post-top">
          <div className="mini-create-post-avatar-container">
            <img
              src={user?.profilePicture}
              alt="profile"
              className="mini-create-post-avatar"
            />
          </div>

          <div className="mini-create-post-info">
            <h4 className="mini-create-post-username">{user?.username}</h4>
            <div className="mini-create-post-visibility">
              <i className="ri-earth-fill visibility-icon"></i>
              <span>Public</span>
            </div>
          </div>
        </div>

        <div className="mini-create-post-action">
            
          <button className="mini-create-post-btn" onClick={() => setOpen(true)} >Share your thoughts</button>
        </div>
      </div>

      {open && <CreatePost open={open} setOpen={setOpen} />}
    </>
  );
};

export default MiniCreatePost;
