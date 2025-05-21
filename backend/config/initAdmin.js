import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function initializeAdmin() {
    try {
        // Check for existing admin using email only
        const [adminUser, created] = await User.findOrCreate({
            where: {
                email: 'usanasequeen@gmail.com',
            },
            defaults: {
                email: 'usanasequeen@gmail.com',
                password: await bcrypt.hash('123456', 10),
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
            }
        });

        if (created) {
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
}