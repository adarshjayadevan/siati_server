const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    exhibitor: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    isFile:{
        type: Boolean,
        required: true
    },
    fileId: {
        type: String,
    },
    event: {
        type: String,
        required:true
    },
    exhibitorType:{
        type: String,
        // required:true
    },
    url:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:()=>new Date()
    }
})

module.exports = mongoose.model('members', memberSchema);