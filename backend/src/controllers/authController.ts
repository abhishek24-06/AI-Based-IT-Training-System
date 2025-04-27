import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '../types/enums';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { fullName, email, password, role = Role.STUDENT } = req.body;

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = userRepository.create({
        fullName,
        email,
        password: hashedPassword,
        role
      });

      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response) {
    // In a stateless JWT setup, client-side logout is sufficient
    res.json({ message: 'Logged out successfully' });
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await userRepository.findOne({ 
        where: { id: req.user.userId },
        select: ['id', 'fullName', 'email', 'role', 'isActive', 'lastLogin', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await userRepository.findOne({ where: { id: req.user.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    // Implement forgot password logic here
    res.status(501).json({ message: 'Not implemented' });
  }

  async resetPassword(req: Request, res: Response) {
    // Implement reset password logic here
    res.status(501).json({ message: 'Not implemented' });
  }
} 