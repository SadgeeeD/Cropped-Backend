// middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwtUtils');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    const user = verifyToken(token);
    if (!user) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    req.user = user; // Attach user payload to request
    next(); // Proceed to the next middleware/route handler
};

module.exports = {
    authenticateToken
};