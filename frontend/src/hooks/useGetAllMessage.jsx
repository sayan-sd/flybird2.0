import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../store/slices/chatSlice";

const useGetAllMessage = () => {
    const dispatch = useDispatch();

    const { selectedUser } = useSelector(store => store.auth);

    useEffect(() => {
        // Fetch all posts from API
        const fetchAllMessage = async () => {
            try {
                const res = await axios.get(
                    import.meta.env.VITE_SERVER_DOMAIN + `/message/all/${selectedUser?._id}`,
                    {
                        withCredentials: true,
                    }
                );

                if (res.data.status) {
                    // console.log(res.data.posts);
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.error("Error fetching all posts", error);
                dispatch(setMessages([]));
            }
        };

        fetchAllMessage();
    }, [selectedUser]);
};

export default useGetAllMessage;
