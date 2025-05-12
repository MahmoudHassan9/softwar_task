const express = require('express');
const User = require('../models/users');
const Router = express.Router();
const bcrypt = require('bcryptjs');

Router.get('/', async (req, res, next) => {
    const userList = await User.find().select('-_id name email phone');
    if (!userList) {
      res.status(505).json({ success: true });
    }
    else res.send(userList);
  }

);
Router.post('/', async (req, res, next) => {
  try {
    let user = new User({
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      ...req.body
    })
    user = await user.save();
    if (!user) res.status(505).send('user cannot be created');

    res.send(user);
  }
  catch (err) {
    next(err);
  }
});
Router.post('/register', async (req, res, next) => {
  try {
    let user = new User({
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      ...req.body
    });

    user = await user.save();

    if (!user) return res.status(500).send('User cannot be created');

    res.send(user);

  } catch (err) {
    next(err);
  }
});


Router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone isAdmin');
    if (!user) {
      res.status(505).json({ success: false });
    }
    else res.send(user);
  }
  catch (err) {
    next(err);
  }
})

Router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('user not found');
    }
    else {
      if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {

        return res.status(200).send({
          user: user.email,
          phone: user.phone
        });
      }
      else
        return res.status(400).send('password is wrong')
    }
  }
  catch (err) {
    next(err);
  }
})

Router.get('/get/count', async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).send({ userCount });
  } catch (err) {
    next(err);
  }
});



Router.delete('/:ID', (req, res, next) => {
  try {
    User.findByIdAndDelete(req.params.ID).then(user => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: "deleted successfully"
        })
      }
      else {
        return res.status(404).json({
          success: false,
          message: "user not found"
        })
      }
    }).catch(err => {
      return res.status(400).json({
        success: false
        , error: err
      })
    })
  }
  catch (err) {
    next(err);
  }
})
Router.get('/find/:name', async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      res.status(501).json({ success: false });
    }
    else res.status(200).json({ user: user });
  }
  catch (err) {
    next(err);
  }
})

module.exports = Router