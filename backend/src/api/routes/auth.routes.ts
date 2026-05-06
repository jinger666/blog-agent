import { Router } from 'express';
import { asyncHandler, AppError } from '../../middleware/errorHandler';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

// Generate JWT token
const generateToken = (user: any): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// POST /api/auth/register - Register new user
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new AppError('User with this email or username already exists', 409);
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      passwordHash: password,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// GET /api/auth/me - Get current user profile
router.get('/me', asyncHandler(async (req: any, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  try {
    const decoded: any = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error: any) {
    throw new AppError('Invalid token', 401);
  }
}));

export default router;
