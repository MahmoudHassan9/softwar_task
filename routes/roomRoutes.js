const express = require("express");
const Router = express.Router();
var Rooms = require("../models/Rooms"); 


Router.post("/addRoom",async (req, res,next) => {
   try{
    const room = new Rooms({...req.body});
   await room.save().then(()=>{
    res.status(201).json({ message: "room added successfully", room:  room }); 
   } )}
   catch (err) {
    next(err);
  }
    
});

Router.put("/updateRoom/:id", async (req, res,next) => {
    try {
        const room = await Rooms.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );

        if (!room) {
            return res.status(501).send('The room is not found');
        }
        else
        res.status(200).send(room);
    } catch (err) {
        next(err);
      }
});


Router.delete("/deleteRoom/:id", async(req, res,next) => {
    const userId = req.params.id;
  
   try{
         const room = await Rooms.findByIdAndDelete(req.params.id);
         if (!room) {
            return res.status(501).send('The room is not found');
        }
        else
        res.send(room);
   }catch (err) {
    next(err);
  }
   
});

Router.get("/getRooms",async(req,res,next)=>{
  try{
    const roomList=await Rooms.find();
    if(!roomList){
      res.status(501).json({success:true});
  }
  else res.status(201).json({"rooms":roomList});
  }
  catch (err) {
    next(err);
  }
})
Router.get('/:id',async(req,res,next)=>{
    try{
    const room=await Rooms.findById(req.params.id);
    if(!room){
        res.status(501).json({success:false});
    }
    else res.status(200).json({room:room});}
    catch (err) {
        next(err);
      }
})
Router.get('/find/:name', async (req, res, next) => {
  try {
    const room = await Rooms.findOne({ name: req.params.name });

    if (!room) {
       res.status(404).json({ success: false, message: 'room not found' });
    }
     res.status(200).json({ room });
  } catch (err) {
    next(err);
  }
});

module.exports = Router;
