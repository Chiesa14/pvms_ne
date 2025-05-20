// utils/sendNotification.js
import Notification from '../models/Notification.js';

const sendNotification = async (userId, message, type = 'other') => {
  await Notification.create({
    userId: userId,
    message,
    type,
  });
};

export default sendNotification;
