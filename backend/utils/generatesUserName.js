const User = require('../models/User');

// function to generate unique username
const generateUserName = async (email) => {
    try {
        const { nanoid } = await import('nanoid');
        let username = email.split("@")[0];

        let isUsernameUnique = await User.exists({
            username,
        });

        if (!isUsernameUnique) return username;
        else {
            return username += nanoid().substring(0, 5);
        }
    } catch (error) { 
        console.log(error);
    }
};

module.exports = generateUserName;