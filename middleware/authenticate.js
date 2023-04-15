const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authenticate = (roles) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    if (!roles.includes(user.role)) throw new Error('Unauthorized access');
    req.user = user;
    res.send(user);
    next();
  } catch (error) {
    res.status(401).send(error.message);
  }
};

module.exports = authenticate;
