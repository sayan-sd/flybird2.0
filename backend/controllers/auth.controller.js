const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
require("dotenv").config();

// register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validate data
        if (!username || !email || !password) {
            return res
                .status(401)
                .json({ message: "All fields are required", status: false });
        }

        // check if user already exists
        const user = await User.findOne({ email });

        if (user) {
            return res
                .status(401)
                .json({ message: "User already exists", status: false });
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ username, email, password: hashedPassword });

        return res
            .status(200)
            .json({ message: "Account created successfully", status: true });
    } catch (error) {
        console.log("Error in registering user", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res
                .status(401)
                .json({ message: "All fields are required", status: false });
        }

        // check if user exists
        let user = await User.findOne({ email });

        // user not exists
        if (!user) {
            return res
                .status(401)
                .json({ message: "User does not exist", status: false });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Incorrect password", status: false });
        }

        // create token
        const token = await jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // populate each post in the 'posts' array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);

                if(post && post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts,
        };

        return res
            .cookie("token", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                maxAge: 1 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({ message: "Welcome Back to FlyBird", status: true, user });
    } catch (error) {
        console.log("Error in logging in user", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// logout user
exports.logout = async (req, res) => {
    try {
        return res
            .cookie("token", "", {
                maxAge: 0,
            })
            .status(200)
            .json({ message: "Logged out successfully", status: true });
    } catch (error) {
        console.log("Error in logging out user", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};