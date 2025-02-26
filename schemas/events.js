const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
    },
    startDate: {
        type: Date,
        // required: true
    },
    endDate: {
        type: Date,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    location: {
        type: String,
        // required: true
    },
    eventShort: {
        type: String,
    },
    image: {
        type: String,
        // required: true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default:()=>new Date()
    }
})

module.exports = mongoose.model('event', eventSchema);