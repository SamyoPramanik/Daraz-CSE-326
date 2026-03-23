const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'daraz-dev-secret';

/**
 * Admin Middleware
 * 
 * Verifies that:
 * 1. User has a valid JWT token in Authorization header
 * 2. Token is not expired
 * 3. User has is_admin = true
 * 
 * Usage:
 * router.get('/admin/stats', adminMiddleware, controllerFunction);
 * 
 * Returns:
 * - If valid admin: Passes to next middleware/route
 * - If no token: 401 Unauthorized
 * - If invalid token: 401 Unauthorized
 * - If not admin: 403 Forbidden
 */
const adminMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided. Authorization header required.'
            });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.substring(7);

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token has expired'
                });
            }
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }

        // Check if user is admin
        if (!decoded.is_admin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Store user info in request object for use in route handlers
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            is_admin: decoded.is_admin
        };

        // Continue to next middleware/route
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

module.exports = adminMiddleware;
