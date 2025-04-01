const jwt = require("jsonwebtoken");
require('dotenv').config();

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access", success: false });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // check if token is valid
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized Access", success: false });
        }

        req.id = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in isAuthenticated middleware", error);
    }
}

module.exports = isAuthenticated;