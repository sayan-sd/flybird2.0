const { Server } = require("socket.io");
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// map of socket it to user_id
const userSocketMap = {}; 

// return socket id of receiver socket user id
const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;  
        // console.log(`User connected: ${userId}`);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap)); // send list of online users

    // disconnect
    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId];
            // console.log(`User disconnected: ${userId}`);
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
})

module.exports = { app, server, io, getReceiverSocketId };
