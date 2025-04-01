import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPosts } from "../store/slices/postSlice";
import { setSuggestedUsers } from "../store/slices/authSlice";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch all posts from API
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get(
                    import.meta.env.VITE_SERVER_DOMAIN + "/user/suggested",
                    {
                        withCredentials: true,
                    }
                );

                if (res.data.status) {
                    // console.log(res.data.posts);
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.error("Error fetching all posts", error);
            }
        };

        fetchSuggestedUsers();
    }, []);
};

export default useGetSuggestedUsers;
