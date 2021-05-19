/**
 * Schema definition for Aor
 */
const mongoose = require('mongoose');

const AorSchema = new mongoose.Schema({
    contact: {
        type: String,
        required: true,
        trim: true,
    },
    minimum_expiration: {
        type: Number,
        required: true,
    },
    default_expiration: {
        type: Number,
        required: true,
    },
    qualify_timeout: {
        type: Number,
        required: true,
    },
    support_path: {
        type: Boolean,
        index: true,
        trim: true,
    },
    max_contacts: {
        type: Number,
        trim: true,
    },
    authenticate_qualify: {
        type: Boolean,
        trim: true,
    },
    maximum_expiration: {
        type: Number,
        trim: true,
    },
    qualify_frequency: {
        type: Number,
        trim: true,
    },
    remove_existing: {
        type: Boolean,
        trim: true,
    }
}, {
    timestamps: true,
});

/**
 * @model Aor
 */
module.exports = mongoose.model('Aor', AorSchema);