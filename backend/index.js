const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const { connectToDB } = require("./config/db");
require("dotenv").config();
const { cloudinaryConnect } = require("./config/cloudinary");
const { app, server } = require("./socket/socket");

const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const messageRoutes = require("./routes/message.routes");

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:5173",
        // origin: "*",
        methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
        credentials: true,
    })
);
app.use(fileUpload({ useTempFiles: true, tempFileDir: "./tmp/" }));

// routes
app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    // connections
    connectToDB();
    cloudinaryConnect();

    console.log(`Server listening on ${PORT}`);
});
