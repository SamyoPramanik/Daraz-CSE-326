const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'daraz-dev-secret';

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Authorization token is required'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { requireAuth };