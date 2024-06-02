// require('dotenv').config();
const express=require('express')
const app=express()
const fs = require('fs');
const Validator = require('./helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { json } = require('express');
const { nextTick } = require('process');
const PORT = 3000;
const {userRegistration,loginUser,getPreferences, updatePreferences, getNews} = require('./routers/route');
const { Route53Resolver } = require('aws-sdk');
const router = express.Router();

const userData=[
    {
      "name": "Rakshitha",
      "Id": 90876,
      "userName": "rakshitha@gmail.com",
      "password": 3,
      "preferences": "Technical"
    },
    {
      "name": "Ashritha",
      "Id": 90876,
      "userName": "ashritha@gmail.com",
      "password": 3,
      "preferences": "Technical"
    }
  ]
app.use(express.json())
router.post('/users/signup',userRegistration)
router.post('/users/login',loginUser)
router.get('/users/preferences',getPreferences)
router.put('/users/preferences',updatePreferences)
router.get('/users/news',getNews)

app.use('/', router);
app.listen(PORT, (err) => {
    if(err) {
        console.log("Error occured cant start the server");
    } else {
        console.log("Server started successfully");
    }
})
module.exports = app;
