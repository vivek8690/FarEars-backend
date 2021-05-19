const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
/**
 * GET v1/status
 */
router.get('/status', async (req, res) => {
    res.send({
        mongo: mongoose.connection.readyState === 1 ? 'Connected to server.' : 'Not connected to server.',
        version: process.env.VERSION,
    });
});

module.exports = router;