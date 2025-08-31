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

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="editprofile-flex justify-center items-center py-10 px-4 bg-gray-100 min-h-screen">
            <div className="edit-container editprofile-flex editprofile-flex-col editprofile-gap-5 editprofile-max-w-2xl editprofile-mx-auto editprofile-pl-10">
                <button className="editprofile-close-btn" onClick={handleBack}>
                    ×
                </button>
                <h1 className="editprofile-font-semibold editprofile-text-2xl text-center">Edit Profile</h1>

                {/* update photo */}
                <div className="editprofile-w-full editprofile-flex flex-col md:editprofile-flex-row editprofile-items-center editprofile-gap-5">
                    <img
                        src={
                            input.profilePicture instanceof File
                                ? URL.createObjectURL(input.profilePicture)
                                : user?.profilePicture
                        }
                        alt="user"
                        className="editprofile-w-20 editprofile-h-20 editprofile-rounded-full editprofile-border-2 editprofile-border-primary editprofile-object-cover"
                    />
                    <div className="editprofile-flex editprofile-flex-col editprofile-gap-5">
                        <p className="editprofile-font-medium editprofile-text-lg">@{user?.username}</p>
                        <input
                            type="file"
                            ref={imageRef}
                            accept="image/*"
                            onChange={fileChangeHandler}
                            className="editprofile-hidden"
                        />
                        <button
                            onClick={() => imageRef.current.click()}
                            className="editprofile-bg-primary text-white rounded-md px-4 py-2 editprofile-cursor-pointer editprofile-button"
                        >
                            Update Photo
                        </button>
                    </div>
                </div>

                {/* bio */}
                <div className="editprofile-flex editprofile-flex-col editprofile-gap-5">
                    <label className="editprofile-font-semibold">Bio</label>
                    <textarea
                        name="bio"
                        value={input.bio}
                        onChange={(e) => setInput({ ...input, bio: e.target.value })}
                        rows={4}
                        className="editprofile-textarea"
                        placeholder="Write something about you..."
                    ></textarea>
                </div>

                {/* gender */}
                <div className="gender-section">
                    <h2 className="editprofile-font-semibold editprofile-text-lg">Gender</h2>
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
                    className="editprofile-submit-btn"
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