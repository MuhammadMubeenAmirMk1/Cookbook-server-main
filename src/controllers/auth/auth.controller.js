const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user.model'); // Mongoose User model
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: 'error', message: 'Email already in use' });
    }

    const user = new User({ name, email, password });
    const payload = await user.save();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      payload,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error.message || error,
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: 'error', message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      payload: { token },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to log in',
      error: error.message || error,
    });
  }
};

module.exports = {
  register,
  signIn,
};
