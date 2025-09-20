import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { supabase } from '../config/database';
import { generateToken } from '../middleware/auth';
import { ApiResponse, User, RegisterRequest, LoginRequest } from '../../shared/types';

export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array().map(err => err.msg).join(', ')
      };
      return res.status(400).json(response);
    }

    const { email, password, userType, profile }: RegisterRequest = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User with this email already exists'
      };
      return res.status(409).json(response);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        user_type: userType,
        profile: profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create user'
      };
      return res.status(500).json(response);
    }

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      userType: newUser.user_type
    });

    const response: ApiResponse<{ user: Partial<User>; token: string }> = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          userType: newUser.user_type,
          profile: newUser.profile
        },
        token
      },
      message: 'User registered successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array().map(err => err.msg).join(', ')
      };
      return res.status(400).json(response);
    }

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    });

    const response: ApiResponse<{ user: Partial<User>; token: string }> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          profile: user.profile
        },
        token
      },
      message: 'Login successful'
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};