const express = require("express");
const Router = express.Router();
var Rooms = require("../models/Rooms");


Router.post("/addRoom", async (req, res, next) => {
  const room = new Rooms({ ...req.body });
  await room.save().then(() => {
    res.status(201).json({ message: "room added successfully", room: room });
  })
}


);

Router.put("/updateRoom/:id", async (req, res, next) => {

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

});


Router.delete("/deleteRoom/:id", async (req, res, next) => {
  const userId = req.params.id;
  const room = await Rooms.findByIdAndDelete(req.params.id);
  if (!room) {
    return res.status(501).send('The room is not found');
  }
  else
    res.send(room);


});

Router.get("/getRooms", async (req, res, next) => {
  try {
    const roomList = await Rooms.find();
    res.status(200).json({ rooms: roomList });
  }
  catch (e) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching rooms"
    });
  }

  // if (!roomList) {
  //   res.status(501).json({ success: true });
  // }
  // else res.status(200).json({ "rooms": roomList });
}

)
Router.get('/:id', async (req, res, next) => {
  try {
    const room = await Rooms.findById(req.params.id);
    res.status(200).json({ room: room });
  }
  catch (e) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
  // if (!room) {
  //   res.status(501).json({ success: false });
  // }
  // else res.status(200).json({ room: room });

})
Router.get('/find/:name', async (req, res, next) => {

  try {
    const room = await Rooms.findOne({ name: req.params.name });
    res.status(200).json({ room });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }

  // if (!room) {
  //   res.status(404).json({ success: false, message: 'room not found' });
  // }
  // res.status(200).json({ room });

});

module.exports = Router;
