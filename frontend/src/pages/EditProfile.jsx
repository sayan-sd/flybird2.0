import "../stylesheets/EditProfile.css";
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
        gender: user?.gender || "",
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const imageRef = useRef();

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setInput({ ...input, profilePicture: file });
        }
    };

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if (input.profilePicture instanceof File) {
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
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    gender: res.data.user?.gender,
                    profilePicture: res.data.user?.profilePicture,
                };
                dispatch(setAuthUser(updatedUserData));
                toast.success(res.data.message);
                navigate(`/profile/${user?._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4 bg-gray-100 min-h-screen">
            <div className="edit-container flex max-w-2xl mx-auto pl-10 flex-col gap-5">

                <h1 className="font-semibold text-2xl text-center text-primary">Edit Profile</h1>

                {/* update photo */}
                <div className="w-full flex flex-col md:flex-row items-center gap-5">
                    <img
                        src={
                            input.profilePicture instanceof File
                                ? URL.createObjectURL(input.profilePicture)
                                : user?.profilePicture
                        }
                        alt="user"
                        className="w-20 h-20 rounded-full border-2 border-primary object-cover"
                    />
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-lg">@{user?.username}</p>
                        <input
                            type="file"
                            ref={imageRef}
                            accept="image/*"
                            onChange={fileChangeHandler}
                            className="hidden"
                        />
                        <button
                            onClick={() => imageRef.current.click()}
                            className="bg-primary text-white rounded-md px-4 py-2 cursor-pointer"
                        >
                            Update Photo
                        </button>
                    </div>
                </div>

                {/* bio */}
                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-base">Bio</label>
                    <textarea
                        name="bio"
                        value={input.bio}
                        onChange={(e) => setInput({ ...input, bio: e.target.value })}
                        rows={4}
                        className="w-full resize-none rounded-md p-2 focus:outline-primary border border-gray-500"
                        placeholder="Write something about you..."
                    ></textarea>
                </div>

                {/* gender */}
                <div className="gender-section">
                    <h2 className="font-semibold text-lg">Gender</h2>
                <select
                    name="gender"
                    className="gender-dropdown"
                    defaultValue=""
                    onChange={(e) => setInput({ ...input, gender: e.target.value })}
  >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                </div>


                <button
                    className="bg-primary text-white rounded-md p-2 hover:bg-opacity-90 transition"
                    disabled={loading}
                    onClick={editProfileHandler}
                >
                    {loading ? "Saving..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
