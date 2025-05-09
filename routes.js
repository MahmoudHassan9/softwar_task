const express = require("express");
const Router = express.Router();
var Rooms = require("./rooms"); // Assuming users is an array of user objects
const mongoose = require("mongoose");


Router.post("/addRoom", async (req, res) => {
    const room = new Rooms({ ...req.body });
    await room.save().then(() => {
        res.status(201).json({ message: "room added successfully", room: room });
    })


});

// Update room (PUT)
Router.put("/updateRoom/:id", async (req, res) => {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid room ID");
    }

    try {
        const room = await Rooms.findByIdAndUpdate(id, { ...req.body }, { new: true });

        if (!room) {
            return res.status(404).send("Room not found");
        }

        res.send(room);
    } catch (err) {
        console.error(err); // Add this to see the real error in the console
        res.status(500).send("Error updating room");
    }
});

Router.delete("/deleteRoom/:id", async (req, res) => {

    try {
        const room = await Rooms.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(400).send('The room is not found');
        }
        else
            res.send(room);
    } catch (err) {
        res.status(500).send("Error deleting room")
    }

});

Router.get("/getRooms", async (req, res) => {
    const roomList = await Rooms.find();
    res.status(201).json({ rooms: roomList });
});

Router.get("/getSingleRoom/:id", async (req, res) => {
    const userId = req.params.id;
    console.log(userId);

    const user = await Rooms.findById(userId);
    console.log(user);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // ✅ Only one response is sent
});

module.exports = Router;
