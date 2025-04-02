const { uploadImageToCloudinary } = require("../utils/imageUploader");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { getReceiverSocketId, io } = require("../socket/socket");

// add new post
exports.addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.files.image;
        const authorId = req.id;

        // if no image provided
        if (!image) {
            return res
                .status(400)
                .json({ message: "Image is required", success: false });
        }

        // image upload
        const imageData = await uploadImageToCloudinary(image);
        const post = await Post.create({
            caption,
            image: imageData.secure_url,
            author: authorId,
        });

        // find author and update
        const author = await User.findByIdAndUpdate(
            authorId,
            { $push: { posts: post._id } },
            { new: true }
        );

        await post.populate({ path: "author", select: "-password" });

        return res
            .status(200)
            .json({ message: "Post created successfully", status: true, post });
    } catch (error) {
        console.log("Error in adding new post", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({ path: "author", select: "username profilePicture" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: { path: "author", select: "username profilePicture" },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Posts fetched successfully",
            status: true,
            posts,
        });
    } catch (error) {
        console.log("Error in getting all posts", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// get post of logged in user
exports.getUserPosts = async (req, res) => {
    try {
        const author = req.id;
        const posts = await Post.find({ author })
            .populate({ path: "author", select: "username profilePicture" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: { path: "author", select: "username profilePicture" },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Posts fetched successfully",
            status: true,
            posts,
        });
    } catch (error) {
        console.log("Error in getting user posts", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// like post
exports.likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        // post not found
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", status: false });
        }

        // like post
        await post.updateOne({ $addToSet: { likes: userId } });
        await post.save();

        // real time notifications with socket.io
        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();

        // check if i am liking someone else post
        if (postOwnerId!== userId) {
            // emit notification to post owner
            const notification = {
                type: 'like',
                userId: userId,
                userDetails: user,
                postId,
                message: `Your post was liked`,
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res
            .status(200)
            .json({ message: "Post liked successfully", status: true });
    } catch (error) {
        console.log("Error in liking post", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// dislike post
exports.dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        // post not found
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", status: false });
        }

        // dislike post
        await post.updateOne({ $pull: { likes: userId } });
        await post.save();

        // real time notifications with socket.io
        const user = await User.findById(userId).select("username profilePicture");
        const postOwnerId = post.author.toString();

        // check if i am liking someone else post
        if (postOwnerId!== userId) {
            // emit notification to post owner
            const notification = {
                type: 'dislike',
                userId: userId,
                userDetails: user,
                postId,
                message: `Your post was liked`,
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res
            .status(200)
            .json({ message: "Post disliked successfully", status: true });
    } catch (error) {
        console.log("Error in disliking post", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// add commet
exports.addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        // validate comment
        if (!text) {
            return res
                .status(400)
                .json({ message: "Comment is required", status: false });
        }

        // find post
        const post = await Post.findById(postId);

        // post not found
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", status: false });
        }

        // Create the comment document
        const comment = await Comment.create({
            text,
            author: userId,
            post: postId,
        });

        // Populate the author
        await comment.populate({
            path: "author",
            select: "username profilePicture",
        });

        // update the author
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: "Comment added successfully",
            status: true,
            comment,
        });
    } catch (error) {
        console.log("Error in adding comment", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// fetch comments of specific posts
exports.getCommentsOfPosts = async (req, res) => {
    try {
        const postId = req.params.id;

        // find comments
        const comments = await Comment.find({ post: postId })
            .populate({ path: "author", select: "username profilePicture" })
            .sort({ createdAt: -1 });

        // no comments found
        if (!comments) {
            return res
                .status(404)
                .json({ message: "Comments not found", status: false });
        }

        return res.status(200).json({
            message: "Comments fetched successfully",
            status: true,
            comments,
        });
    } catch (error) {
        console.log("Error in fetching comments of posts", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// delete post
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        // find post
        const post = await Post.findById(postId);

        // post not found
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", status: false });
        }

        // check if post author is same as logged in user
        if (post.author.toString() !== authorId) {
            return res
                .status(403)
                .json({ message: "Unauthorized", status: false });
        }

        // delete post & cleanup
        await Post.findByIdAndDelete(postId);
        await Comment.deleteMany({ post: postId });
        await User.findByIdAndUpdate(authorId, {
            $pull: { posts: postId },
        });

        return res
            .status(200)
            .json({ message: "Post deleted successfully", status: true });
    } catch (error) {
        console.log("Error in deleting post", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// bookmark post
exports.bookmarkPost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        // find post
        const post = await Post.findById(postId);

        // post not found
        if (!post) {
            return res
                .status(404)
                .json({ message: "Post not found", status: false });
        }

        // find user
        const user = await User.findById(userId);

        // already bookmarked
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();

            return res.status(200).json({
                message: "Post unbookmarked successfully",
                status: true,
                type: "unsaved",
            });
        }
        // bookmark post
        else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();

            return res.status(200).json({
                message: "Post bookmarked successfully",
                status: true,
                type: "saved",
            });
        }
    } catch (error) {
        console.log("Error in bookmarking post", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};
