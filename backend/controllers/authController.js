import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import sendEmail from '../utils/sendEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        });

        res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, firstName, lastName, email, role } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Remove any previous OTPs for this user
        await Otp.destroy({ where: { userId: user.id } });
        // Save new OTP
        await Otp.create({ userId: user.id, code: otpCode, expiresAt }); 

        // Send OTP via email
        await sendEmail(user.email, 'Your OTP Code', `Your OTP code is ${otpCode}`);

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const otpEntry = await Otp.findOne({ where: { userId: user.id, code: otp } });
        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (otpEntry.expiresAt < new Date()) {
            await otpEntry.destroy();
            return res.status(400).json({ message: 'OTP expired' });
        }
        await otpEntry.destroy();
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ token });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};
