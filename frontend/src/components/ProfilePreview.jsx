// components/ProfilePreview.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../stylesheets/ProfilePreview.css';

const ProfilePreview = () => {
  const { user } = useSelector((store) => store.auth);

  if (!user) return null; 

  return (
    <div className="profile-preview-card">
      <div className="profile-preview-image-box">
        <img src={user.profilePicture} alt="profile" className="profile-preview-image" />
      </div>
      <p className="profile-preview-name">{user.username}</p>

      <div className="profile-preview-stats">
        <div className="preview-stats">
          <p className="stats-value">{user.posts?.length || 0}</p>
          <p className="stats-label">Posts</p>
        </div>
        <div className="preview-stats">
          <p className="stats-value">{user.followers?.length || 0}</p>
          <p className="stats-label">Followers</p>
        </div>
        <div className="preview-stats">
          <p className="stats-value">{user.following?.length || 0}</p>
          <p className="stats-label">Following</p>
        </div>
      </div>

      <Link to={`/profile/${user._id}`}>
        <button className="profile-preview-btn">View Profile</button>
      </Link>
    </div>
  );
};

export default ProfilePreview;
