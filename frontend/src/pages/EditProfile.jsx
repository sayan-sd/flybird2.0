import axios from "axios";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "../store/slices/authSlice";

const EditProfile = () => {
    const { user } = useSelector((store) => store.auth);

    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePicture: user?.profilePicture,
        bio: user?.bio,
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];

        if (file) {
            setInput({ ...input, profilePicture: file });
        }
    };

    const imageRef = useRef();

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        if (input.profilePicture) {
            formData.append("profilePicture", input.profilePicture);
        }
        try {
            setLoading(true);

            const res = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/user/profile/edit",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (res.data.status) {
                // update user in state
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
                navigate(`/profile/${user?._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex max-w-2xl mx-auto pl-10 flex-col gap-5">
            <h1 className="font-semibold text-2xl">Edit Profile</h1>

            {/* update photo */}
            <div className="w-full flex items-center gap-5">
                <img
                    src={user?.profilePicture}
                    alt="user"
                    className="w-12 h-12 rounded-full "
                />
                <p>{user?.username}</p>
                <input
                    type="file"
                    ref={imageRef}
                    accept="image/*"
                    onChange={fileChangeHandler}
                    className="hidden"
                />
                <button
                    onClick={() => imageRef.current.click()}
                    className="bg-primary rounded-md p-2 cursor-pointer"
                >
                    Update Photo
                </button>
            </div>

            {/* update bio */}
            <div>
                <h2 className="font-semibold text-lg">Bio</h2>
                <textarea
                    name="bio"
                    onChange={(e) =>
                        setInput({ ...input, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none rounded-md p-2 focus:outline-primary border min-h-20 border-gray-500 col-end-4 h-[50px]"
                ></textarea>
            </div>

            {/* TODO: add a dropdown for gender */}

            <button
                className="bg-primary rounded-md p-2"
                disabled={loading}
                onClick={editProfileHandler}
            >
                Submit
            </button>
        </div>
    );
};

export default EditProfile;
