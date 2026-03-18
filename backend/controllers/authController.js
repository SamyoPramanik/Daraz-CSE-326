const pool = require('../config/db');



//minimal likhlam just run diye dekhar jonne 
const registerUser = async (req, res) => {
    res.json({ message: 'register - coming soon' });
};

const userLogin = async (req, res) => {
    res.json({ message: 'login - coming soon' });
};

module.exports = {
    registerUser,
    userLogin
};
