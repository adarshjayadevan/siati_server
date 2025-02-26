const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    correspondenceAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    fax: {
        type: String,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profile: {
        type: String,
    },
    products: {
        type: String,
    },
    previousThreeTurnover: {
        type: [{}]
    },
    companyType: {
        type: {},
        required: true
    },
    managementTeam: [{
        name: { type: String, required: true },
        designation: { type: String, required: true },
        email: { type: String, required: true } 
    }]
})

module.exports = mongoose.model('membership', membershipSchema);