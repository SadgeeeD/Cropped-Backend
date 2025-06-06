// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
const expiresIn = '1h'; // Token expires in 1 hour

const generateToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null; // Token is invalid or expired
    }
};

module.exports = {
    generateToken,
    verifyToken
};