const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    image: {
        type: String,
    },
})

const exhibitorSchema = new mongoose.Schema({
    exhibitor: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required:true
    },
    exhibitorType:{
        type: Number,
        default:1
    },
    images:{
        type:[imageSchema]
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

module.exports = mongoose.model('exhibitor', exhibitorSchema);