require('dotenv').config();
const express=require('express')
const app=express()
const fs = require('fs');
const Validator = require('../helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { json } = require('express');
const { ApplicationCostProfiler } = require('aws-sdk');
const { nextTick } = require('process');
const PORT = 3000;
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API);
const userData=[
    {
      "name": "Rakshitha",
      "Id": 90876,
      "userName": "rakshithamattuga@gmail.com",
      "preferences": 3,
    },
    {
      "name": "Ashritha",
      "email": "ashritha@gmail.com",
      "preferences": 3,
    }
  ]

const userRegistration=(req,res)=>{
    let data = req.body;
    if(req.body.email && req.body.password){
    const user = {
        name:data.name,
        email: data.email,
        password: bcrypt.hashSync(data.password, 8),
        preferences: data.preferences
    }
        //validate data before saving to database
        if(Validator.validateInfo(user).status == true){
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            userData.push({'email':user.email,"password":user.password,"creationDate":new Date(),"id":randomNumber,"preferences":user.preferences,"name":user.name})
        console.log(userData)
        res.status(200).send(userData[1])  
        console.log(userData.id)  
    }
    else{
        res.status(400).json({"message": "Email is not in a proper format"})
    }
}else{
    res.status(400).json({"message": "Email is not in a proper format"})

}
    

}
const loginUser=(req,res,next)=>{
        let data = req.body;
        const email=req.body.email
        const password=req.body.password
        const user = userData.find(user => user.email === email)
        const secret=process.env.SECRET_KEY
        if(user){
            var isPasswordValid = bcrypt.compareSync(password, user.password);
            if(isPasswordValid){
                var token=jwt.sign({id:user.email},process.env.SECRET_KEY,{
                    expiresIn: 86400
                })
                if(token){
                res.status(200).json({"message":"Logged In Successfully","token":{token},"expiresIn":"86400"})
                next()
            }
            }
            else{
                res.status(401).json({"message":"Unauthorized User"})
                next()
            }
    
        }else{
            res.status(404).json({"message":"User doesn't exist"})
            next()
        }
    }
const getPreferences=async (req,res,next)=>{
      try {
        let eventData = req.body;
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "message": "No token provided" });
        }

        token = token.split(' ')[1];
        if(Validator.validateInfo(user).status == true){
        if (token) {
            // Promisify jwt.verify
            const verifyToken = (token) => {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    });
                });
            };

            // Verify the token
            const decoded = await verifyToken(token);

            if (decoded) {
                const user = userData.find(user => user.email === decoded.id);
                res.status(200).json({"Preferences":user.preferences})
            } else {
                res.status(400).json({ "message": "Invalid User"});
            }
        } else {
            res.status(401).json({ "message": "You're not authorized to get the news preferences" });
        }
    }else{
        res.status(400).json({"message":"Parameters Missing"})
    }
} catch (err) {
        console.error(err);
        res.status(500).json({ "message": "Internal Server Error" });
    }
    next();

}


//update preferences
const updatePreferences=async (req,res,next)=>{
    try {
        let eventData = req.body;
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "message": "No token provided" });
        }

        token = token.split(' ')[1];
        
        if (token) {
            // Promisify jwt.verify
            const verifyToken = (token) => {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    });
                });
            };

            // Verify the token
            const decoded = await verifyToken(token);

            if (decoded) {
                const user = userData.find(user => user.email === decoded.id);
                user.preferences=eventData.preferences
                res.status(200).json({"Preferences":user.preferences})
            } else {
                res.status(400).json({ "message": "Invalid User"});
            }
        } else {
            res.status(401).json({ "message": "You're not authorized to get the news preferences" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ "message": "Internal Server Error" });
    }
    next();
}


//getnews
const getNews=async (req,res,next)=>{
    try {
        let eventData = req.body;
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "message": "No token provided" });
        }

        token = token.split(' ')[1];
        
        if (token) {
            // Promisify jwt.verify
            const verifyToken = (token) => {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    });
                });
            };

            // Verify the token
            const decoded = await verifyToken(token);

            if (decoded) {
                const user = userData.find(user => user.email === decoded.id);
                try {
    const response = await newsapi.v2.everything({
      q: user.preferences,
      language: 'en',
      sortBy: 'elevancy'
    });
    res.status(200).json({ "News": response.articles });
  } catch (err) {
    console.log(err)
  }
} else {
  res.status(400).json({ "message": "Invalid User" });
}
        } else {
            res.status(401).json({ "message": "You're not authorized to get the news preferences" });
        }
    } catch (err) {
        res.status(500).json({ "message": "Internal Server Error" });
    }
    next();
}
module.exports={
    userRegistration,
    loginUser,
    getPreferences,
    updatePreferences,
    getNews
}
