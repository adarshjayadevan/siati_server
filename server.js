const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./config/db');

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/admin');

app.use(express.json());
app.use(cors());
app.use('/',userRoute);
app.use('/admin',adminRoute);

app.listen(4000,async()=>{
    await connection();
    console.log('server running at 4000')
})