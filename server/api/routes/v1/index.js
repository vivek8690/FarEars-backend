const express = require('express');
const router = express.Router();
const userRoute = require('../v1/users.route');

/**
 * GET v1/status
 */
router.get('/status', async (req, res) => {
    res.send({
        version: process.env.VERSION,
    });
});

router.use('/users', userRoute)

module.exports = router;