import { User } from '../models/user.model.js';
import { signupSchema, loginSchema } from '../utils/userValidation.js';
import jwt from 'jsonwebtoken';

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            success: false,
            message: error.details[0].message,
            field: error.details[0].path[0]
        });
    }
    next();
};

const sendTokensAndResponse = async (res, user, statusCode, message) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 10 * 24 * 60 * 60 * 1000, 
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, 
    });

    const safeUser = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin, 
    };

    return res.status(statusCode).json({
        success: true,
        message,
        user: safeUser,
    });
};

export const signup = [
    validate(signupSchema),
    async (req, res, next) => {
        try {
            const { fullName, email, password } = req.body;
            
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ 
                    success: false,
                    message: 'Email already registered.' 
                });
            }

            const newUser = new User({ 
                fullName: fullName.trim(), 
                email: email.toLowerCase(), 
                password 
            });

            await newUser.save();

            return sendTokensAndResponse(res, newUser, 201, 'User registered successfully.');
        } catch (error) {
            next(error);
        }
    }
];

export const login = [
    validate(loginSchema),
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            
            const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid email or password.' 
                });
            }

            if (!user.password) {
                return res.status(400).json({ 
                    success: false,
                    message: 'This account uses OAuth login. Please use the appropriate login method.' 
                });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid email or password.' 
                });
            }

            user.lastLogin = new Date();
            return sendTokensAndResponse(res, user, 200, 'Login successful.');
        } catch (error) {
            next(error);
        }
    }
];

export const refreshToken = async (req, res, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({ 
                success: false,
                message: 'No refresh token provided.' 
            });
        }

        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decoded._id).select('+refreshToken');
        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired refresh token. Please login again.' 
            });
        }

        const newAccessToken = user.generateAccessToken();
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000, 
        });

        const safeUser = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin, 
        };

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            user: safeUser,
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid refresh token signature.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Refresh token expired. Please login again.' 
            });
        }
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            const user = await User.findOne({ refreshToken }).select('+refreshToken');
            if (user) {
                user.refreshToken = null;
                await user.save({ validateBeforeSave: false }); 
            }
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        
        return res.status(200).json({ 
            success: true,
            message: 'Logged out successfully.' 
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id); 
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found.' 
            });
        }

        const safeUser = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatar:user.avatar,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        return res.status(200).json({ 
            success: true,
            message: 'Profile retrieved successfully.',
            user: safeUser 
        });
    } catch (error) {
        next(error);
    }
};