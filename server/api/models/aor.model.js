/**
 * Schema definition for Aor
 */
const mongoose = require('mongoose');

const AorSchema = new mongoose.Schema({
    contact: String,
    max_contacts: Number
}, {
    timestamps: true,
});

/**
 * @model Aor
 */
module.exports = mongoose.model('Aor', AorSchema);