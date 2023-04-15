const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'mysecretkey';

const  User  = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, contact, role } = req.body;
    const user = new User({ name, email, password, contact, role });
    await user.save();
    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) throw new Error('Invalid email or password');
    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User not found');
    const { name, password, contact } = req.body;
    user.name = name || user.name;
    user.password = password || user.password;
    user.contact = contact || user.contact;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');
  const token = authHeader.split(' ')[1];
  jwt.verify(token, secretKey, (err, payload) => {
    if (err) return res.status(401).send('Unauthorized');
    req.user = { id: payload.id, role: payload.role };
    next();
  });
}

router.get('/', (req, res) => {
  res.send("auth app")
})

module.exports = router;
