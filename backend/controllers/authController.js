const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET || 'daraz-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
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
            'SELECT id, name, email, password FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

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
            'SELECT id, name, email, password FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

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
            message: 'Admin login failed',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    userLogin,
    adminLogin
};
