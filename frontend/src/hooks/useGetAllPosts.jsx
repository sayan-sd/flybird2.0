import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "../store/slices/postSlice";

const useGetAllPosts = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch all posts from API
        const fetchAllPosts = async () => {
            try {
                const res = await axios.get(
                    import.meta.env.VITE_SERVER_DOMAIN + "/post/all",
                    {
                        withCredentials: true,
                    }
                );

                if (res.data.status) {
                    // console.log(res.data.posts);
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.error("Error fetching all posts", error);
            }
        };

        fetchAllPosts();
    }, []);
};

export default useGetAllPosts;
