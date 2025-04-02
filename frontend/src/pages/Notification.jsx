import React from "react";
import { useDispatch, useSelector } from "react-redux";

const Notification = () => {
    const dispatch = useDispatch();

    const { likeNotification } = useSelector(
        (store) => store.realTimeNotification
    );
    return (
        <div className="ml-[16%] ">
            {likeNotification.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                likeNotification.map((notification) => {
                    return (
                        <div key={notification.userId} className="flex gap-3 items-center mb-2">
                            <img
                                src={notification.userDetails.profilePicture}
                                alt="user"
                                className="w-8 h-8 rounded-full"
                            />
                            <span>
                                {notification.userDetails.username} liked your
                                post
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Notification;
