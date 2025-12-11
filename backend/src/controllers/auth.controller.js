const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const {use} = require("express/lib/application");

exports.register = async (req, res) => {
  try {
    const { username, email, password, role, department, active } = req.body;

    // Check for existing email
    const existingUserByEmail = await User.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        status: false, 
        message: 'Email already exists' 
      });
    }

    // Check for existing username
    const existingUserByUsername = await User.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ 
        status: false, 
        message: 'Username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create(username, email, hashedPassword, role, department, active);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      status: true, 
      message: 'User registered successfully', 
      data: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false, 
      message: `Registration failed: ${error.message}` 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        status: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Only allow email for login
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user account is active
    if (!user.active) {
      return res.status(403).json({ 
        status: false, 
        message: 'Account is inactive. Please contact administrator.' 
      });
    }

    // Use bcrypt for all users
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ 
        status: false, 
        message: 'Invalid credentials' 
      });
    }

    await User.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ 
      status: true, 
      message: 'Login successful', 
      data: {
        user: userWithoutPassword,
        token: token
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: false, 
      message: `Login failed: ${error.message}` 
    });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    
    // Return users in the data field for consistency with other APIs
    res.status(200).json({
      status: true, 
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: false, 
      message: `Server Error: ${error.message}`
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: false, 
        message: 'User not found'
      });
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      status: true, 
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      status: false, 
      message: `Server Error: ${error.message}`
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.updateUserById(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ 
        status: false, 
        message: 'User not found' 
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({ 
      status: true, 
      message: 'User updated successfully', 
      data: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false, 
      message: `Update failed: ${error.message}` 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedUser = await User.deleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({ 
        status: false, 
        message: 'User not found' 
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = deletedUser;
    
    res.json({ 
      status: true, 
      message: 'User deleted successfully', 
      data: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ 
      status: false, 
      message: `Delete failed: ${error.message}` 
    });
  }
};