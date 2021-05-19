/**
 * Schema definition for Auth
 */
const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({
    auth_type: String,
    username: String,
    password: String,
    md5_cred: String,
    realm: String,
    nonce_lifetime: Number
}, {
    timestamps: true,
});

/**
 * @model Auth
 */
module.exports = mongoose.model('Auth', AuthSchema);