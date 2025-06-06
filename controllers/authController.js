// controllers/authController.js
const userService = require('../services/authService');
const { comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const userId = await userService.createUser(username, email, password);
        res.status(201).json({ message: 'User registered successfully!', userId });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await userService.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken({ id: user.id, email: user.email, username: user.username });
        res.json({ message: 'Logged in successfully!', token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = {
    registerUser,
    loginUser
};