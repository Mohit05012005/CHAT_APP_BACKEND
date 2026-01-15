const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.json({"message":"welcome to the chat"});
})

module.exports = app;