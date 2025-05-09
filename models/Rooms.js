const express = require('express')
const app = express()
const mongoose =require("mongoose");
const Rooms = mongoose.Schema({
    name:{
     type:String,
     required:true,
     unique:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        default:0
    },
    numberofmemebrs:{
        type:Number,
        required:false,
    },
    rating:{
        type:Number,
        default:0
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Rooms',Rooms);