const pool = require('../config/db');




//minimal likhlam just run diye dekhar jonne
const viewCart = async (req, res) => {
    res.json({ message: 'view cart - coming soon' });
};

const addProduct = async (req, res) => {
    res.json({ message: 'add product to cart - coming soon' });
};

const updateCart = async (req, res) => {
    res.json({ message: 'update cart - coming soon' });
};

const removeFromCart = async (req, res) => {
    res.json({ message: 'remove from cart - coming soon' });
};  



module.exports = {
    viewCart,
    addProduct,
    updateCart,
    removeFromCart
};