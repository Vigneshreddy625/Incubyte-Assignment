import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        avatar: {
            type: String,
            default: null,
        },
        refreshToken: {
            type: String,
            select: false,
        },
        lastLogin: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase().trim();
    }

    if (!this.isModified('password') || !this.password) return next();

    try {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;

    try {
        const userWithPassword = await this.model('User')
            .findById(this._id)
            .select('+password');
        if (!userWithPassword) return false;

        return await bcrypt.compare(candidatePassword, userWithPassword.password);
    } catch (error) {
        console.error("Password comparison error:", error);
        throw new Error('Password comparison failed');
    }
};

UserSchema.methods.generateAccessToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id.toString(),
                email: this.email,
                fullName: this.fullName,
                role: this.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
                issuer: 'your-app-name',
                audience: 'your-app-users',
            }
        );
    } catch (error) {
        console.error("Access token generation error:", error);
        throw new Error('Access token generation failed');
    }
};

UserSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            { _id: this._id.toString() },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
                issuer: 'your-app-name',
                audience: 'your-app-users',
            }
        );
    } catch (error) {
        console.error("Refresh token generation error:", error);
        throw new Error('Refresh token generation failed');
    }
};

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

const User = mongoose.model('User', UserSchema);

export { User };