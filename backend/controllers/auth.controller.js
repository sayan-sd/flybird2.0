const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const generateUserName = require("../utils/generatesUserName");
const OTP = require("../models/OTP");
const { generateOTP, generateEmailTemplate } = require("../utils/otpUtils");
const mailSender = require("../utils/mailSender");
require("dotenv").config();


let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password


// send otp to user
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            email,
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save OTP to database
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);

        // Send email
        await mailSender(
            email,
            "Your OTP Code from Canvas",
            generateEmailTemplate(otp)
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error sending OTP",
        });
    }
};


// verify otp and create user
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the most recent OTP for this email
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        }

        if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Update verification status
        await OTP.findByIdAndUpdate(
            recentOtp._id,
            { verified: true },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error verifying OTP",
        });
    }
};


// register new user
exports.register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // validate data
        if (!fullname || !email || !password) {
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

        // Name validation
        if (fullname.length < 3) {
            return res.status(403).json({
                success: false,
                message: "Fullname must be at least 3 characters long",
            });
        }

        // Email validation
        if (!emailRegex.test(email)) {
            return res
                .status(403)
                .json({ success: false, message: "Invalid email address" });
        }

        // Password validation
        if (!passwordRegex.test(password)) {
            return res.status(403).json({
                success: false,
                message:
                    "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
            });
        }


        // Check for verified OTP
        const recentOtp = await OTP.findOne({
            email,
            verified: true,
        }).sort({ createdAt: -1 });

        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        // username
        const username = await generateUserName(email);

        await User.create({ username, email, password: hashedPassword, username });

        // Delete the OTP document after successful signup
        await OTP.deleteOne({ _id: recentOtp._id });

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