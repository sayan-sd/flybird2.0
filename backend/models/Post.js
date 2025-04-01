const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);