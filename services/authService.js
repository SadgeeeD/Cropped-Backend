// services/userService.js
const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

const createUser = async (username, email, password) => {
    const hashedPassword = await hashPassword(password);
    const [result] = await pool.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
    );
    return result.insertId;
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        [email]
    );
    return rows[0]; // Returns user object or undefined
};

// You might also want a function to update password if needed
// const updatePassword = async (userId, newPassword) => { ... }

module.exports = {
    createUser,
    findUserByEmail,
};