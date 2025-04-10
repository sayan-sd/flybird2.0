import '../stylesheets/Feed.css';
import React from "react";
import Posts from "./posts/Posts";

const Feed = () => {
    return (
        <div className="feed">
            <Posts />
        </div>
    );
};

export default Feed;
