const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// get profile details
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).populate({path: 'posts', createdAt: 1}).populate('bookmarks');

        return res
            .status(200)
            .json({ message: "Profile details", status: true, user });
    } catch (error) {
        console.log("Error in getting profile details", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// edit profile
exports.editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio } = req.body;

        // Check if user exists
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found", status: false });
        }

        // Update bio if provided
        if (bio) user.bio = bio;

        console.log(req.files.profilePicture);

        // Handle profile picture upload if present
        if (req.files && req.files.profilePicture) {
            const profilePicture = req.files.profilePicture;

            try {
                const imageData = await uploadImageToCloudinary(profilePicture);
                user.profilePicture = imageData.secure_url;
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                return res.status(400).json({
                    message: "File upload failed",
                    status: false,
                    error: uploadError.message,
                });
            }
        }

        // Save user
        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            status: true,
            user,
        });
    } catch (error) {
        console.log("Error in editing profile", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// user with most followers
exports.getMostFollowedUsers = async (req, res) => {
    try {
        const userId = req.id;

        // get users
        const users = await User.find({ _id: { $ne: userId } })
            .sort({ followers: -1 })
            .limit(5)
            .select("-password");

        // if no user
        if (!users) {
            return res
                .status(404)
                .json({ message: "No users found", status: false });
        }

        return res.status(200).json({
            message: "Users with most followers",
            status: true,
            users,
        });
    } catch (error) {
        console.log("Error in getting users with most followers", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// follow & unfollow user
exports.followOrUnfollow = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const followedUserId = req.params.id; // user to be followed or unfollowed

        // if both same
        if (userId === followedUserId) {
            return res
                .status(400)
                .json({ message: "Cannot follow yourself", status: false });
        }

        // find user
        const user = await User.findById(userId); // loggedIn user
        const targetUser = await User.findById(followedUserId); // whom to follow or unfollow

        // validate data
        if (!user || !targetUser) {
            return res
                .status(404)
                .json({ message: "User not found", status: false });
        }

        // toggle between follow and unfollow
        const isFollowing = user.following.includes(followedUserId);

        // check if already follwing or not
        if (isFollowing) {
            // unfollow logic
            await Promise.all([
                User.updateOne(
                    { _id: userId },
                    { $pull: { following: followedUserId } }
                ),
                User.updateOne(
                    { _id: followedUserId },
                    { $pull: { followers: userId } }
                ),
            ]);

            return res.status(200).json({
                message: "Unfollowed successfully",
                status: true,
                type: "unfollow",
            });
        } else {
            // follow logic
            await Promise.all([
                User.updateOne(
                    { _id: userId },
                    { $push: { following: followedUserId } }
                ),
                User.updateOne(
                    { _id: followedUserId },
                    { $push: { followers: userId } }
                ),
            ]);

            return res.status(200).json({
                message: "Followed successfully",
                status: true,
                type: "follow",
            });
        }
    } catch (error) {
        console.log("Error in following or unfollowing user", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};
