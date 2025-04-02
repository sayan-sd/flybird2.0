const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { getReceiverSocketId, io } = require("../socket/socket");

// send message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        // check if there any prev conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        // create new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // add message to conversation
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
        });

        // add message to conversation
        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([conversation.save(), newMessage.save()]);

        // real time data transfer with socket io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res
            .status(200)
            .json({ message: "Message sent successfully", status: true, newMessage });
    } catch (error) {
        console.log("Error in sending message", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};

// get messages
exports.getMessages = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        // find conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate('messages');

        // conversation not found
        if (!conversation) {
            return res
                .status(404)
                .json({
                    message: "Conversation not found",
                    status: true,
                    messages: [],
                });
        }

        // find messages
        return res
            .status(200)
            .json({
                message: "Messages fetched successfully",
                status: true,
                messages: conversation?.messages,
            });
    } catch (error) {
        console.log("Error in getting messages", error);
        return res
            .status(500)
            .json({ message: "Internal server error", status: false });
    }
};
