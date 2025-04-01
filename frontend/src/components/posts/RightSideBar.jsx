import React from "react";
import { useSelector } from "react-redux";
import SuggestedUsers from "./SuggestedUsers";

const RightSideBar = () => {
    const { user } = useSelector((state) => state.auth);
    return (
        <div className="w-fit my-10 pr-32">
            <SuggestedUsers />
        </div>
    );
};

export default RightSideBar;
