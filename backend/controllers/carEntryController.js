import CarEntry from '../models/CarEntry.js';
import ParkingSlot from '../models/ParkingSlot.js';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import sendEmail from '../utils/sendEmail.js';

// Helper to generate a unique ticket number
function generateTicketNumber() {
    return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Calculate duration between two dates
const calculateDuration = (entryTime, exitTime) => {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const durationMs = exit.getTime() - entry.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

export const registerCarEntry = async (req, res) => {
    try {
        const { plate_number, parking_code } = req.body;
        if (!plate_number || !parking_code) {
            return res.status(400).json({ message: 'plate_number and parking_code are required' });
        }
        const slot = await ParkingSlot.findOne({ where: { code: parking_code } });
        if (!slot) return res.status(404).json({ message: 'Parking slot not found' });
        if (slot.available_spaces <= 0) return res.status(400).json({ message: 'No available spaces' });
        const ticket_number = generateTicketNumber();
        const entry = await CarEntry.create({
            plate_number,
            parking_code,
            entry_time: new Date(),
            exit_time: null,
            amount: 0,
            ticket_number,
        });
        await slot.update({ available_spaces: slot.available_spaces - 1 });
        console.log(`Car entry registered: ${plate_number}, ticket: ${ticket_number}`);
        res.status(201).json({ message: 'Car entry registered', entry });
    } catch (err) {
        console.error('Car entry error:', err);
        res.status(500).json({ message: 'Error registering car entry' });
    }
};

export const registerCarExit = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await CarEntry.findByPk(id);
        if (!entry) return res.status(404).json({ message: 'Car entry not found' });
        if (entry.exit_time) return res.status(400).json({ message: 'Car already exited' });
        const slot = await ParkingSlot.findOne({ where: { code: entry.parking_code } });
        if (!slot) return res.status(404).json({ message: 'Parking slot not found' });
        const exit_time = new Date();
        const durationMs = exit_time - entry.entry_time;
        const hours = Math.ceil(durationMs / (1000 * 60 * 60));
        const amount = parseFloat(slot.fee_per_hour) * hours;
        await entry.update({ exit_time, amount });
        await slot.update({ available_spaces: slot.available_spaces + 1 });
        console.log(`Car exit registered: ${entry.plate_number}, amount: ${amount}`);

        let emailSent = false;
        try {
            // Get user email from the authenticated user
            const user = await User.findByPk(req.user.userId);
            if (user) {
                const entryTime = new Date(entry.entry_time);
                const exitTime = new Date(exit_time);
                const duration = calculateDuration(entry.entry_time, exit_time);

                // Prepare email content
                const emailContent = `
                    <h2>Parking Receipt</h2>
                    <p>Thank you for using our parking service!</p>
                    
                    <div style="margin: 20px 0;">
                        <p><strong>Ticket Number:</strong> ${entry.ticket_number}</p>
                        <p><strong>Vehicle:</strong> ${entry.plate_number}</p>
                        <p><strong>Parking Slot:</strong> ${entry.parking_code}</p>
                        <p><strong>Entry Time:</strong> ${entryTime.toLocaleString()}</p>
                        <p><strong>Exit Time:</strong> ${exitTime.toLocaleString()}</p>
                        <p><strong>Duration:</strong> ${duration}</p>
                        <p><strong>Total Amount:</strong> ${amount} rwf</p>
                    </div>

                    <p>Please keep this receipt for your records.</p>
                    <p>Thank you for your business!</p>
                `;

                // Send email
                await sendEmail(
                    user.dataValues.email,
                    "Your Parking Receipt",
                    emailContent,
                );
                console.log(`Bill sent to ${user.dataValues.email}`);
                emailSent = true;
            }
        } catch (error) {
            console.error("Error sending email:", error);
            // Continue with the response even if email fails
        }

        res.status(200).json({
            message: 'Car exit registered',
            bill: { duration_hours: hours, amount },
            entry,
            emailSent
        });
    } catch (err) {
        console.error('Car exit error:', err);
        res.status(500).json({ message: 'Error registering car exit' });
    }
};

export const listCarEntries = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        if (search) {
            where[Op.or] = [
                { plate_number: { [Op.iLike]: `%${search}%` } },
                { parking_code: { [Op.iLike]: `%${search}%` } },
            ];
        }
        const { count, rows } = await CarEntry.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['entry_time', 'DESC']],
        });
        res.json({ total: count, page: parseInt(page), limit: parseInt(limit), entries: rows });
    } catch (err) {
        console.error('List car entries error:', err);
        res.status(500).json({ message: 'Error listing car entries' });
    }
}; 