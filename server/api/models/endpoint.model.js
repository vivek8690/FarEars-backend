/**
 * Schema definition for Endpoint
 */
const mongoose = require('mongoose');
const ObjectId = mongoose.SchemaTypes.ObjectId;

const EndpointSchema = new mongoose.Schema({
    context: String,
    aors: ObjectId,
    allow: {
        type: String,
        default: "ulaw"
    },
    disallow: {
        type: String,
        default: "all"
    },
    auth: {
        type: ObjectId,
        ref: 'Auth'
    }

}, {
    timestamps: true,
});

/**
 * @model Endpoint
 */
module.exports = mongoose.model('Endpoint', EndpointSchema);