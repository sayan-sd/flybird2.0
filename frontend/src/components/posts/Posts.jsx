import React from "react";
import SinglePost from "./SinglePost";
import { useSelector } from "react-redux";
import store from "../../store/store";

const Posts = () => {
    const { posts } = useSelector((store) => store.post);
    return (
        <div>
            {posts.map((post, index) => (
                <SinglePost key={index} post={post} />
            ))}
        </div>
    );
};

export default Posts;
