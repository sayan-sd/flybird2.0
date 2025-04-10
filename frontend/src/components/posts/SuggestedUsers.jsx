import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import"../../stylesheets/Suggest.css";

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector((store) => store.auth);
    return (
        <div className="suggested-users-container">
            <div className="suggested-users-header">
                <h2 className="suggested-users-title">Suggested for you</h2>
                <span className="see-all-link">See All</span>
            </div>

            <div className="suggested-users-list">
                {suggestedUsers?.map((user) => (
                    <div key={user._id} className="suggested-user-item">
                        <div className="user-main-info">
                            <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="user-avatar"
                            />
                            <div className="user-text-info">
                                <Link to={`/profile/${user._id}`} className="username-link">
                                    {user.username}
                                </Link>
                                <p className="user-bio">{user.bio}</p>
                            </div>
                        </div>
                        <button className="follow-button">Follow</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedUsers;