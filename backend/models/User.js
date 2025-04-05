const mongoose = require("mongoose");

let profile_imgs_name_list = [
    "Garfield",
    "Tinkerbell",
    "Annie",
    "Loki",
    "Cleo",
    "Angel",
    "Bob",
    "Mia",
    "Coco",
    "Gracie",
    "Bear",
    "Bella",
    "Abby",
    "Harley",
    "Cali",
    "Leo",
    "Luna",
    "Jack",
    "Felix",
    "Kiki",
];
let profile_imgs_collections_list = [
    "notionists-neutral",
    "adventurer-neutral",
    "fun-emoji",
];

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            minlength: [3, "fullname must be 3 letters long"],
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String
        },
        profilePicture: {
            type: String,
            default: () => {
                return `https://api.dicebear.com/6.x/${
                    profile_imgs_collections_list[
                        Math.floor(
                            Math.random() *
                                profile_imgs_collections_list.length
                        )
                    ]
                }/svg?seed=${
                    profile_imgs_name_list[
                        Math.floor(
                            Math.random() * profile_imgs_name_list.length
                        )
                    ]
                }`;
            },
        },
        bio: {
            type: String,
            default: "",
            maxlength: [200, "Bio should not be more than 200"],
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
