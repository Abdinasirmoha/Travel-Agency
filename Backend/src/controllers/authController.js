import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'elitetravel_super_secret_key_123!';

// Setup a default admin user if none exist
export const setupAdmin = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(400).json({ message: 'Admin user already exists. Cannot run setup.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      name: 'Alex Sterling',
      email: 'admin@elitetravel.com',
      password: hashedPassword,
      jobTitle: 'System Administrator',
      isSystemUser: true,
      permissions: {
        all: { view: true, create: true, edit: true, delete: true }
      }
    });

    await adminUser.save();
    res.status(201).json({ message: 'Default admin user created successfully!', email: 'admin@elitetravel.com' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the user has a password (they might have been created before the auth system)
    if (!user.password) {
      // If the user doesn't have a password set, let's treat it as invalid for security
      // unless we want to allow passwordless login for legacy users, but we shouldn't.
      return res.status(401).json({ message: 'Account needs setup. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        isSystemUser: user.isSystemUser
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current logged-in user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle,
      isSystemUser: user.isSystemUser,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
