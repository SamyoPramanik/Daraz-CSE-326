const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET || 'daraz-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin || false },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const markUserOnline = async (userId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_presence (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            is_online BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);

    await pool.query(
        `INSERT INTO user_presence (user_id, last_seen_at, is_online)
         VALUES ($1, NOW(), TRUE)
         ON CONFLICT (user_id)
         DO UPDATE SET last_seen_at = NOW(), is_online = TRUE`,
        [userId]
    );
};

const markUserOffline = async (userId) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_presence (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            is_online BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);

    await pool.query(
        `INSERT INTO user_presence (user_id, last_seen_at, is_online)
         VALUES ($1, NOW(), FALSE)
         ON CONFLICT (user_id)
         DO UPDATE SET last_seen_at = NOW(), is_online = FALSE`,
        [userId]
    );
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'name, email and password are required'
            });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, phone, created_at`,
            [name, email, hashedPassword, phone || null]
        );

        const user = result.rows[0];
        const token = generateToken(user);

        res.status(201).json({
            status: 'success',
            data: {
                token,
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to register user',
            error: error.message
        });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'email and password are required'
            });
        }

        const result = await pool.query(
            'SELECT id, name, email, password, is_admin FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        
        // Prevent admin users from logging in as regular users
        if (user.is_admin) {
            return res.status(403).json({
                status: 'error',
                message: 'Admin users must use the admin login portal'
            });
        }
        
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);
        await markUserOnline(user.id);

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: error.message
        });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'email and password are required'
            });
        }

        const result = await pool.query(
            'SELECT id, name, email, password, is_admin FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        
        // Check if user is admin
        if (!user.is_admin) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }
        
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);
        await markUserOnline(user.id);

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    is_admin: user.is_admin
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Admin login failed',
            error: error.message
        });
    }
};

const logoutUser = async (req, res) => {
    try {
        await markUserOffline(req.user.id);
        return res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Logout failed',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    userLogin,
    adminLogin,
    logoutUser
};
