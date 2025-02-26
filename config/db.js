const mongoose = require('mongoose');
const path= require('path');
require('dotenv').config({path:path.join(__dirname,'..','.env')})

const conn = async () => {
    try {
        // await mongoose.connect('mongodb://127.0.0.1:27017/test');
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`database connected`);
    } catch (error) {
        console.log(`error in connection - ${error.message}`);
    }
}

module.exports = conn;