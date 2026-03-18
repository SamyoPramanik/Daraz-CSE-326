const pool = require('../config/db');

//minimal code likhlam just run diye dekhar jonne

const checkout = async (req, res) => {
    res.json({ message: 'checkout - coming soon' });
};

const viewOrders = async (req, res) => {
    res.json({ message: 'view orders - coming soon' });
};  


module.exports = {
    checkout,
    viewOrders
};