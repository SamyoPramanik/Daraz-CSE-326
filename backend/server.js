const express = require('express');
const pool = require('./config/db');
const productRoute = require('./routes/productRoute');
const reviewRoute = require('./routes/reviewRoute');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Routes
app.use('/api/products', productRoute);
app.use('/api/reviews', reviewRoute);

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'success',
            message: 'Daraz platform server is running!',
            db_time: result.rows[0].now,
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Database connection failed', error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
