const jwt = require('jsonwebtoken');
const  User  = require('../models/User');

// const authenticate = (roles) => async (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     // console.log(decoded.role);
//     const userfound = await User.findById(decoded.id);
    
//     // console.log(roles)
//     if (!userfound) throw new Error('User not found');
//     if (!roles.includes(userfound.role)) throw new Error('Unauthorized access');
//     req.user = userfound;
//     // res.send(userfound);
//     next();
//   } catch (error) {
//     res.status(401).send(error.message);
//   }
// };

const authenticate = (roles) => async (req, res, next) => {
  try {
    console.log("hi")
    // Retrieve token from the cookie
    const token = req.cookies.token;
    if (!token) throw new Error('Unauthorized access');

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userfound = await User.findById(decoded.id);
    
    if (!userfound) throw new Error('User not found');
    if (!roles.includes(userfound.role)) throw new Error('Unauthorized access');
    req.user = userfound;
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

module.exports = authenticate;
