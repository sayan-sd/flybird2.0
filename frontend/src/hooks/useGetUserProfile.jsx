import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/authSlice";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {

        // Fetch all posts from API
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(
                    import.meta.env.VITE_SERVER_DOMAIN + `/user/profile/${userId}`,
                    {
                        withCredentials: true,
                    }
                );

                if (res.data.status) {
                    // console.log(res.data.posts);
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.error("Error fetching all posts", error);
            }
        };

        fetchUserProfile();
    }, [userId]);
};

export default useGetUserProfile;
