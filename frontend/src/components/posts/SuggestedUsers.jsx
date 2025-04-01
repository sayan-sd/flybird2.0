import React from "react";
import { useSelector } from "react-redux";
import store from "../../store/store";
import { Link } from "react-router-dom";

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector((store) => store.auth);
    return (
        <div className="my-10">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-600">
                    Suggested for you
                </h2>
                <span className="font-medium cursor-pointer">See All</span>
            </div>

            {/* suggested users */}
            {suggestedUsers?.map((user) => {
                return (
                    <div key={user._id}>
                        <div className="flex items-center gap-3">
                            <img
                                src={user.profilePicture}
                                alt="user"
                                className="w-8 h-8 rounded-full"
                            />
                            <Link to={`/profile/${user._id}`}>
                                <span>{user.username}</span>
                            </Link>
                            <span className="text-gray-600 text-xs">
                                {user.bio}
                            </span>

                            {/* follow button */}
                            <button className="text-white rounded-md p-3 text-xs bg-primary ">
                                Follow
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SuggestedUsers;
